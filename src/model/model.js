import SQL from 'sql-template-strings';

import { concatValues } from '../helpers';

const makeExec = ({ connect, log }) => (action, query) => connect()
  .then(db => {
    if (log) {
      log({ db, action, query });
    }

    return db[action](query)
  });

const makeQueries = ({ fields, table }) => {
  const fieldsList = fields.join(', ');

  const raw = {
    insertOrReplace: `INSERT OR REPLACE INTO ${table} (${fieldsList}) VALUES `,
    select: `SELECT ${fieldsList} FROM ${table}`
  };


  return {
    raw,
    insertOrReplace: () => SQL``.append(raw.insertOrReplace),
    select: () => SQL``.append(raw.select)
  };
};

const makeGetter = ({ exec, queries, primaryKey, orderBy }) => {
  const allByProps = (props) => exec(
    'all',
    queries.select()
      .append(concatValues(
        Object.keys(props),
        field => {
          const fieldQuery = SQL` `.append(field);
          const value = props[field];
          if (Array.isArray(value)) {
            fieldQuery
              .append(' IN (')
              .append(concatValues(value))
              .append(') ');
          } else {
            fieldQuery.append(SQL`=${value}`)
          }

          return fieldQuery;
        },
        index => index === 0 ? ' WHERE ' : ' AND '
      )).append(orderBy)
  );

  return {
    all: () => exec(
      'all',
      queries.select().append(orderBy)
    ),
    get: id => exec('get', queries.select()
      .append(' WHERE ' + primaryKey + '=')
      .append(SQL`${id}`)
    ),
    allByKeys: ids => {
      const query = queries.select()
        .append(' WHERE ' + primaryKey + ' IN (')
        .append(concatValues(ids))
        .append(')')
        .append(orderBy);

      return exec('all', query);
    },
    allByProps,
    getByProps: (...args) => allByProps(...args)
      .then(r => {
        if (r.length) {
          return r[0];
        }
      })
  };
};

const makeStore = ({ exec, queries, fields }) => {
  const getValues = (val) => SQL`(`
    .append(
      concatValues(fields, f => SQL`${val[f]}`)
    ).append(')');

  return {
    save: (item) => exec(
      'run',
      queries.insertOrReplace()
        .append(getValues(item))
    ).then(({ changes }) => changes === 1),

    saveAll: (items) => exec(
      'run',
      queries.insertOrReplace()
        .append(concatValues(items, getValues))
      ).then(({ changes }) => changes === items.length)
  }
};

/**
 * init model definition
 * @param {object} _ - all model information
 * @param {array} _.fields - fields list
 * @param {string} _.table - table name
 * @param {string} [_.primaryKey=rowId] primary key
 * @param {string} [_.orderBy=rowId] primary key
 *
 * @return {object}
 */
const init = ({ connect, log }) => (config) => {
  const {
    fields,
    table,
    primaryKey = 'rowid',
    orderBy = 'rowid'
  } = config;
  const exec = makeExec({ connect, log })
  const defaultOrder = ` ORDER BY ${orderBy}`;
  const queries = makeQueries({ fields, table });

  return {
    config,
    queries,
    ...makeGetter({ exec, queries, primaryKey, orderBy: defaultOrder }),
    ...makeStore({ exec, queries, fields })
  };
};

const Model = (connect) => ({
  init: init(connect)
});

export default Model;

import SQL from 'sql-template-strings';

import { concatValues } from '../helpers';

const makeExec = (connect) => (action, query) => connect()
  .then(db => db[action](query));

const makeQueries = ({ fields, table }) => {
  const fieldsList = fields.join(', ');

  return {
    insertOrReplace: () => SQL`INSERT OR REPLACE INTO `
      .append(table + '(' + fieldsList + ') VALUES'),
    select: () => SQL`SELECT `
      .append(fieldsList + ' FROM ' + table)
  };
};

const makeGetter = ({ exec, queries, primaryKey }) => ({
  all: () => exec(
    'all',
    queries.select()
  ),
  get: id => exec('get', queries.select()
    .append(' WHERE ' + primaryKey + '=')
    .append(SQL`${id}`)
  ),
  getAll: ids => {
    const query = queries.select()
      .append(' WHERE ' + primaryKey + ' IN (')
      .append(concatValues(ids))
      .append(')')

    return exec('all', query);
  },
  findBy: (field, value) => exec(
    'all',
    queries.select()
      .append(' WHERE ' + field + ' =')
      .append(SQL`${value}`)
  )
});

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
 *
 * @return {object}
 */
const init = (connect) => (config) => {
  const {
    fields,
    table,
    primaryKey = 'rowid',
  } = config;
  const exec = makeExec(connect)
  const queries = makeQueries({ fields, table });

  return {
    config,
    queries,
    ...makeGetter({ exec, queries, primaryKey }),
    ...makeStore({ exec, queries, fields })
  };
};

const Model = (connect) => ({
  init: init(connect)
});

export default Model;

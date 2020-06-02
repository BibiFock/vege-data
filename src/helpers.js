import SQL from 'sql-template-strings';

/**
 * transform array of items.
 * [1, 2, 3] => SQL'${1}, ${2}, ${3}';
 *
 * @param {array} items
 * @param {func} each function call for each elements
 *
 * @return object sql template string
 */
export const concatValues = (items, each) => {
  const query = SQL``;
  items.forEach(
    (item, index) => query
      .append(index > 0 ? ', ' : '')
      .append(each ? each(item) : SQL`${item}`)
  );
  return query;
};


import SQL from 'sql-template-strings';

/**
 * transform array of items.
 * [1, 2, 3] => SQL'${1}, ${2}, ${3}';
 *
 * @param {array} items
 * @param {func} each function call for each elements (by default add value)
 * @param {func} concat function call for each join action (by default add ', ')
 *
 * @return object sql template string
 */
export const concatValues = (
  items,
  each = (item) => SQL`${item}`,
  concat = index => index > 0 ? ', ' : '',
  query = SQL``
) => {
  items.forEach(
    (item, index) => query
      .append(concat(index))
      .append(each(item))
  );

  return query;
};


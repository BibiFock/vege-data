# vege-data
Simple ORM for nodejs, based on [sql-template-string](https://github.com/felixfbecker/node-sql-template-strings#readme) and [sqlite](https://github.com/kriasoft/node-sqlite#readme)

<!-- TOC -->
- [Usage](#usage)
  - [Connect to database](#connect-to-database)
    - [Connection](#connection)
    - [Migrations](#migrations)
    - [Model](#model)
        - [Definition](#definition)
        - [Usage](#usage-1)
    - [Helpers](#helpers)
- [Devlopment](#devlopment)
    - [Installation](#tnstallation)
    - [Tests](#tests)
- [License](#license)

<!-- TOC END -->


# Usage

## Connect to database
```js
const vegeData = VegeData({
  filename: <your sqlite filename>,
  // log every model requests
  queryLogger: ({ db, action, query }) => console.log({ db, action, query })
});
```

## Connection

__db__ is an [sqlite](https://github.com/kriasoft/node-sqlite#readme) object

```js
// get your connection and play with it.
vegeData.connect()
    .then(db => db.get(SELE..))
```
## Migrations
see [migrations part](https://github.com/kriasoft/node-sqlite#migrations) for more informations
```js
vegeData.migrate()
```

## Model

### Definition
```js
const model = vegeData.model.init({
    fields: ['id', 'name', 'status', ... ],
    table: <my table>,
    primaryKey: 'rowId' // by default
    orderBy: 'rowId ASC' // by default
})
```

### Usage

```js
// config details
model.config

// queries helpers
model.queries.raw.select // simple query select string
model.queries.select() // return sql-template-string object used for a standard select

model.queries.raw.insertOrReplace // simple inster or replace query string
model.queries.insertOrReplace() // return sql-template-string object used for save

// function
model.all() // return all component
model.allByKeys(ids);
model.allByProps({ field: value, otherField: [value1, value2] });
model.get(id);
model.save(data);
models.saveAll(datas)
```


## Helpers

```js
import { concatValues } from 'vege-data';

// concat value
model.queries.select()
 .append(' WHERE id IN (')
 .append(concatValues([1, 2, 3]))
 .append(')');

// custom element
const items = [{ id: 1}, { id: 2 }];
model.queries.select()
 .append(' WHERE id IN (')
 .append(concatValues(items, ({ id }) => id))
 .append(')');

// custom join
const conds = { name: 'goku', type: 'sayan' };
model.queries.select()
  .append(
    concatValues(
        Object.keys(conds),
        (key) => conds[key],
        (index) => i > 0 ? ' AND ' : ' WHERE '
    )
   )

```


# Development
## Installation

```sh
npm ci
```

## Tests
```sh
npm run test
```
and for validate everything before commit
```sh
npm run validate
```

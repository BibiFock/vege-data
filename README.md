# vege-data
Simple ORM for nodejs, based on [sql-template-string](https://github.com/felixfbecker/node-sql-template-strings#readme) and [sqlite](https://github.com/kriasoft/node-sqlite#readme)

<!-- TOC -->
- [Usage](#usage)
  - [Connect to database](#usage-connection)
    - [Connection](#usage-connection-get)
    - [Migrations](#usage-migrations)
    - [Model](#usage-model)
        - [Definition](#usage-model-definition)
        - [Usage](#usage-model-usage)
    - [Helpers](#usage-helpers)
- [Devlopment](#dev)
    - [Installation](#dev-install)
    - [Tests](#dev-tests)
- [License](#license)

<!-- TOC END -->


# Usage

## Connect to database
```js
const vegeData = VegeData({ filename: <your sqlite filename> });
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

### Defintion
```js
const model = vegeData.model.init({
    fields: ['id', 'name', 'status', ... ],
    table: <my table>,
    primaryKey: 'rowId' // by default
})
```

### Usage

```js
// config details
model.config

// queries helpers
model.queries.select() // return sql-template-string object used for a standard select
model.queries.insertOrReplace() // return sql-template-string object used for save

// function
model.all() // return all component
model.get(id);
model.getAll(ids);
model.findBy(field, value);
model.save(data);
models.saveAll(datas)
```


## Helpers

```js
import { helpers } from 'vege-data';

// concat value
model.queries.select()
 .append(' WHERE id IN (')
 .append(helpers.concatValue([1, 2, 3]))

// custom element
const items = [{ id: 1}, { id: 2 }];
model.queries.select()
 .append(' WHERE id IN (')
 .append(helpers.concatValue(items, ({ id }) => id))
 .append(')');

```


# Devlopment
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

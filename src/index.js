import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import model from './model/model';

import { concatValues } from './helpers';

export { concatValues };

export default ({ filename, queryLogger }) => {
  const dbParams = {
    filename,
    driver: sqlite3.Database
  };


  // eslint-disable-next-line no-unused-vars
  let db;
  const connect = async (db) => {
    if (!db) {
      db = await open(dbParams);
    }

    return db;
  }

  const migrate = () => connect()
    .then(db => db.migrate({ force: 'last' }));

  return {
    connect,
    model: model({ connect, log: queryLogger }),
    migrate
  };
};

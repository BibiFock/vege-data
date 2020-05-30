import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

import model from './model/model';

export default ({ filename }) => {
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
    .then(db => db.migrate({ force: 'last' }))
  // eslint-disable-next-line no-console
    .catch(e => console.error('Failed: ' + e.message));

  return {
    connect,
    model: model(connect),
    migrate
  };
};

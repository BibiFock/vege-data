import VegeData from 'index';

import { getTmpDb } from 'utils';

describe('Model->logger', () => {
  const queryLogger = jest.fn();

  let vegeData, db, model;
  beforeAll(async () => {
    vegeData = VegeData({
      filename: getTmpDb(),
      queryLogger
    });

    model = vegeData.model.init({
      table: 'characters',
      fields: ['name', 'type']
    });

    db = await vegeData.connect();

    await db.run(`
      CREATE TABLE characters (
        name TEXT NOT NULL PRIMARY KEY COLLATE NOCASE,
        type TEST COLLATE NOCASE
      );
    `);

    await db.run(`
      INSERT INTO characters (name, type)
      VALUES
        ('vegeta', 'sayan'),
        ('piccolo', 'namek'),
        ('sangoku', 'sayan'),
        ('bulma', 'human');
    `);
  });

  describe('model', () => {
    beforeEach(() => {
      queryLogger.mockClear();
    });

    describe('should call logger for every model queries', () => {
      it.each([
        ['get', 'vegeta'],
        ['all', ['vegeta', 'sangoku']]
      ])('%s', async (action, ...args) => {
        await model[action](...args);

        expect(queryLogger).toHaveBeenCalledWith(
          expect.objectContaining({
            db,
            action,
            query: expect.any(Object)
          })
        );
      });
    });
  });
});

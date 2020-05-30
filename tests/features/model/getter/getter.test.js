import VegeData from 'index';

import { getTmpDb } from 'utils';

describe('Model->getters', () => {
  let vegeData, db, model;
  beforeEach(async () => {
    vegeData = VegeData({ filename: getTmpDb() });

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

    model = vegeData.model.init({
      table: 'characters',
      fields: ['name', 'type']
    });
  });

  describe('all', () => {
    it('should return all elements in db', async () => {
      return Promise.all([
        db.get('SELECT count(*) total from characters'),
        model.all()
      ]).then(
        ([{ total }, res]) => {
          expect(res.length).toEqual(total);
        }
      );
    });
  });

  describe('get', () => {
    const result = { name: 'vegeta', type: 'sayan' };
    it('should return only filtred elements by id', () => {
      expect(model.get(1)).resolves.toEqual(result);
    });

    it('should take care of primary key', () => {
      model = vegeData.model.init({
        table: 'characters',
        fields: ['name', 'type'],
        primaryKey: 'name'
      });

      expect(model.get(result.name)).resolves.toEqual(result);
    });
  });

  describe('getAll', () => {
    const couple = [
      { name: 'bulma', type: 'human' },
      { name: 'vegeta', type:'sayan' }
    ];

    it('should return all asked ids', () => {
      expect(
        vegeData.model.init({
          table: 'characters',
          fields: ['name', 'type'],
          primaryKey: 'name'
        }).getAll(couple.map(({ name }) => name))
      ).resolves.toEqual(
        couple
      );
    });
  });
});

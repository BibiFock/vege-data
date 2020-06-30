import VegeData from 'index';

import { getTmpDb } from 'utils';

describe('Model->getters', () => {
  let vegeData, db, model;
  beforeAll(async () => {
    vegeData = VegeData({ filename: getTmpDb() });

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
      { name: 'vegeta', type:'sayan' },
      { name: 'bulma', type: 'human' }
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

  describe('findBy', () => {
    it('should return all element with a value', () => {
      expect(
        model.findBy('type', 'sayan')
      ).resolves.toEqual([
        { name: 'vegeta', type: 'sayan' },
        { name: 'sangoku', type: 'sayan' }
      ]);
    });
  });

  describe('orderBy, should sort answer for multiple response', () => {
    describe.each([
      'ASC',
      'DESC'
    ])('%s', (order) => {
      let model
      beforeAll(() => {
        model = vegeData.model.init({
          table: 'characters',
          fields: ['name', 'type'],
          orderBy: `name ${order}`,
          primaryKey: 'name'
        });
      });

      it.each([
        ['all', '', []],
        ['getAll', `WHERE name IN ('vegeta', 'goku')`, [['vegeta', 'goku']]],
        ['findBy', `WHERE type = 'sayan'`, ['type','sayan']]
      ])('%s', async (func, conds, args) => {
        const wanted = await db.all(`SELECT name, type FROM characters ${conds} ORDER BY name ${order}`),

        result = await model[func](...args);

        expect(result).toEqual(wanted);
      });
    });
  });
});

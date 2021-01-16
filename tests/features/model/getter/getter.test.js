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

  describe('allByKeys', () => {
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
        }).allByKeys(couple.map(({ name }) => name))
      ).resolves.toEqual(
        couple
      );
    });
  });

  describe('allByProps', () => {
    it('should return all elements with wanted props', () => {
      expect(
        model.allByProps({ type: 'sayan', name: 'sangoku' })
      ).resolves.toEqual([
        { name: 'sangoku', type: 'sayan' }
      ]);
    });

    it('should return handle array value', () => {
      expect(
        model.allByProps({ type: ['human', 'namek'] })
      ).resolves.toEqual([
        { name: 'piccolo', type: 'namek' },
        { name: 'bulma', type: 'human' }
      ]);
    });
  });

  describe('getByProps', () => {
    it('should return all elements with wanted props', () => {
      expect(
        model.getByProps({ type: 'sayan', name: 'sangoku' })
      ).resolves.toEqual({
        name: 'sangoku',
        type: 'sayan'
      });
    });

    it('should handle array value', () => {
      expect(
        model.getByProps({ type: ['human', 'namek'] })
      ).resolves.toEqual(
        { name: 'piccolo', type: 'namek' }
      );
    });

    it('should return false value when nothing found', () => {
      expect(
        model.getByProps({ type: 'another-fucking-alien' })
      ).resolves.toBeFalsy();
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
        ['allByKeys', `WHERE name IN ('vegeta', 'goku')`, [['vegeta', 'goku']]],
        ['allByProps', `WHERE type = 'sayan'`, { type: 'sayan' }]
      ])('%s', async (func, conds, args) => {
        const wanted = await db.all(`SELECT name, type FROM characters ${conds} ORDER BY name ${order}`);

        let result;
        if (Array.isArray(args)) {
          result = await model[func](...args);
        } else {
          result = await model[func](args);
        }

        expect(result).toEqual(wanted);
      });
    });
  });
});

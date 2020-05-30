import SQL from 'sql-template-strings';

import VegeData from 'index';

import { getTmpDb } from 'utils';

describe('Model->save', () => {
  let vegeData, db, model;
  beforeEach(async () => {
    vegeData = VegeData({ filename: getTmpDb() });

    db = await vegeData.connect();

    await db.run(`
      CREATE TABLE characters (
        name TEXT NOT NULL PRIMARY KEY COLLATE NOCASE,
        type TEXT COLLATE NOCASE,
        transformation TEXT COLLATE NOCASE
      );
    `);

    model = vegeData.model.init({
      table: 'characters',
      fields: ['name', 'type', 'transformation'],
      primaryKey: 'name'
    });
  });

  describe('save', () => {
    const result = {
      name: 'vegeta',
      type: 'sayan',
      transformation: 'sayan'
    };

    beforeEach(async () => {
      await db.run(SQL`DELETE from characters WHERE name=${result.name}`);
    });

    it('should insert data', async () => {
      expect(
        await model.get('vegeta')
      ).toEqual(undefined);

      expect(
        await model.save(result)
      ).toBe(true);

      expect(
        await model.get('vegeta')
      ).toEqual(result);
    });

    it('should update data', async () => {
      await model.save(result)

      const newState = { ...result, transformation: 'super sayan' };
      expect(
        await model.save(newState)
      ).toBe(true);

      expect(
        await model.get('vegeta')
      ).toEqual(newState);
    });
  });

  describe('saveAll', () => {
    describe('should handle in same time', () => {
      const data = [
        { name: 'sangoku',  type: 'sayan', transformation: 'super sayan god' },
        { name: 'sangohan', type: 'sayan-human', transformation: 'mystic' }
      ];

      let result;
      beforeEach(async () => {
        await db.run('DELETE FROM characters WHERE 1=1');

        await model.save({ name: 'sangoku', type: 'sayan' });

        expect(
          await model.saveAll(data)
        ).toBe(true);

        result = await model.getAll(
          data.map(({ name }) => name)
        );
      });

      it('insert', () => {
        expect(result).toContainEqual(data[1]);
      });

      it('update', () => {
        expect(result).toContainEqual(data[0]);
      });
    });
  });
});

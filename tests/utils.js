import os from 'os';
import path from 'path';

export const getTmpDb = () => path.join(
  os.tmpdir(),
  'db_' + Math.random()
);

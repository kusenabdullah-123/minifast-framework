import { Framework } from './src/core/Framework.js';
import { Router } from './src/core/Router.js';
import { fileURLToPath } from 'url';
import path from 'path';
import { Manager } from './src/core/database/Manager.js';
import { BiayaController } from './app/controllers/BiayaController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


Manager.add('main', {
  driver: 'mysql',
  host: 'mariadb.database',
  username: 'root',
  password: 'root',
  database: 'express',
});

Router.get('/biaya', [BiayaController, 'result']);
Router.get('/biaya/:idBiaya', [BiayaController, 'row']);
Router.post('/biaya', [BiayaController, 'insert']);
Router.patch('/biaya/:idBiaya', [BiayaController, 'update']);
Router.delete('/biaya/:idBiaya', [BiayaController, 'delete']);

await Framework.run();

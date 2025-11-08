import {Router, Framework, Manager} from './src/';
import cors from 'cors';

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { BiayaController } from './app/controllers/BiayaController.js';

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const specsPath = path.join(__dirname, './specs');
app.use('/specs', express.static(specsPath));

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

Framework.use(cors());

await Framework.run();

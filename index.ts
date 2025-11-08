import { Framework } from './src/core/Framework.js';
import { Router } from './src/core/Router.js';
import { HomeController } from './app/controllers/HomeController.js';
import { View } from './src/core/View.js';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

View.addPath(path.join(__dirname, 'themes'));

Router.get('/', [HomeController, 'index']);

await Framework.run();

import { View } from '../../src/core/View.js';

export class HomeController {
  async index(req: any, res: any) {
    await View.response(res, 'home', { title: 'Halaman Home' });
  }
}

import { BiayaModel } from '../models/BiayaModel.js';

export class BiayaController {
  private biayaModel = new BiayaModel();

  async result(req: any, res: any) {
    const data = await this.biayaModel.result();
    res.json({ success: true, data });
  }

  async row(req: any, res: any) {
    const { idBiaya } = req.params;
    const data = await this.biayaModel.row({ idBiaya });
    res.json({ success: true, data });
  }

  async insert(req: any, res: any) {
    const id = await this.biayaModel.insert(req.body);
    res.json({ success: true, id });
  }

  async update(req: any, res: any) {
    const { idBiaya } = req.params;
    const ok = await this.biayaModel.update(`idBiaya = ${idBiaya}`, req.body);
    res.json({ success: ok });
  }

  async delete(req: any, res: any) {
    const { idBiaya } = req.params;
    const ok = await this.biayaModel.delete(`idBiaya = ${idBiaya}`);
    res.json({ success: ok });
  }
}
import { Request, Response } from 'express';
import { BiayaModel } from '../models/BiayaModel.js';

export class BiayaController {
  private biayaModel = new BiayaModel();

  async result(req: Request, res: Response) {
    const data = await this.biayaModel.result();
    res.json({ success: true, data });
  }

  async row(req: Request, res: Response) {
    const { idBiaya } = req.params;
    const data = await this.biayaModel.row({ idBiaya });
    res.json(data);
  }

  async insert(req: Request, res: Response) {
    const preparedData = {
      nmBiaya: req.body.nmBiaya
    };
    const id = await this.biayaModel.insert(preparedData);
    res.status(201).json({ id });
  }

  async update(req: Request, res: Response) {
    const { idBiaya } = req.params;
    const preparedData = {
      nmBiaya: req.body.nmBiaya
    };
    const ok = await this.biayaModel.update(`idBiaya = ${idBiaya}`, preparedData);
    res.status(204).json(null);
  }

  async delete(req: Request, res: Response) {
    const { idBiaya } = req.params;
    const ok = await this.biayaModel.delete(`idBiaya = ${idBiaya}`);
    res.status(204).json(null);
  }
}
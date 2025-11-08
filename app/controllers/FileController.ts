import { inject } from '../../src/core/Factory.js';
import { FileModel } from '../models/FileModel.js';
import { HttpException } from '../../src/core/HttpException.js'

export class FileController {
  private fileModel: FileModel;

  constructor() {
    this.fileModel = inject(FileModel);
  }

  async index(req: any, res: any) {
   throw new HttpException('Not found', 404);
  }

  async row(req: any, res: any) {
    const file = this.fileModel.getById(req.params.id);
    res.json({ file });
  }
}

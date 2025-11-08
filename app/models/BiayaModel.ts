import { Manager } from '../../src/core/database/Manager';

export class BiayaModel {
  private db = Manager.get('main');

  async result(where: any = {}, order: any = {}, limit: number = -1, offset: number = 0) {
    if (limit > -1) this.db.limit(limit).offset(offset);

    const query = this.db
      .select('*')
      .where(where)
      .orderBy(order);

    const res = await query.get('biaya');
    return res.result();
  }

  async row(where: any) {
    const res = await this.db.select('*').where(where).get('biaya');
    return res.row();
  }

  async insert(data: Record<string, any>) {
    const id = await this.db.insert('biaya', data);
    return id;
  }

  async update(where: string, data: Record<string, any>) {
    const affected = await this.db.update('biaya', data, where);
    return affected > 0;
  }

  async delete(where: string) {
    const affected = await this.db.delete('biaya', where);
    return affected > 0;
  }
}

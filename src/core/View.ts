import path from 'path';
import fs from 'fs';
import ejs from 'ejs';

export class View {
  private static paths: string[] = [path.resolve('app/views')];

  static addPath(viewPath: string) {
    const resolved = path.resolve(viewPath);
    if (!this.paths.includes(resolved)) {
      this.paths.push(resolved);
      console.log(`🧩 View path added: ${resolved}`);
    }
  }

  private static findFile(file: string): string | null {
    for (const dir of this.paths) {
      const filePath = path.join(dir, file);
      if (fs.existsSync(filePath)) {
        return filePath;
      }
    }
    return null;
  }

  static async render(fileOrRes: any, data?: any, extra?: any): Promise<string | void> {
    if (typeof fileOrRes !== 'string') {
      // mode: View.render(res, file, data)
      const res = fileOrRes;
      const file = data;
      const ctx = extra || {};
      const html = await this.render(file, ctx);
      return res.status(200).send(html);
    }

    // mode: View.render(file, data)
    const file = fileOrRes;
    const ctx = data || {};
    const filePath = this.findFile(`${file}.ejs`);
    if (!filePath) throw new Error(`View not found: ${file}`);
    return await ejs.renderFile(filePath, ctx, { async: true });
  }

  static async response(res: any, file: string, data: Record<string, any> = {}, status = 200) {
    const html = await this.render(file, data);
    res.status(status).send(html);
  }

}

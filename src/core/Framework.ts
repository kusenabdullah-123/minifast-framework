import express, { Request, Response, NextFunction, Application } from 'express';
import { Injector } from './Injector.js';
import { Router } from './Router.js';

export class Framework {
  // 🧩 daftar middleware global
  private static globalMiddlewares: Array<express.RequestHandler> = [];

  /**
   * Tambah middleware global
   * Contoh:
   * Framework.use(cors());
   * Framework.use(express.urlencoded({ extended: true }));
   */
  static use(middleware: express.RequestHandler) {
    this.globalMiddlewares.push(middleware);
  }

  /**
   * Jalankan aplikasi express
   */
  static async run(port = process.env.PORT || 3000) {
    const app = express();
    app.use(express.json());

    // 🧩 Pasang semua middleware global lebih awal
    for (const mw of this.globalMiddlewares) {
      app.use(mw);
    }

    // 🧩 Daftarkan semua route dari Router
    for (const route of Router.routes) {
      const { method, path, handler, middlewares = [] } = route;

      (app as any)[method](path, async (req: Request, res: Response, next: NextFunction) => {
        try {
          let action = async () => {
            const knownParams = { req, res, next, ...req.params, ...req.body };
            const ref = await Injector.resolve(handler, knownParams);
            return await ref.cb(...ref.params);
          };

          // terapkan middleware per-route (dibalik urutan)
          for (const mw of (middlewares || []).reverse()) {
            const nextAction = action;
            action = async () => {
              const ref = await Injector.resolve(mw, { req, res, next: nextAction });
              return await ref.cb(...ref.params);
            };
          }

          await action();
        } catch (e) {
          next(e);
        }
      });
    }

    // 🧩 Global error handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('💥 Global Error Handler:', err);
      const status = err.status || 500;
      res.status(status).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      });
    });

    app.listen(port, () =>
      console.log(`✅ MiniFast running at http://localhost:${port}`)
    );
  }
}

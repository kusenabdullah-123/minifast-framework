// src/core/Framework.ts
import express, { Request, Response, NextFunction } from 'express';
import { Injector } from './Injector.js';
import { Router } from './Router.js';

export class Framework {
  static async run() {
    const app = express();
    app.use(express.json());

    for (const route of Router.routes) {
      const { method, path, handler, middlewares = [] } = route;

      (app as any)[method](path, async (req: Request, res: Response, next: NextFunction) => {
        try {
          let action = async () => {
            const knownParams = { req, res, next, ...req.params, ...req.body };
            const ref = await Injector.resolve(handler, knownParams);
            return await ref.cb(...ref.params);
          };

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

    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error('💥 Global Error Handler:', err);

      const status = err.status || 500;
        res.status(status).json({
          success: false,
          message: err.message || 'Internal Server Error',
          stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`✅ Express 5.1 running at http://localhost:${PORT}`));
  }
}

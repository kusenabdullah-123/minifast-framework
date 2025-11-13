// src/core/Framework.ts
import express, { Request, Response, NextFunction } from "express";
import { Injector } from "./Injector.js";
import { Router } from "./Router.js";

export class Framework {
  // 🧩 Global middleware list
  private static globalMiddlewares: Array<express.RequestHandler> = [];

  // 🧩 Static folders: { route: '/specs', dir: '/abs/path/specs' }
  private static staticFolders: Array<{ route: string; dir: string }> = [];

  /**
   * Tambahkan global middleware
   * Framework.use(cors());
   * Framework.use(express.urlencoded({ extended: true }));
   */
  static use(middleware: express.RequestHandler) {
    this.globalMiddlewares.push(middleware);
  }

  /**
   * Daftarkan folder static
   * Framework.static('/specs', '/User/project/specs');
   */
  static static(route: string, dir: string) {
    this.staticFolders.push({ route, dir });
  }

  /**
   * Jalankan aplikasi
   */
  static async run(port = process.env.PORT || 3000) {
    const app = express();

    // Body parser bawaan
    app.use(express.json());

    // 🧩 Apply global middleware
    for (const mw of this.globalMiddlewares) {
      app.use(mw);
    }

    // 🧩 Pasang static folder
    for (const folder of this.staticFolders) {
      console.log(`📁 Static mounted: ${folder.route} -> ${folder.dir}`);
      app.use(folder.route, express.static(folder.dir));
    }

    // 🧩 Pasang route dari Router
    for (const route of Router.routes) {
      const { method, path, handler, middlewares = [] } = route;

      (app as any)[method](path, async (req: Request, res: Response, next: NextFunction) => {
        try {
          let action = async () => {
            const knownParams = { req, res, next, ...req.params, ...req.body };
            const ref = await Injector.resolve(handler, knownParams);
            return await ref.cb(...ref.params);
          };

          // Apply route middlewares (backward)
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

    // 🧩 Global Error Handler
    app.use((err: any, req: Request, res: Response, next: NextFunction) => {
      console.error("💥 Global Error Handler:", err);
      const status = err.status || 500;
      res.status(status).json({
        success: false,
        message: err.message || "Internal Server Error",
        stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
      });
    });

    // Start server
    app.listen(port, () => {
      console.log(`🚀 MiniFast running at http://localhost:${port}`);
    });
  }
}

export interface RouteDef {
  method: string;
  path: string;
  handler: [new (...args: any[]) => any, string] | Function;
  middlewares?: ([new (...args: any[]) => any, string] | Function)[];
}

export class Router {
  static routes: RouteDef[] = [];

  static get(path: string, handler: RouteDef['handler']) {
    Router.routes.push({ method: 'get', path, handler });
  }

  static post(path: string, handler: RouteDef['handler']) {
    Router.routes.push({ method: 'post', path, handler });
  }

  static patch(path: string, handler: RouteDef['handler']) {
    Router.routes.push({ method: 'patch', path, handler });
  }

  static delete(path: string, handler: RouteDef['handler']) {
    Router.routes.push({ method: 'delete', path, handler });
  }

  static withMiddleware(middlewares: RouteDef['middlewares'], defineRoutes: () => void) {
    const start = Router.routes.length;
    defineRoutes();
    const newRoutes = Router.routes.slice(start);
    newRoutes.forEach((r) => (r.middlewares = middlewares));
  }
}

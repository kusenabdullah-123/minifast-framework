import { Factory } from './Factory.js';

export class Injector {
  private static getParamNames(func: Function): string[] {
    const match = func.toString().match(/constructor\s*\(([^)]*)\)/);
    if (!match) return [];
    return match[1]
      .split(',')
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }

  static getDependencies(ClassRef: any, knownParams: Record<string, any> = {}): any[] {
    const paramNames = Injector.getParamNames(ClassRef);
    return paramNames.map((name) => knownParams[name] ?? null);
  }

  static async resolve(
    callback: [new (...args: any[]) => any, string] | Function,
    knownParams: Record<string, any> = {}
  ): Promise<{ cb: Function; params: any[] }> {
    if (Array.isArray(callback)) {
      const [ClassRef, methodName] = callback;
      const instance: any = Factory.resolve(ClassRef);
      const method = instance[methodName].bind(instance);
      const params = Object.values(knownParams);
      return { cb: method, params };
    }

    const params = Object.values(knownParams);
    return { cb: callback as Function, params };
  }
}

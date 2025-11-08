import { Injector } from './Injector.js';

export class Factory {
  private static instances = new Map<any, any>();

  static resolve<T>(ClassRef: new (...args: any[]) => T, knownParams: Record<string, any> = {}): T {
    if (!Factory.instances.has(ClassRef)) {
      const deps = Injector.getDependencies(ClassRef, knownParams);
      const instance = new ClassRef(...deps);
      Factory.instances.set(ClassRef, instance);
    }
    return Factory.instances.get(ClassRef);
  }
}

export function inject<T>(ClassRef: new (...args: any[]) => T): T {
  return Factory.resolve(ClassRef);
}

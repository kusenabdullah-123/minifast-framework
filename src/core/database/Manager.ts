// src/core/database/Manager.ts
import { MySQLSchema } from "./MySQLSchema.js";

export class Manager {
  private static schemas: Record<string, MySQLSchema> = {};

  static add(name: string, config: any): void {
    if (!this.schemas[name]) {
      this.schemas[name] = new MySQLSchema(config);
    }
  }

  static get(name: string): MySQLSchema {
    const db = this.schemas[name];
    if (!db) throw new Error(`Database connection "${name}" not found.`);
    return db;
  }
}

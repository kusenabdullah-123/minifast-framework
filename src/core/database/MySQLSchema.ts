import mysql, { Pool, PoolConnection } from "mysql2/promise";
import { MySQLResult } from "./Result.js";

export class MySQLSchema {
  private pool: Pool;
  private conn: PoolConnection | null = null;

  private _select: string | null = null;
  private _where: string | null = null;
  private _order: string | null = null;
  private _offset: number | null = 0;
  private _limit: number | null = -1;
  private _join: string | null = null;
  private _group: string | null = null;

  constructor(private config: any) {
    this.pool = mysql.createPool({
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      port: config.port ?? 3306,
      connectionLimit: config.connectionLimit ?? 10,
    });
  }

  // ============================================================
  // TRANSACTION (SAMA persis seperti PHP Manager)
  // ============================================================

  async startTransaction() {
    if (!this.conn) this.conn = await this.pool.getConnection();
    await this.conn.beginTransaction();
    return true;
  }

  async commit() {
    if (!this.conn) return false;
    await this.conn.commit();
    this.conn.release();
    this.conn = null;
    return true;
  }

  async rollback() {
    if (!this.conn) return false;
    await this.conn.rollback();
    this.conn.release();
    this.conn = null;
    return true;
  }

  // ============================================================
  // INTERNAL HELPERS
  // ============================================================

  private reset() {
    this._select = null;
    this._where = null;
    this._order = null;
    this._offset = 0;
    this._limit = -1;
    this._join = null;
    this._group = null;
  }

  private escapeValue(val: any) {
    if (val === null) return "NULL";
    if (typeof val === "boolean") return val ? "1" : "0";
    return mysql.escape(val);
  }

  // ============================================================
  // QUERY BUILDER — PHP STYLE
  // ============================================================

  select(cols: string | string[]) {
    this._select = Array.isArray(cols) ? cols.join(",") : cols;
    return this;
  }

  where(condition?: string | any[]) {
    if (!condition) return this;

    let tmp = "";

    if (typeof condition === "string") {
      tmp = condition;
    } else if (Array.isArray(condition)) {
      condition.forEach((w, i) => {
        if (i !== 0) tmp += " AND ";
        if (typeof w === "string") tmp += w;
        else if (Array.isArray(w)) {
          if (w.length === 2) tmp += `${w[0]} = ${this.escapeValue(w[1])}`;
          if (w.length === 3) tmp += `${w[0]} ${w[1]} ${this.escapeValue(w[2])}`;
        }
      });
    }

    if (!this._where) this._where = `WHERE (${tmp})`;
    else this._where += ` AND (${tmp})`;

    return this;
  }

  orWhere(condition?: string | any[]) {
    if (!condition) return this;

    let tmp = "";

    if (typeof condition === "string") {
      tmp = condition;
    } else if (Array.isArray(condition)) {
      condition.forEach((w, i) => {
        if (i !== 0) tmp += " OR ";
        if (typeof w === "string") tmp += w;
        else if (Array.isArray(w)) {
          if (w.length === 2) tmp += `${w[0]} = ${this.escapeValue(w[1])}`;
          if (w.length === 3) tmp += `${w[0]} ${w[1]} ${this.escapeValue(w[2])}`;
        }
      });
    }

    if (!this._where) this._where = `WHERE (${tmp})`;
    else this._where += ` AND (${tmp})`;

    return this;
  }

  groupBy(cols: string | string[]) {
    this._group = `GROUP BY ${Array.isArray(cols) ? cols.join(",") : cols}`;
    return this;
  }

  leftJoin(tbl: string, cond: string) {
    this._join = (this._join ?? "") + ` LEFT JOIN ${tbl} ON ${cond}`;
    return this;
  }

  order(order: any) {
    if (!order) return this;
    const parts = Object.entries(order).map(([k, v]) => `${k} ${v}`);
    this._order = parts.length ? `ORDER BY ${parts.join(",")}` : null;
    return this;
  }

  limit(limit: number) {
    this._limit = limit;
    return this;
  }

  offset(offset: number) {
    this._offset = offset;
    return this;
  }

  // ============================================================
  // SQL BUILDER
  // ============================================================

  private buildSql(table?: string) {
    const s = this._select ? `SELECT ${this._select}` : "SELECT *";
    const f = table ? `FROM ${table}` : "";
    const j = this._join ?? "";
    const w = this._where ?? "";
    const g = this._group ?? "";
    const o = this._order ?? "";

    let limit = "";
    if (this._limit !== null && this._limit >= 0) {
      limit = `LIMIT ${this._limit}`;
      if (this._offset) limit += ` OFFSET ${this._offset}`;
    }

    const sql = [s, f, j, w, g, o, limit].filter(Boolean).join(" ");

    this.reset();
    return sql;
  }

  // ============================================================
  // HIGH LEVEL OPERATIONS (SAMA seperti PHP)
  // ============================================================

  async get(table?: string) {
    const sql = this.buildSql(table);
    const res = await this.query(sql);

    if (res instanceof MySQLResult) return res;
    return new MySQLResult([]);
  }

  async insert(table: string, data: Record<string, any>): Promise<boolean> {
    const cols = Object.keys(data);
    const vals = Object.values(data);
    const placeholders = cols.map(() => "?").join(",");

    const sql = `INSERT INTO ${table} (${cols.join(",")}) VALUES (${placeholders})`;

    const [res] = await this.pool.query(sql, vals);

    this.reset(); // FIX

    return (res as any).affectedRows > 0;
  }

  async update(table: string, data: Record<string, any>) {
    const parts = Object.entries(data).map(
      ([k, v]) => `${k} = ${this.escapeValue(v)}`
    );

    const where = this._where ?? "";
    const sql = `UPDATE ${table} SET ${parts.join(", ")} ${where}`;

    const res = await this.query(sql);

    this.reset(); // FIX

    return res;
  }

  async delete(table: string) {
    const where = this._where ?? "";
    const sql = `DELETE FROM ${table} ${where}`;

    const res = await this.query(sql);

    this.reset(); // FIX

    return res;
  }

  async query(sql: string) {
    const executor = this.conn ?? this.pool;
    const [rows] = await executor.query(sql);

    if (Array.isArray(rows)) return new MySQLResult(rows);
    return new MySQLResult([]);
  }

  async lastId(): Promise<number> {
    const [rows] = await this.pool.query("SELECT LAST_INSERT_ID() AS lastid");
    return (rows as any)[0].lastid;
  }
}

import mysql from "mysql2/promise";
import { MySQLResult } from "./Result.js";

export class MySQLSchema {
  private pool: mysql.Pool;

  private _select = "*";
  private _from = "";
  private _join = "";
  private _where = "";
  private _group = "";
  private _order = "";
  private _limit = -1;
  private _offset = 0;

  constructor(private config: any) {
    this.pool = mysql.createPool({
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      port: config.port || 3306,
      waitForConnections: true,
      connectionLimit: config.connectionLimit || 10,
    });
  }

  // -------------------------
  //  QUERY BUILDER METHODS
  // -------------------------

  select(cols: string | string[]) {
    this._select = Array.isArray(cols) ? cols.join(", ") : cols;
    return this;
  }

  from(table: string | null) {
    if (table) this._from = table;
    return this;
  }

  where(condition?: string | Record<string, any> | Array<any>) {
    if (!condition) {
      this._where = "";
      return this;
    }

    const clauses: string[] = [];

    if (typeof condition === "string") {
      if (condition.trim()) clauses.push(condition);
    }

    else if (Array.isArray(condition)) {
      for (const w of condition) {
        if (typeof w === "string") clauses.push(w);
        if (Array.isArray(w)) {
          if (w.length === 2)
            clauses.push(`${w[0]} = ${mysql.escape(w[1])}`);
          if (w.length === 3)
            clauses.push(`${w[0]} ${w[1]} ${mysql.escape(w[2])}`);
        }
      }
    }

    else if (typeof condition === "object") {
      for (const [k, v] of Object.entries(condition)) {
        clauses.push(`${k} = ${mysql.escape(v)}`);
      }
    }

    this._where = clauses.length ? `WHERE (${clauses.join(" AND ")})` : "";
    return this;
  }

  orWhere(condition?: string | Array<any>) {
    if (!condition) return this;

    const clauses: string[] = [];

    if (typeof condition === "string") clauses.push(condition);

    else if (Array.isArray(condition)) {
      for (const w of condition) {
        if (typeof w === "string") clauses.push(w);
        if (Array.isArray(w)) {
          if (w.length === 2)
            clauses.push(`${w[0]} = ${mysql.escape(w[1])}`);
          if (w.length === 3)
            clauses.push(`${w[0]} ${w[1]} ${mysql.escape(w[2])}`);
        }
      }
    }

    if (clauses.length) {
      this._where = this._where
        ? `${this._where} OR (${clauses.join(" OR ")})`
        : `WHERE (${clauses.join(" OR ")})`;
    }

    return this;
  }

  leftJoin(tbl: string, cond: string) {
    this._join += ` LEFT JOIN ${tbl} ON ${cond}`;
    return this;
  }

  innerJoin(tbl: string, cond: string) {
    this._join += ` INNER JOIN ${tbl} ON ${cond}`;
    return this;
  }

  groupBy(cols: string | string[]) {
    this._group = `GROUP BY ${Array.isArray(cols) ? cols.join(", ") : cols}`;
    return this;
  }

  orderBy(cols?: string | Record<string, string>) {
    if (!cols || (typeof cols === "object" && !Object.keys(cols).length)) {
      this._order = "";
      return this;
    }

    if (typeof cols === "string") {
      this._order = `ORDER BY ${cols}`;
    } else {
      const parts = Object.entries(cols).map(([k, v]) => `${k} ${v}`);
      this._order = `ORDER BY ${parts.join(", ")}`;
    }
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

  // -------------------------
  //  SQL BUILDER
  // -------------------------
  private buildSql() {
    const segments: string[] = [
      `SELECT ${this._select}`,
      this._from ? `FROM ${this._from}` : "",
      this._join,
      this._where,
      this._group,
      this._order,
    ];

    if (this._limit >= 0) {
      segments.push(`LIMIT ${this._limit}`);
      if (this._offset > 0) segments.push(`OFFSET ${this._offset}`);
    }

    const sql = segments.filter(Boolean).join(" ");
    this.reset();
    return sql;
  }

  getSql(table?: string) {
    if (table) this._from = table;
    return this.buildSql();
  }

  private reset() {
    this._select = "*";
    this._from = "";
    this._join = "";
    this._where = "";
    this._group = "";
    this._order = "";
    this._limit = -1;
    this._offset = 0;
  }

  // -------------------------
  //  EXECUTION
  // -------------------------

  async get(table?: string) {
    if (table) this._from = table;
    const sql = this.buildSql();
    const [rows] = await this.pool.query(sql);

    if (Array.isArray(rows)) return new MySQLResult(rows);

    return rows;
  }

  async insert(table: string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => "?").join(", ");

    const sql = `INSERT INTO ${table} (${keys.join(", ")}) VALUES (${placeholders})`;
    const [res]: any = await this.pool.query(sql, values);

    return res.insertId;
  }

  async update(table: string, data: Record<string, any>, where: string) {
    const keys = Object.keys(data);
    const set = keys.map((k) => `${k} = ?`).join(", ");

    const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
    const [res]: any = await this.pool.query(sql, Object.values(data));

    return res.affectedRows;
  }

  async delete(table: string, where: string) {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const [res]: any = await this.pool.query(sql);

    return res.affectedRows;
  }

  async query(sql: string) {
    const [rows] = await this.pool.query(sql);

    if (Array.isArray(rows)) return new MySQLResult(rows);
    return rows;
  }

  // -------------------------
  // TRANSACTION SUPPORT
  // -------------------------

  async startTransaction() {
    const conn = await this.pool.getConnection();
    await conn.beginTransaction();
    return conn;
  }

  async commit(conn: mysql.PoolConnection) {
    await conn.commit();
    conn.release();
  }

  async rollback(conn: mysql.PoolConnection) {
    await conn.rollback();
    conn.release();
  }
}

import mysql from 'mysql2/promise';
import { Result } from './Result.js';

export class MySQLSchema {
  private pool: mysql.Pool;
  private _select = '*';
  private _from = '';
  private _join = '';
  private _where = '';
  private _group = '';
  private _order = '';
  private _limit = -1;
  private _offset = 0;

  constructor(private config: any) {
    this.pool = mysql.createPool({
      host: config.host,
      user: config.username,
      password: config.password,
      database: config.database,
      port: config.port || 3306,
      connectionLimit: config.connectionLimit || 10,
    });
  }

  select(cols: string | string[]) {
    this._select = Array.isArray(cols) ? cols.join(', ') : cols;
    return this;
  }

  from(table: string) {
    this._from = table;
    return this;
  }

  orderBy(cols?: string | Record<string, string>) {
    // ❗ abaikan jika kosong/undefined
    if (
      !cols ||
      (typeof cols === 'object' && Object.keys(cols).length === 0)
    ) {
      this._order = '';
      return this;
    }

    if (typeof cols === 'string') {
      this._order = `ORDER BY ${cols}`;
    } else {
      const parts = Object.entries(cols).map(([k, v]) => `${k} ${v}`.trim());
      this._order = parts.length ? `ORDER BY ${parts.join(', ')}` : '';
    }
    return this;
  }

  where(condition?: string | Record<string, any>) {
    if (!condition) {
      this._where = '';
      return this;
    }
    if (typeof condition === 'string') {
      const val = condition.trim();
      this._where = val ? `WHERE ${val}` : '';
    } else {
      const parts = Object.entries(condition).map(
        ([k, v]) => `${k} = ${mysql.escape(v)}`
      );
      this._where = parts.length ? `WHERE ${parts.join(' AND ')}` : '';
    }
    return this;
  }

  leftJoin(tbl: string, cond: string) {
    this._join += ` LEFT JOIN ${tbl} ON ${cond}`;
    return this;
  }

  groupBy(cols: string | string[]) {
    this._group = `GROUP BY ${Array.isArray(cols) ? cols.join(', ') : cols}`;
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

  private buildSql() {
    const segments: string[] = [
      `SELECT ${this._select}`,
      this._from ? `FROM ${this._from}` : '',
      this._join,
      this._where,
      this._group,
      this._order
    ];

    if (this._limit >= 0) {
      segments.push(`LIMIT ${this._limit}`);
      if (this._offset > 0) segments.push(`OFFSET ${this._offset}`);
    }

    const sql = segments.filter(Boolean).join(' ');
    this.reset();
    return sql;
  }

  private reset() {
    this._select = '*';
    this._from = '';
    this._join = '';
    this._where = '';
    this._group = '';
    this._order = '';
    this._limit = -1;
    this._offset = 0;
  }

  async get(table?: string) {
    if (table) this._from = table;
    const sql = this.buildSql();
    const [rows] = await this.pool.query(sql);
    return new Result(rows as any[]);
  }

  async insert(table: string, data: Record<string, any>) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const placeholders = keys.map(() => '?').join(', ');
    const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
    const [res] = await this.pool.query(sql, values);
    return (res as any).insertId;
  }

  async update(table: string, data: Record<string, any>, where: string) {
    const keys = Object.keys(data);
    const set = keys.map((k) => `${k} = ?`).join(', ');
    const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
    const [res] = await this.pool.query(sql, Object.values(data));
    return (res as any).affectedRows;
  }

  async delete(table: string, where: string) {
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    const [res] = await this.pool.query(sql);
    return (res as any).affectedRows;
  }

  async query(sql: string) {
    const [rows] = await this.pool.query(sql);
    return new Result(rows as any[]);
  }
}


export class MySQLResult {
  private rows: any[];

  constructor(rows: any[]) {
    this.rows = rows;
  }

  num_rows(): number {
    return this.rows.length;
  }

  result(): any[] {
    return this.rows;
  }

  row(): any {
    return this.rows[0] ?? null;
  }
}

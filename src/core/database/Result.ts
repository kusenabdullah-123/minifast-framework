export class Result {
  private rows: any[];

  constructor(rows: any[]) {
    this.rows = rows;
  }

  numRows(): number {
    return this.rows.length;
  }

  result(): any[] {
    return this.rows;
  }

  row(): any {
    return this.rows.length > 0 ? this.rows[0] : null;
  }
}

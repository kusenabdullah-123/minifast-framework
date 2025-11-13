export class HttpException extends Error {
  public code: string;
  public status: number;
  public errors?: any;

  constructor(message: string, code = "error", status = 400, errors?: any) {
    super(message);
    this.code = code;
    this.status = status;
    this.errors = errors;
  }
}

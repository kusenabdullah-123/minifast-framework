export class Hello {
  async sayHello(req: any, res: any, next: Function) {
    console.log('👋 Hello from middleware!');
    await next(); // lanjut ke controller berikutnya
  }
}

type Packet = { bytes_b64: string; shape: number[]; dtype: "float16"|"float32"; ts: string };

export class StateBuffer {
  private max = 8;
  private buf: Packet[] = [];
  push(p: Packet) {
    this.buf.push(p);
    if (this.buf.length > this.max) this.buf.shift();
  }
  latest(): Packet | undefined { return this.buf[this.buf.length - 1]; }
  size() { return this.buf.length; }
}

export const projectedBuffer = new StateBuffer();

import { frame } from "$lib/utils";
import { EventEmitter } from "eventemitter3";

export class TriangleWave extends EventEmitter {
  static name = "三角波";
  constructor() {
    super();
    this.started = false;
    this.period = 64;
  }
  async start() {
    if (!this.started) {
      this.started = true;
      const period = this.period;
      let offset = 0;
      while (this.started) {
        if (offset === period) offset = 0;
        this.emit("data", Math.abs((offset - period / 2) / period) + 0.25);
        await frame();
        offset++;
      }
    }
  }
  stop() {
    this.started = false;
  }
}

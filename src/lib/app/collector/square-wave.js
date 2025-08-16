import { frame } from "$lib/utils";
import { EventEmitter } from "eventemitter3";

export class SquareWave extends EventEmitter {
  static name = "方波";
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
        this.emit("data", -Math.round(offset / period) / 2 + 0.75);
        await frame();
        offset++;
      }
    }
  }
  stop() {
    this.started = false;
  }
}

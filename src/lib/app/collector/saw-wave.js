import { frame } from "$lib/utils";
import { EventEmitter } from "eventemitter3";

export class SawWave extends EventEmitter {
  static name = "锯齿波";
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
        this.emit("data", (offset / period) * 0.5 + 0.25);
        await frame();
        offset++;
      }
    }
  }
  stop() {
    this.started = false;
  }
}

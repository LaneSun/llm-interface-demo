import { frame } from "$lib/utils";
import { EventEmitter } from "eventemitter3";

export class SineWave extends EventEmitter {
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
        this.emit(
          "data",
          (Math.sin((Math.PI * 2 * offset) / period) + 1) / 4 + 0.25,
        );
        if (offset % 2) await frame();
        offset++;
      }
    }
  }
  stop() {
    this.started = false;
  }
}

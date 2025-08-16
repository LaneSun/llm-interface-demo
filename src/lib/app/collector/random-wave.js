import { frame } from "$lib/utils";
import { EventEmitter } from "eventemitter3";

export class RandomWave extends EventEmitter {
  static name = "随机波";
  constructor() {
    super();
    this.started = false;
  }
  async start() {
    if (!this.started) {
      this.started = true;
      while (this.started) {
        this.emit("data", Math.random() * 0.25 + 0.375);
        await frame();
      }
    }
  }
  stop() {
    this.started = false;
  }
}

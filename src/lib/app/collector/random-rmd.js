import { frame } from "$lib/utils";
import { EventEmitter } from "eventemitter3";

export class RandomRMD extends EventEmitter {
  constructor() {
    super();
    this.started = false;
    this.block_size = 256;
    this.block_data = new Array(this.block_size + 1);
  }
  get(offset) {
    const size = this.block_size;
    const block = this.block_data;
    if (block[offset] !== undefined) {
      return block[offset];
    } else {
      for (let i = size; i >= 1; i /= 2) {
        if (offset === i) {
          if (offset === size) {
            const c = Math.random() / 2 + 0.25;
            block[offset] = c;
            return c;
          } else {
            const s = block[0];
            const e = this.get(offset * 2);
            const c = (Math.random() - 0.5) * (i / size) * 0.5 + (e + s) / 2;
            block[offset] = c;
            return c;
          }
        } else if (offset % i === 0) {
          const s = this.get(offset - i);
          const e = this.get(offset + i);
          const c = (Math.random() - 0.5) * (i / size) * 1 + (e + s) / 2;
          block[offset] = c;
          return c;
        }
      }
    }
  }
  async start() {
    if (!this.started) {
      this.started = true;
      const size = this.block_size;
      const block = this.block_data;
      let offset = 0;
      block.fill(undefined);
      block[0] = Math.random() / 2 + 0.25;
      while (this.started) {
        if (offset === this.block_size) {
          offset = 0;
          const start = block[size];
          block.fill(undefined);
          block[0] = start;
        }
        this.emit("data", this.get(offset));
        if (offset % 4 === 0) await frame();
        offset++;
      }
    }
  }
  stop() {
    this.started = false;
  }
}

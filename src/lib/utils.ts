import { clsx, type ClassValue } from "clsx";
import {
  derived,
  readable,
  writable,
  type Readable,
  type Writable,
} from "svelte/store";
import { twMerge } from "tailwind-merge";
import * as datetime from "@std/datetime";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any }
  ? Omit<T, "children">
  : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & {
  ref?: U | null;
};

export const frame = () => new Promise((res) => requestAnimationFrame(res));

export const merge = (overrides: any[]) => {
  const _merge = (a: any, c: any, path = []) => {
    switch (typeof a) {
      case "object":
        if (a instanceof Array) {
          console.assert(c instanceof Array);
          return a.concat(c);
        } else {
          console.assert(typeof c === "object");
          for (const [k, v] of Object.entries(c)) {
            if (k in a) {
              a[k] = _merge(a[k], v, path.concat(k));
            } else {
              a[k] = v;
            }
          }
          return a;
        }
      default:
        console.warn(`Override .${path.join(".")} from ${a} to ${c}`);
        return c;
    }
  };
  return overrides.reduce((a: any, c: any) => _merge(a, c), {});
};

export const to_readable = (val: Readable<any> | any) =>
  val.subscribe ? val : readable(val);

export const to_readables = (vals: (Readable<any> | any)[]) =>
  derived(vals.map(to_readable), ($val) => $val);

export const to_writable = (val: Writable<any> | any) =>
  val.subscribe ? val : writable(val);

export const to_writables = (vals: (Writable<any> | any)[]) =>
  derived(vals.map(to_writable), ($val) => $val);

export const parse_time = (str: string) =>
  datetime.parse(str, "yyyy-MM-ddTHH:mm:ss");
export const parse_duration = (str: string) => datetime.parse(str, "HH:mm:ss");

export const format_time = (date: Date) =>
  datetime.format(date, "yyyy-MM-ddTHH:mm:ss");
export const format_duration = (duration: Date) =>
  datetime.format(duration, "HH:mm:ss");

export const create_renderer = (handle: Function) => {
  let running = true;
  (async () => {
    while (running) {
      await handle();
      await frame();
    }
  })();
  return { stop: () => (running = false) };
};

export class CircularBuffer {
  buffer: Array<any>;
  capacity: number;
  head: number;
  size: number;

  constructor(capacity: number) {
    this.buffer = new Array(capacity);
    this.capacity = capacity;
    this.head = 0;
    this.size = 0;
  }

  push(value: any) {
    if (this.size === this.capacity) {
      this.buffer[this.head] = value;
      this.head = (this.head + 1) % this.capacity;
    } else {
      const head = (this.head + this.size) % this.capacity;
      this.buffer[head] = value;
      this.size++;
    }
  }

  get(index: number) {
    if (index < 0 || index >= this.size) return undefined;
    const i = (this.head + index) % this.capacity;
    return this.buffer[i];
  }

  get length() {
    return this.size;
  }
}

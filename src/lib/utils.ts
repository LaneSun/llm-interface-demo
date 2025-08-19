import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

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

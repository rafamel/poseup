import { attach, add } from 'exits';
import { ADD_TYPES } from './add';

let attached = false;
let fns: Array<[ADD_TYPES, () => any | Promise<any>]> = [];

export default {
  attach(): void {
    if (attached) return;
    attached = true;

    attach();
    fns.forEach(([type, fn]) => add(type, fn));
  },
  add(type: ADD_TYPES, fn: () => any | Promise<any>): void {
    fns.push([type, fn]);
    if (attached) add(type, fn);
  },
  get(): typeof fns {
    return fns.concat();
  },
  flush(): void {
    fns = [];
  },
  isAttached(): boolean {
    return attached;
  },
  isPending(): boolean {
    return Boolean(fns.length);
  }
};

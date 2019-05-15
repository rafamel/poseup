import { attach, add } from 'exits';
import { ADD_TYPES } from './add';

let attached = false;
let fns: Array<[() => any | Promise<any>, ADD_TYPES]> = [];

export default {
  attach(): void {
    if (attached) return;
    attached = true;

    attach();
    fns.forEach(([fn, type]) => add(fn, type));
  },
  add(fn: () => any | Promise<any>, type: ADD_TYPES): void {
    fns.push([fn, type]);
    if (attached) add(fn, type);
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

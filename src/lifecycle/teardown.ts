import manager from './manager';
import { ADD_TYPES } from './add';

export default async function teardown(): Promise<void> {
  const fns = manager
    .get()
    .map(
      ([fn, type], index): [() => any | Promise<any>, ADD_TYPES, number] => {
        return [fn, type, index];
      }
    )
    .sort((a, b) => b[1] - a[1] || b[2] - a[2])
    .map((x) => x[0]);

  for (let fn of fns) {
    await fn();
  }

  manager.flush();
}

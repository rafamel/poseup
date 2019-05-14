import manager from './manager';

export default async function teardown(): Promise<void> {
  const fns = manager
    .get()
    .sort((a, b) => b[1] - a[1])
    .map((x) => x[0]);

  for (let fn of fns) {
    await fn();
  }

  manager.flush();
}

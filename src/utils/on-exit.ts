// Queue of functions to execute on exit/sigterm
const queue = [];

export default function onExit(cb: () => Promise<any>) {
  queue.push(cb);
  return cb;
}

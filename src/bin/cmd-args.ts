import bx from 'base-x';

const tag = ':cmdargs:';
const match = new RegExp('^' + tag);
const base = bx('123456789ABCDEFGHIJKLMNPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz');

export default {
  set(argv = process.argv): string[] {
    const separator = argv.indexOf('--');

    return separator === -1
      ? argv
      : argv
          .slice(0, separator)
          .concat(
            tag +
              base.encode(
                Buffer.from(JSON.stringify(argv.slice(separator + 1)))
              )
          );
  },
  get(argv = process.argv): string[][] {
    const index =
      argv.map((x, i) => (match.exec(x) ? i : -1)).filter((x) => x !== -1)[0] ||
      -1;

    return index === -1
      ? [argv, []]
      : [
          argv.slice(0, index).concat(argv.slice(index + 1)),
          JSON.parse(base.decode(argv[index].replace(match, '')).toString())
        ];
  }
};

import list, { printer, tail } from '~/commands/run/list';
import chalk from 'chalk';

chalk.level = 0;
// eslint-disable-next-line
const log: any = (console.log = jest.fn());

describe(`list`, () => {
  test(`succeeds`, () => {
    log.mockClear();

    const config = { project: 'Foo', compose: {} };
    expect(() => list({}, config)).not.toThrow();
    expect(() => list({ tasks: [] }, config)).not.toThrow();
    expect(log).toHaveBeenCalledTimes(2);
  });
  test(`fails if tasks are passed in options`, () => {
    expect(() =>
      list({ tasks: [''] }, { project: 'Foo', compose: {} })
    ).toThrowError();
  });
});
describe(`printer`, () => {
  test(`no tasks`, () => {
    expect(printer({ project: 'Foo', compose: {} })).toMatchInlineSnapshot(`
      "Tasks for Foo
      "
    `);
    expect(printer({ project: 'Foo', tasks: {}, compose: {} }))
      .toMatchInlineSnapshot(`
      "Tasks for Foo
      "
    `);
  });
  test(`no descriptions`, () => {
    expect(
      printer({
        project: 'Foo',
        compose: {},
        tasks: { foo: {}, bar: {}, baz: {} }
      })
    ).toMatchInlineSnapshot(`
      "Tasks for Foo
      
      poseup run foo
      poseup run bar
      poseup run baz"
    `);
  });
  test(`descriptions`, () => {
    expect(
      printer({
        project: 'Foo',
        compose: {},
        tasks: {
          foo: { description: 'Lorem ipsum' },
          bar: {},
          baz: { description: 'Lorem ipsum lorem ipsum' }
        }
      })
    ).toMatchInlineSnapshot(`
      "Tasks for Foo
      
      poseup run foo       Lorem ipsum
      poseup run bar
      poseup run baz       Lorem ipsum lorem ipsum"
    `);
  });
  test(`name length divergence`, () => {
    expect(
      printer({
        project: 'Foo',
        compose: {},
        tasks: {
          foofoo: { description: 'Lorem ipsum' },
          bar: { description: 'Lorem ipsum lorem ipsum' },
          bazbazbaz: {}
        }
      })
    ).toMatchInlineSnapshot(`
      "Tasks for Foo
      
      poseup run foofoo          Lorem ipsum
      poseup run bar             Lorem ipsum lorem ipsum
      poseup run bazbazbaz"
    `);
  });
});
describe(`tail`, () => {
  test(`w/ longest`, () => {
    expect(tail('foo', 'foobarbaz')).toMatchInlineSnapshot(`"             "`);
    expect(tail('foobar', 'foobarbaz')).toMatchInlineSnapshot(`"          "`);
  });
  test(`wo/ longest`, () => {
    expect(tail('foo')).toMatchInlineSnapshot(`"       "`);
    expect(tail('foobar')).toMatchInlineSnapshot(`"       "`);
  });
});

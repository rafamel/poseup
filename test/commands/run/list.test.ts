import list, { printer, tail } from '~/commands/run/list';

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
                        "Tasks for [32m[1mFoo[22m[39m
                        "
              `);
    expect(printer({ project: 'Foo', tasks: {}, compose: {} }))
      .toMatchInlineSnapshot(`
                        "Tasks for [32m[1mFoo[22m[39m
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
                    "Tasks for [32m[1mFoo[22m[39m
                    
                    poseup run [1mfoo[22m
                    poseup run [1mbar[22m
                    poseup run [1mbaz[22m"
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
                "Tasks for [32m[1mFoo[22m[39m
                
                poseup run [1mfoo[22m       Lorem ipsum
                poseup run [1mbar[22m
                poseup run [1mbaz[22m       Lorem ipsum lorem ipsum"
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
            "Tasks for [32m[1mFoo[22m[39m
            
            poseup run [1mfoofoo[22m          Lorem ipsum
            poseup run [1mbar[22m             Lorem ipsum lorem ipsum
            poseup run [1mbazbazbaz[22m"
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

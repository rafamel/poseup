import validate from '~/builder/validate';

describe(`schema`, () => {
  test(`succeeds`, () => {
    expect(() =>
      validate({
        project: 'foo',
        compose: {
          services: {
            bar: {}
          }
        }
      })
    ).not.toThrow();
  });
  test(`fails`, () => {
    expect(() => validate({ project: 'foo', compose: {} })).toThrowError();
  });
});
describe(`services definition`, () => {
  test(`succeeds when defined`, () => {
    expect(() =>
      validate({
        project: 'foo',
        compose: {
          services: {
            bar: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`fails when not defined`, () => {
    expect(() => validate({ project: 'foo', compose: {} })).toThrowError();
  });
  test(`fails when no services exist`, () => {
    expect(() =>
      validate({ project: 'foo', compose: { services: {} } })
    ).toThrowError();
  });
});
describe(`persist services existence`, () => {
  test(`succeeds`, () => {
    expect(() =>
      validate({
        project: 'foo',
        persist: ['bar', 'baz'],
        compose: {
          services: {
            bar: {},
            baz: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`fails`, () => {
    expect(() =>
      validate({
        project: 'foo',
        persist: ['bar', 'baz'],
        compose: {
          services: {
            bar: {}
          }
        }
      })
    ).toThrowError();
  });
});
describe(`task primary/cmd`, () => {
  test(`succeeds for cmd`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            cmd: ['']
          }
        },
        compose: {
          services: {
            bar: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`succeeds for primary`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'bar'
          }
        },
        compose: {
          services: {
            bar: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`fails if no primary/cmd exists`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {}
        },
        compose: {
          services: {
            bar: {}
          }
        }
      })
    ).toThrowError();
  });
  test(`fails if task primary doesn't exist`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'baz'
          }
        },
        compose: {
          services: {
            bar: {}
          }
        }
      })
    ).toThrowError();
  });
});
describe(`task services`, () => {
  test(`succeeds`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'baz',
            services: ['bar', 'barbaz']
          }
        },
        compose: {
          services: {
            baz: {},
            bar: {},
            barbaz: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`fails`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'baz',
            services: ['bar', 'barbaz']
          }
        },
        compose: {
          services: {
            baz: {},
            bar: {}
          }
        }
      })
    ).toThrowError();
  });
});
describe(`task exec`, () => {
  test(`succeeds (1)`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'baz',
            exec: [{ bar: [], barbaz: [] }, { bar: [] }, { barbaz: [] }]
          }
        },
        compose: {
          services: {
            baz: {
              // eslint-disable-next-line @typescript-eslint/camelcase
              depends_on: ['bar', 'barbaz']
            },
            bar: {},
            barbaz: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`succeeds (2)`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'baz',
            services: ['bar', 'barbaz'],
            exec: [{ bar: [], barbaz: [] }, { bar: [] }, { barbaz: [] }]
          }
        },
        compose: {
          services: {
            baz: {},
            bar: {},
            barbaz: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`succeeds (3)`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            cmd: [''],
            services: ['bar', 'barbaz'],
            exec: [{ bar: [], barbaz: [] }, { bar: [] }, { barbaz: [] }]
          }
        },
        compose: {
          services: {
            baz: {},
            bar: {},
            barbaz: {}
          }
        }
      })
    ).not.toThrowError();
  });
  test(`fails on exec for primary`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'baz',
            exec: [{ bar: [], barbaz: [] }, { baz: [] }, { barbaz: [] }]
          }
        },
        compose: {
          services: {
            baz: {
              // eslint-disable-next-line @typescript-eslint/camelcase
              depends_on: ['bar', 'barbaz']
            },
            bar: {},
            barbaz: {}
          }
        }
      })
    ).toThrowError();
  });
  test(`fails on exec for non services`, () => {
    expect(() =>
      validate({
        project: 'foo',
        tasks: {
          foobar: {
            primary: 'baz',
            services: ['bar'],
            exec: [{ bar: [], barbaz: [] }, { baz: [] }, { barbaz: [] }]
          }
        },
        compose: {
          services: {
            baz: {},
            bar: {},
            barbaz: {}
          }
        }
      })
    ).toThrowError();
  });
});

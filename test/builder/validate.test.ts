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
    expect(() =>
      validate({ project: 'foo', compose: {} })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Poseup configuration is not valid: .compose should have required property '.services'"`
    );
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
    expect(() =>
      validate({ project: 'foo', compose: {} })
    ).toThrowErrorMatchingInlineSnapshot(
      `"Poseup configuration is not valid: .compose should have required property '.services'"`
    );
  });
  test(`fails when no services exist`, () => {
    expect(() =>
      validate({ project: 'foo', compose: { services: {} } })
    ).toThrowErrorMatchingInlineSnapshot(
      `"There are no services defined within the \\"compose\\" key of your configuration file"`
    );
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
    ).toThrowErrorMatchingInlineSnapshot(
      `"Persisted service \\"baz\\" is not defined."`
    );
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
  test(`suceeds if no primary/cmd exists`, () => {
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
    ).not.toThrowError();
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
    ).toThrowErrorMatchingInlineSnapshot(
      `"Primary service \\"baz\\" for task \\"foobar\\" is not defined"`
    );
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
    ).toThrowErrorMatchingInlineSnapshot(
      `"Service \\"barbaz\\" for task \\"foobar\\" is not defined"`
    );
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
    ).toThrowErrorMatchingInlineSnapshot(
      `"No exec command can be defined for the primary container on task \\"foobar\\""`
    );
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
    ).toThrowErrorMatchingInlineSnapshot(
      `"Service \\"barbaz\\" for task foobar exec is not for a defined/dependent container"`
    );
  });
});

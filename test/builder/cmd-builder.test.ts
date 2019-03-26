import cmdBuilder from '../../src/builder/cmd-builder';

test(`no args, no project`, () => {
  const opts1 = {
    file: 'foo.js',
    directory: 'bar/baz'
  };
  const opts2 = {
    file: 'foo.js',
    directory: 'bar/baz',
    args: []
  };
  const res = {
    cmd: 'docker-compose',
    args: ['-f', 'foo.js', '--project-directory', 'bar/baz']
  };
  expect(cmdBuilder(opts1)).toEqual(res);
  expect(cmdBuilder(opts2)).toEqual(res);
});
test(`no args, project`, () => {
  const opts1 = {
    project: 'foobar',
    file: 'foo.js',
    directory: 'bar/baz'
  };
  const opts2 = {
    project: 'foobar',
    file: 'foo.js',
    directory: 'bar/baz',
    args: []
  };
  const res = {
    cmd: 'docker-compose',
    args: ['-f', 'foo.js', '--project-directory', 'bar/baz', '-p', 'foobar']
  };
  expect(cmdBuilder(opts1)).toEqual(res);
  expect(cmdBuilder(opts2)).toEqual(res);
});
test(`args, no project`, () => {
  const opts = {
    file: 'foo.js',
    directory: 'bar/baz',
    args: ['--bar', 'foobar']
  };
  expect(cmdBuilder(opts)).toEqual({
    cmd: 'docker-compose',
    args: ['-f', 'foo.js', '--project-directory', 'bar/baz', '--bar', 'foobar']
  });
});
test(`args, project`, () => {
  const opts = {
    project: 'foobar',
    file: 'foo.js',
    directory: 'bar/baz',
    args: ['--bar', 'foobar']
  };
  expect(cmdBuilder(opts)).toEqual({
    cmd: 'docker-compose',
    args: [
      '-f',
      'foo.js',
      '--project-directory',
      'bar/baz',
      '-p',
      'foobar',
      '--bar',
      'foobar'
    ]
  });
});

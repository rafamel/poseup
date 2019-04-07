export default jest.fn().mockImplementation(async () => ({
  config: {
    project: 'foo',
    tasks: { foo: {}, bar: {} },
    compose: { services: { foo: {}, bar: {} } }
  },
  directory: 'foo/bar',
  getCmd() {
    return { cmd: 'foo', args: ['bar', 'baz'] };
  }
}));

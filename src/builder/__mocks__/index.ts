export default jest.fn().mockImplementation(async () => ({
  config: {
    project: 'foo',
    compose: { services: { foo: {}, bar: {} } }
  },
  getCmd() {
    return { cmd: 'foo', args: ['bar', 'baz'] };
  }
}));

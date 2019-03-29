export default jest.fn().mockImplementation(async () => ({
  config: {
    project: 'foo',
    compose: {}
  },
  getCmd() {
    return { cmd: 'foo', args: ['bar', 'baz'] };
  }
}));

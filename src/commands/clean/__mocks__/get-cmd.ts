export default jest.fn().mockImplementation(() => {
  return {
    cmd: 'foo',
    args: ['down', 'bar', 'baz']
  };
});

export default jest.fn().mockImplementation(() => {
  return {
    cmd: 'foo',
    args: ['bar', 'baz']
  };
});

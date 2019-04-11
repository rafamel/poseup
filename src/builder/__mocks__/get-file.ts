export default jest.fn().mockImplementation(async () => {
  return {
    file: 'foo/bar/baz.js',
    directory: 'foo/bar'
  };
});

export default jest.fn().mockImplementation(async () => {
  return {
    project: 'foo',
    compose: { services: { foo: {}, bar: {} } }
  };
});

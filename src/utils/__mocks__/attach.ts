export default jest.fn().mockImplementation(() => Promise.resolve());

export const isAttached = jest.fn().mockImplementation(() => true);

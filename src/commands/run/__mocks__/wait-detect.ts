import { wait } from 'promist';

export default jest.fn().mockImplementation(() => wait(1000));

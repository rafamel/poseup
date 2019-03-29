export default {
  bin: jest.fn().mockImplementation(async () => true),
  all: jest.fn().mockImplementation(async () => ({
    all: true,
    docker: true,
    'docker-compose': true
  }))
};

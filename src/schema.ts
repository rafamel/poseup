export const config = {
  type: 'object',
  required: ['project', 'compose'],
  properties: {
    log: {
      type: 'string',
      enum: ['silent', 'trace', 'debug', 'info', 'warn', 'error']
    },
    project: { type: 'string' },
    persist: { type: 'array', items: { type: 'string' } },
    tasks: {
      type: 'object',
      additionalProperties: false,
      patternProperties: {
        '^.*$': {
          type: 'object',
          properties: {
            primary: { type: 'string' },
            services: { type: 'array', items: { type: 'string' } },
            cmd: { type: 'array', items: { type: 'string' } },
            exec: {
              describe:
                'Execute before cmd on primary. Only valid for services linked to primary.',
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                patternProperties: {
                  '^.*$': { type: 'array', items: { type: 'string' } }
                }
              }
            }
          }
        }
      }
    },
    compose: {
      type: 'object',
      required: ['services']
    }
  }
};

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
      properties: {
        primary: { type: 'string' },
        cmd: {
          describe: 'Replaces default container command (CMD)',
          type: 'object',
          additionalProperties: false,
          patternProperties: { '^.*$': { type: 'string' } }
        },
        exec: {
          describe:
            'Executed after CMDs for all primary dependent containers (from primary, if present) have executed',
          anyOf: [
            {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                patternProperties: { '^.*$': { type: 'string' } }
              }
            },
            {
              type: 'object',
              additionalProperties: false,
              patternProperties: { '^.*$': { type: 'string' } }
            }
          ]
        }
      }
    },
    compose: {
      type: 'object',
      required: ['services']
    }
  }
};

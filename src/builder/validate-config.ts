import Ajv from 'ajv';
import { config as schema } from '~/schemas';
import logger from 'loglevel';
import chalk from 'chalk';

const ajv = new Ajv();
// tslint:disable-next-line
ajv.addMetaSchema(require('ajv/lib/refs/json-schema-draft-06.json'));

export default function validateConfig(config: any) {
  // Validate schema
  const validate = ajv.compile(schema);
  const valid = validate(config);
  if (!valid) {
    let msg = 'Poseup configuration is not valid';
    if (validate.errors && validate.errors[0]) {
      const { message, dataPath } = validate.errors[0];
      delete validate.errors[0].message;
      delete validate.errors[0].dataPath;
      delete validate.errors[0].schemaPath;
      msg +=
        ': ' + (dataPath.trim() ? dataPath.trim() + ' ' : '') + `${message}`;
      logger.debug(
        chalk.yellow('Validation error data:\n') +
          JSON.stringify(validate.errors[0], null, 2)
            .split('\n')
            .map((x) => x.slice(2))
            .filter(Boolean)
            .join('\n')
      );
    }
    throw Error(msg);
  }

  const services = Object.keys(config.compose.services);
  if (!services.length) {
    throw Error(
      'There are no services defined within the "compose" key of your configuration file'
    );
  }

  // Check all services to be persisted exist
  if (config.persist && config.persist.length) {
    for (const service of config.persist) {
      if (!services.includes(service)) {
        throw Error(`Persisted service ${service} is not defined.`);
      }
    }
  }
}

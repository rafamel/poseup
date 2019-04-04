import Ajv from 'ajv';
import { config as schema } from '~/schema';
import logger from '~/utils/logger';
import chalk from 'chalk';
import { IConfig } from '~/types';

const ajv = new Ajv();

export default function validate(config: IConfig): void {
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
        throw Error(`Persisted service "${service}" is not defined.`);
      }
    }
  }

  Object.entries(config.tasks || {}).forEach(([taskName, task]) => {
    // Check all primaries for tasks exist
    if (task.primary && !config.compose.services.hasOwnProperty(task.primary)) {
      throw Error(
        `Primary service "${
          task.primary
        }" for task "${taskName}" is not defined`
      );
    }
    // Check all services exist
    (task.services || []).forEach((serviceName) => {
      if (!config.compose.services.hasOwnProperty(serviceName)) {
        throw Error(
          `Service "${serviceName}" for task "${taskName}" is not defined`
        );
      }
    });
    // Ensure all exec services are of task
    const linked =
      task.services ||
      (task.primary &&
        config.compose.services.hasOwnProperty(task.primary) &&
        config.compose.services[task.primary].depends_on) ||
      [];
    (task.exec || []).forEach((obj) => {
      Object.keys(obj).forEach((containerName) => {
        if (containerName === task.primary) {
          throw Error(
            `No exec command can be defined for the primary container on task "${taskName}"`
          );
        }
        if (!linked.includes(containerName)) {
          throw Error(
            `Service "${containerName}" for task ${taskName} exec is not for a defined/dependent container`
          );
        }
      });
    });
  });
}

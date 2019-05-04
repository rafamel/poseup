# Poseup

[![Version](https://img.shields.io/npm/v/poseup.svg)](https://www.npmjs.com/package/poseup)
[![Build Status](https://img.shields.io/travis/rafamel/poseup/master.svg)](https://travis-ci.org/rafamel/poseup)
[![Coverage](https://img.shields.io/coveralls/rafamel/poseup/master.svg)](https://coveralls.io/github/rafamel/poseup)
[![Dependencies](https://img.shields.io/david/rafamel/poseup.svg)](https://david-dm.org/rafamel/poseup)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/poseup.svg)](https://snyk.io/test/npm/poseup)
[![License](https://img.shields.io/github/license/rafamel/poseup.svg)](https://github.com/rafamel/poseup/blob/master/LICENSE)
[![Types](https://img.shields.io/npm/types/poseup.svg)](https://www.npmjs.com/package/poseup)

<div align="center">
  <br />
  <br />
  <a href="https://www.npmjs.com/package/poseup" target="_blank">
    <img alt="poseup" width="350" src="https://raw.githubusercontent.com/rafamel/poseup/master/assets/logo.png" />
  </a>
  <br />
  <br />
  <strong>Containerized development workflow for the masses</strong>
  <br />
  <br />
</div>

If you find it useful, consider [starring the project](https://github.com/rafamel/poseup) 💪 and/or following [its author](https://github.com/rafamel) ❤️ -there's more on the way!

## Install

Requires [`docker` to be installed on your system.](https://docs.docker.com/install/)

To install *poseup* globally, run: [`npm install -g poseup`](https://www.npmjs.com/package/poseup)

## Motivation

*Poseup* leverages `docker-compose` with the goal of making having a containerized development and test workflow trivial. It is governed by a [`poseup.config` file](#configuration) that can be used as a single source of truth, as *poseup* is also able to generate traditional `docker-compose` files from it.

Ultimately, it is an effort to **fix the most common issues with similar solutions,** which tend to be:

- Unable to properly clean up ephemeral services when errors occur or the process is terminated by the user.
- Lacking in compatibility with `docker-compose`, making it difficult to have a single source of truth.
- Lacking in configuration and CLI options, as well as clarity as to what goes on under the hood.

In contrast with other solutions, *poseup* integrates seamlessly with `docker-compose` and its configuration format. Mostly as a product of it, ***poseup* is able to:**

- **Properly clean up ephemeral services** in all events but a forced kill to the process.
- **Run tasks** either with a set of persisted services or in completely ephemeral sandboxes -[see `poseup run`.](#poseup-run)
- Run **automated setup commands for services before tasks** are run -[see `exec`.](#structure)
- Seek setups for different environments in a **single source of truth** -[see `environments`.](#environments)
- **Produce `docker-compose` configuration files** from its own `poseup.config` -[see `poseup compose`.](#poseup-compose)
- **Inherit all `docker-compose` commands,** hence allowing for a high degree of flexibility -[see `poseup compose`.](#poseup-compose)

## Usage

- [CLI](#cli)
  - [`poseup compose`](#poseup-compose) runs `docker-compose` as per your [`poseup.config`](#configuration) file.
  - [`poseup run`](#poseup-run) is a task runner for docker.
  - [`poseup clean`](#poseup-clean) cleans all non persisted containers.
  - [`poseup purge`](#poseup-purge) purges volumes, networks, and images from your system.
  - [Common options:](#common-options) a description of common options taken by CLI commands.
- [Configuration:](#configuration) how to get the most out of *poseup* through your `poseup.config` file.
  - [Extensions:](#extensions) the allowed file extensions for a config file.
  - [Path:](#path) how *poseup* resolves the path for your config file by default.
  - [Structure:](#structure) what you should put where in the configuration file.
  - [Environments:](#environments) how to define different configurations for several environments.
  - [Example:](#example) a complete example configuration.
- [Programmatic usage:](#programmatic-usage) how to use poseup programmatically.

### CLI

#### `poseup compose`

Runs `docker-compose` as per the services defined in your [`poseup.config`](#configuration) or, alternatively, produces a docker compose file from the `compose` object of your poseup configuration.

Example: `poseup compose -- up`

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup compose [options] -- [dockerArgs]

Runs docker-compose

Options:
  -w, --write <path>  Produce a docker compose file and save it to path
  -s, --stop          Stop all services on exit
  -c, --clean         Run clean on exit
  --dry               Dry run -write docker compose file only
  -e, --env <env>     Node environment
  -d, --dir <dir>     Project directory
  -f, --file <path>   Path for config file [js,json,yml,yaml]
  --log <level>       Logging level
  -h, --help          output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

##### Generating a `docker-compose` file

To generate a `docker-compose` compatible file, you can just run: `poseup compose --dry --write docker-compose.yml`.

[If your `poseup.config` configuration depends on `NODE_ENV`,](#environments) you could just run `poseup compose -e development --dry --write docker-compose.development.yml` to get the `docker-compose` configuration for the `development` environment.

#### `poseup run`

A task runner. Runs a task or a series of tasks -defined in your [`poseup.config`](#configuration)- in a one off primary container while starting its dependent services, or in a single use sandbox -which creates new containers for the task runner and all its services, and removes them after the task has finished execution.

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup run [options] [tasks]

Runs tasks

Options:
  -l, --list               List tasks
  -s, --sandbox            Create new containers for all services, remove all on exit
  -t, --timeout <seconds>  Timeout for waiting time after starting services before running commands [60 by default]
  --no-detect              Prevent service initialization auto detection and wait until timeout instead
  -e, --env <env>          Node environment
  -d, --dir <dir>          Project directory
  -f, --file <path>        Path for config file [js,json,yml,yaml]
  --log <level>            Logging level
  -h, --help               output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

#### `poseup clean`

Cleans all services absent from the `persist` array of your [`poseup.config`](#configuration) file.

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup clean [options]

Cleans not persisted containers and networks -optionally, also volumes

Options:
  -v, --volumes      Clean volumes not associated with persisted containers
  -e, --env <env>    Node environment
  -d, --dir <dir>    Project directory
  -f, --file <path>  Path for config file [js,json,yml,yaml]
  --log <level>      Logging level
  -h, --help         output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

#### `poseup purge`

Shorthand for a serial run of `docker volume prune`, `docker network prune`, `docker image prune --all`, and `docker container ls --all`.

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup purge [options]

Purges dangling containers, networks, and volumes system-wide

Options:
  -f, --force    Skip confirmation
  --log <level>  Logging level
  -h, --help     output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

#### Common options

##### `log`

*Taken by: [`compose`,](#poseup-compose) [`run`,](#poseup-run) [`clean`,](#poseup-clean) [`purge`.](#poseup-purge)*

Sets logging level. Can be one of `silent`, `trace`, `debug`, `info`, `warn`, `error`.

Example: `poseup clean --log debug`

##### `file`

*Taken by: [`compose`,](#poseup-compose) [`run`,](#poseup-run) [`clean`.](#poseup-clean)*

Sets the *poseup* configuration file as an absolute or relative path to *cwd.* By default, *poseup* will attempt to find it in the project directory -if passed- or *cwd*, and up.

Example: `poseup compose --file ../poseup.development.js -- up`

##### `dir`

*Taken by: [`compose`,](#poseup-compose) [`run`,](#poseup-run) [`clean`.](#poseup-clean)*

Sets the project directory for *docker* as an absolute or relative path to *cwd.* By default, it is the directory where the poseup configuration file is found.

Example: `poseup compose --dir ../ -- dowm`

##### `env`

*Taken by: [`compose`,](#poseup-compose) [`run`,](#poseup-run) [`clean`.](#poseup-clean)*

Assigns an arbitrary value to `process.env.NODE_ENV`.

Example: `poseup compose --env development -- up`

The above would be equivalent to `NODE_ENV=development poseup compose -- up`

### Configuration

A *poseup* configuration file is the single **most important thing** for you to make your *poseup* usage worthwhile. It contains the project name, the persisted containers, any number of tasks, and a `docker-compose` configuration object containing services, volumes, and networks definition. Before you jump in, you can check out an example [here.](#example)

#### Extensions

Valid configuration files are `.js`, `.json`, or `.yml` files, though you'll have to use a `.js` file in order to be able to define different configurations depending on environment on the same file. See [environments.](#environments)

#### Path

All *poseup* commands but [`poseup purge`](#poseup-purge) (since it's system-wide) will need a `poseup.config` file. You can pass the file path via the `--file` flag, but otherwise, *poseup* will look for a `poseup.config.{js,json,yml}` in the current working directory and up. Remember you can also specify a different working directory for *poseup* than the current on console with the `--dir` flag.

#### Structure

Root properties are:

- `log`: *string, optional,* logging level. One of: `'silent'`, `'trace'`, `'debug'`, `'info'`, `'warn'`, `'error'`.
- `project`: *string, required,* the name of the project. Note that you should **never have different environment-dependent configurations for a same project name** (see [environments](#environments)).
- `persist`: *strings array, optional,* the name of the services to **not** clean when running [`poseup clean`](#poseup-clean) and [`poseup run`](#poseup-run). This is useful if you have services you don't want to be ephemeral, like a database, which data you'd like to keep between runs.
- `compose`: *object, required,* should have the same structure as a traditional [`docker-compose` file.](https://docs.docker.com/compose/compose-file/) Here is where you define your services and their configuration. Having your `docker-compose` configuration inside the *poseup* config will allow you, if desired, to have all environmental differences in a single file, while you can always generate an actual `docker-compose` yaml file for any environment from it by dry running [`poseup compose`.](#poseup-compose)
- `tasks`: *object, optional,* any number of tasks to be executed via [`poseup run`.](#poseup-run) The keys of the `task` object will be the names of your task, and each have an *object* as value with *optional* keys:
  - `description`: *string,* a description for the task -it'll be used when running `poseup run --list`.
  - `primary`: *string,* the name of the service for which a new ephemeral container will be created in order to run `cmd`. If no `primary` is specified, `cmd` will be run in your local environment -your system.
  - `services`: *strings array,* the names of the associated services required to run this task. If not present and a `primary` service has been specified, *poseup* will use the services defined on the `depends_on` key of the service in the `compose` definition by default. If it exists, it will not merge with `depends_on`, this way you can restrict or extend the required services for this task with no regard for the `compose` definition. If not present and no `primary` has been defined, no services will be started for the task, though that would mean you'd essentially be just running a local command, which would make little sense.
  - `cmd`: *strings array,* the command to execute on `primary` or locally that represents the task itself. Example: `['npm', 'install']`.
  - `exec`: *array | object* any number of commands to execute on any of the services that are required to start when running the task -either via `services` or the `compose` `depends_on`- before `cmd` is run. Each item of the array must be an *object.* The keys of the object will signal the service to run the command on, meanwhile their value should be a *strings array* for the command. All the commands in each item of the `exec` array will be executed with no guaranteed execution order, while each array item will be guaranteed to run serially:

```javascript
// Unordered execution example
({
  tasks: {
    myTask: {
      primary: 'myPrimaryService',
      cmd: ['echo', 'foo'],
      exec: [
        {
          // These will execute in parallel
          myDbService: ['psql', '-U', 'postgres', '-c', 'CREATE DATABASE testdb;'],
          myNodeService: ['npm', 'install']
        }
      ]
    }
  }
});

// Unordered execution example (equivalent to the previous)
({
  tasks: {
    myTask: {
      primary: 'myPrimaryService',
      cmd: ['echo', 'foo'],
      exec: {
        // These will execute in parallel
        myDbService: ['psql', '-U', 'postgres', '-c', 'CREATE DATABASE testdb;'],
        myNodeService: ['npm', 'install']
      }
    }
  }
});

// Series example: guaranteed execution order
({
  tasks: {
    myTask: {
      primary: 'myPrimaryService',
      cmd: ['echo', 'foo'],
      exec: [
        // These will execute in series
        { myDbService: ['psql', '-U', 'postgres', '-c', 'CREATE DATABASE testdb;'] },
        { myNodeService: ['npm', 'install'] }
      ]
    }
  }
});
```

#### Environments

There are two strategies you can follow in order to define different configurations for several environments.

It's important to keep in mind, regardless of the strategy you use, *poseup* will treat any configuration with the same project name as if they were the same. What that means is you need to **make sure that, for different configuration values, the project name in your `poseup.config` file is distinct,** otherwise things could get quite messy. That being said:

- you can have several `poseup.config` files and pass them to *poseup* depending on the one you desire to apply via the `--file` flag,
- or you can use a JavaScript file for your `poseup.config` that defines a different configuration as per any arbitrary number of environment variables.

Focusing on the single JavaScript file strategy, a simple solution would be to do something like:

`poseup.config.js`:

```javascript
const isProduction = process.env.NODE_ENV === 'production';

module.exports = {
  project: 'my-project-name' + (isProduction ? 'production' : 'development'),
  persist: [ /* ...my persisted services */ ],
  tasks: isProduction
    ? { /* ...my production tasks */ }
    : { /* ...my development tasks */ },
  compose: {
    version: '3.4',
    services: { /* ...my services */ }
  }
};
```

Solutions like [`slimconf`](https://github.com/rafamel/slimconf) might assist you in organizing your environment-dependent configuration.

As an example:

```javascript
const { default: slim, fallback } = require('slimconf');

module.exports = slim(
  { env: [process.env.NODE_ENV, fallback('development', ['test']) },
  (on, { env }) => ({
    project: `my-project-${env}`,
    persist: on.env({
      default: [
        // ...my default persisted services
      ],
      development: [
        // ...my persisted services in development
      ],
      test: [] // all services will be ephemeral on test
    }),
    tasks: on.env({
      default: {
        // ...my default tasks
      },
      development: {
        // ...my development tasks
      },
      test: {
        // ...my test tasks
      }
    }),
    compose: {
      version: '3.4',
      services: {
        // ...my services
      }
    }
  })
);
```

#### Example

This example uses [`slimconf`](https://github.com/rafamel/slimconf) to manage environment-dependent configuration.

`poseup.config.js`:

```javascript
const { default: slim, fallback, merge } = require('slimconf');

module.exports = slim(
  { env: [process.env.NODE_ENV, fallback('development', ['test']) },
  // We're merging the defaults with the environment-dependent configuration
  (on, { env }) => on.env(merge, {
    /* Defaults */
    defaults: {
      log: 'info',
      project: `my-project-${env}`,
      compose: {
        version: '3.4',
        services: {
          app: {
            image: 'node:8-alpine',
            depends_on: ['db'],
            networks: ['backend'],
            environment: {
              NODE_ENV: env,
              DB_URL: `postgres://postgres:pass@db:5432/testdb`
            },
            volumes: [{ type: 'bind', source: './', target: '/usr/src/app' }]
          },
          db: {
            image: 'postgres:11-alpine',
            networks: ['backend'],
            environment: { POSTGRES_PASSWORD: 'pass' }
          }
        },
        networks: { backend: {} },
        volumes: {}
      }
    },
    /* Development environment */
    development: {
      // We'll persist the database on development (won't be removed on poseup clean)
      persist: ['db'],
      tasks: {
        // This will run "node index.js" locally after "db" is up.
        // We'd run it with: poseup run local
        local: {
          services: ['db'],
          cmd: ['/bin/sh', '-c'].concat('cd /usr/src/app && node index.js')
        },
        // This will run "node index.js" in a docker container ("app").
        // Since app already depends on "db", we don't need to define it.
        // We'd run it with: poseup run docker
        docker: {
          primary: 'app',
          cmd: ['/bin/sh', '-c'].concat('cd /usr/src/app && node index.js')
        },
        // This will just setup the database for usage on development.
        // As we are persisting the container, it's a one-off task.
        bootstrap: {
          services: ['db'],
          exec: {
            db: 'psql -U postgres -c'
              .split(' ')
              .concat('CREATE DATABASE testdb;')
          }
        }
      },
      compose: {
        // We'll also expose ports
        services: {
          app: { ports: ['3000:3000'] },
          db: { ports: ['5432:5432'] }
        }
      }
    },
    /* Test environment */
    test: {
      tasks: {
        // We'd run it with: poseup run -e test jest
        jest: {
          primary: 'app',
          cmd: ['/bin/sh', '-c'].concat('cd /usr/src/app && npx jest'),
          // Create database before running tests
          exec: {
            db: 'psql -U postgres -c'
              .split(' ')
              .concat('CREATE DATABASE testdb;')
          }
        }
      }
    }
  })
);
```

### Programmatic Usage

[See docs.](https://rafamel.github.io/poseup/globals.html)

*poseup* exports [`compose`](https://rafamel.github.io/poseup/globals.html#compose), [`run`](https://rafamel.github.io/poseup/globals.html#run), [`clean`](https://rafamel.github.io/poseup/globals.html#clean), and [`purge`](https://rafamel.github.io/poseup/globals.html#purge), which are called by the equally named CLI commands.

However, when running *poseup* on the CLI, the program will also listen to termination events through [`exits`](https://github.com/rafamel/exits) and run cleanup tasks either at end of execution or termination signals. In order to handle these cleanup tasks, you have two options:

- Call [`attach`](https://rafamel.github.io/poseup/globals.html#attach) before any of the command functions. This will produce identical behavior to that of the CLI.
- Call [`teardown`](https://rafamel.github.io/poseup/globals.html#teardown) after running any of the command functions to manually initialize the run of cleanup tasks and handle errors.

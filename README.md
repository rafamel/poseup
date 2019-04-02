<div align="center">
  <br />
  <a href="https://www.npmjs.com/package/poseup" target="_blank">
    <img alt="poseup" width="350" src="https://raw.githubusercontent.com/rafamel/poseup/master/scripts/assets/logo.png" />
  </a>
  <br />
  <br />
  <strong>Containerized development workflow for the masses</strong>
  <br />
  <br />
  <a href="https://www.npmjs.com/package/poseup">
    <img src="https://img.shields.io/npm/v/poseup.svg" alt="Version">
  </a>
  <a href="https://www.npmjs.com/package/poseup">
    <img src="https://img.shields.io/npm/types/poseup.svg" alt="Types">
  </a>
  <a href="https://travis-ci.org/rafamel/poseup">
    <img src="https://img.shields.io/travis/rafamel/poseup.svg" alt="Build Status">
  </a>
  <a href="https://coveralls.io/github/rafamel/poseup">
    <img src="https://img.shields.io/coveralls/rafamel/poseup.svg" alt="Coverage">
  </a>
  <a href="https://david-dm.org/rafamel/poseup">
    <img src="https://img.shields.io/david/rafamel/poseup.svg" alt="Dependencies">
  </a>
  <a href="https://snyk.io/test/npm/poseup">
    <img src="https://img.shields.io/snyk/vulnerabilities/npm/poseup.svg" alt="Vulnerabilities">
  </a>
  <a href="https://github.com/rafamel/poseup/blob/master/LICENSE">
    <img src="https://img.shields.io/github/license/rafamel/poseup.svg" alt="License">
  </a>
  <br />
  <br />
</div>

# Poseup

## Install

Requires [`docker` to be installed on your system.](https://docs.docker.com/install/)

To install *poseup* globally, run: [`npm install -g poseup`](https://www.npmjs.com/package/poseup)

## Motivation

<!-- TODO -->

Poseup is a thin `docker-compose` wrapper allowing for flexible containerized development workflow and test running.

## Features

<!-- TODO -->

## Usage

* [CLI](#cli)
  * [`poseup compose`](#poseup-compose) runs `docker-compose` as per your [`poseup.config`](#configuration) file.
  * [`poseup run`](#poseup-run) is a task runner for docker.
  * [`poseup clean`](#poseup-clean) cleans all non persisted containers.
  * [`poseup purge`](#poseup-purge) purges volumes, networks, and images from your system.
* [Configuration:](#configuration) how to get the most out of *poseup* through your `poseup.config` file.
  * [Extensions:](#extensions) the allowed file extensions for a config file.
  * [Path:](#path) how *poseup* resolves the path for your config file by default.
  * [Structure:](#structure) what you should put where in the configuration file.
  * [Environments:](#environments) how to define different configurations for several environments.
  * [Examples:](#examples) a real-world example configuration.
* [Programmatic usage:](#programmatic-usage) call *poseup* commands from a script without spawning a process.

### CLI

#### `poseup compose`

Runs `docker-compose` as per the services defined in your [`poseup.config`](#configuration) or, alternatively, produces a docker compose file from the `compose` object of your poseup configuration.

Example: `poseup compose -- up`

<!-- TODO: how to generate docker-compose file -->

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup compose [options] -- [dockerArgs]

Runs docker-compose

Options:
  -w, --write <path>  Path to write a resulting docker compose file
  -s, --stop          Stop all services on exit
  -c, --clean         Run clean on exit
  --dry               Don't run docker compose - write only docker compose file
  -e, --env <env>     Environment for config file should be run on
  -d, --dir <dir>     Project directory [cwd by default]
  -f, --file <path>   Path for config file [js,json,yml]
  --log <level>       Logging level
  -h, --help          output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

#### `poseup run`

A task runner for Docker. Runs a task or a series of tasks -defined in your [`poseup.config`](#configuration)- in a one off primary container while starting its dependent services, or in a single use sandbox (creates new containers for the task runner and all its services, and removes them after).

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup run [options] [tasks]

Runs tasks

Options:
  -w, --wait <seconds>  Wait a number of seconds after starting services before running commands [5 by default]
  -s, --sandbox         Create new containers for all services, remove all on exit
  -e, --env <env>       Environment for config file should be run on
  -d, --dir <dir>       Project directory [cwd by default]
  -f, --file <path>     Path for config file [js,json,yml]
  --log <level>         Logging level
  -h, --help            output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

#### `poseup clean`

Cleans all services absent from the `persist` array of your [`poseup.config`](#configuration) file.

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup clean [options]

Cleans not persisted containers and networks. Optionally, also volumes.

Options:
  -v, --volumes      Cleans volumes not associated with persisted containers
  -e, --env <env>    Environment for config file should be run on
  -d, --dir <dir>    Project directory [cwd by default]
  -f, --file <path>  Path for config file [js,json,yml]
  --log <level>      Logging level
  -h, --help         output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

#### `poseup purge`

Shorthand for a serial run of `docker volume prune`, `docker network prune`, `docker image prune --all`, and `docker container ls --all`.

<!-- markdownlint-disable MD040 MD031 -->
```
Usage: poseup purge [options]

Purges dangling containers, networks, and volumes from system.

Options:
  -f, --force    Skips confirmation
  --log <level>  Logging level
  -h, --help     output usage information
```
<!-- markdownlint-enable MD040 MD031 -->

### Configuration

<!-- TODO -->

### Programmatic usage

<!-- TODO -->

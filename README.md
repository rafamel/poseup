# Poseup

[![Version](https://img.shields.io/npm/v/poseup.svg)](https://www.npmjs.com/package/poseup)
[![Types](https://img.shields.io/npm/types/poseup.svg)](https://www.npmjs.com/package/poseup)
[![Build Status](https://img.shields.io/travis/rafamel/poseup.svg)](https://travis-ci.org/rafamel/poseup)
[![Coverage](https://img.shields.io/coveralls/rafamel/poseup.svg)](https://coveralls.io/github/rafamel/poseup)
[![Dependencies](https://img.shields.io/david/rafamel/poseup.svg)](https://david-dm.org/rafamel/poseup)
[![Vulnerabilities](https://img.shields.io/snyk/vulnerabilities/npm/poseup.svg)](https://snyk.io/test/npm/poseup)
[![License](https://img.shields.io/github/license/rafamel/poseup.svg)](https://github.com/rafamel/poseup/blob/master/LICENSE)

![Poseup logo](https://raw.githubusercontent.com/rafamel/poseup/master/setup/assets/logo.png)

<!-- markdownlint-disable MD036 -->
**Containerized development workflow & tests for the masses.**
<!-- markdownlint-enable MD036 -->

## Install

Requires [`docker` to be installed on your system.](https://docs.docker.com/install/)

To install *poseup* on your system -globally-, run:

[`npm install -g poseup`](https://www.npmjs.com/package/poseup)

You can also just install it within the scope of your project by running `npm install poseup`.

## Motivation

<!-- TODO -->

## Features

Poseup is a thin `docker-compose` wrapper allowing for flexible containerized development workflow.

<!-- TODO -->

## Usage

* CLI
  * `poseup compose` runs `docker-compose` as per your `poseup.config` file.
  * `poseup run` is a task runner for docker.
  * `poseup clean` cleans all non persisted containers.
  * `poseup purge` purges volumes, networks, and images from your system.
* Configuration: how to get the most out of *poseup* through your `poseup.config` file.
  * Extensions: the allowed file extensions for a config file.
  * Path: how *poseup* resolves the path for your config file by default.
  * Structure: what you should put where in the configuration file.
  * Environments: how to define different configurations for several environments.
  * Examples: a real-world example configuration.
* Programmatic usage: call *poseup* commands from a script without spawning a process.

### CLI

<!-- TODO -->

### Configuration

<!-- TODO -->

### Programmatic usage

<!-- TODO -->
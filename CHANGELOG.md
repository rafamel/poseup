# [0.2.0](https://github.com/rafamel/poseup/compare/v0.1.0...v0.2.0) (2019-04-10)


### Features

* **bin/run:** implements new run api for bin ([ab7cf7c](https://github.com/rafamel/poseup/commit/ab7cf7c))
* **commands/run:** auto detects services initialization ([464c5e9](https://github.com/rafamel/poseup/commit/464c5e9))
* **commands/run:** implements waitDetect ([4791955](https://github.com/rafamel/poseup/commit/4791955))
* **utils:** adds stdout ([231e981](https://github.com/rafamel/poseup/commit/231e981))


### BREAKING CHANGES

* **bin/run:** `poseup run` no longer takes a `--wait` option, taking `--timeout` and
`--no-detect` instead, as service initialization is now auto detected. For the same behavior as
`--wait seconds`, pass `--timeout seconds --no-detect`.
* **commands/run:** run no longer takes `wait` as waiting time, taking a `timeout` instead



# [0.1.0](https://github.com/rafamel/poseup/compare/e240d58...v0.1.0) (2019-04-07)


### Bug Fixes

* **bin:** fixes command arguments parsing after -- ([cdb9080](https://github.com/rafamel/poseup/commit/cdb9080))
* **builder:** fixes builder directory initialization ([979119b](https://github.com/rafamel/poseup/commit/979119b))
* **builder:** fixes getFile() ([47d2e48](https://github.com/rafamel/poseup/commit/47d2e48))
* **commands/run:** fixes initialize call ([3787de7](https://github.com/rafamel/poseup/commit/3787de7))
* **commands/run:** fixes runTask() waiting time when 0 or less than 0 ([711d84c](https://github.com/rafamel/poseup/commit/711d84c))
* **commands/run:** rejects on runCmd() instead of throwing a synchronous Error ([5c6d833](https://github.com/rafamel/poseup/commit/5c6d833))


### Features

* **builder:** adds yaml extension ([7596544](https://github.com/rafamel/poseup/commit/7596544))
* **commands:** sets purge() options as an optional argument ([a1e956e](https://github.com/rafamel/poseup/commit/a1e956e))
* **commands/run:** runTask() waits only if services are brought up ([5d65aba](https://github.com/rafamel/poseup/commit/5d65aba))
* **compose:** implements clean and stop after compose exits ([e240d58](https://github.com/rafamel/poseup/commit/e240d58))
* **run:** adds tasks listing w/ descriptions ([b89c49b](https://github.com/rafamel/poseup/commit/b89c49b))
* adds entry point exports for programmatic usage and modifies dir structure ([575c58b](https://github.com/rafamel/poseup/commit/575c58b))
* allows objects for task.exec ([33031da](https://github.com/rafamel/poseup/commit/33031da))
* **utils:** adds ensureError() and uses it to ensure error rejections on fs usage ([4a14a2f](https://github.com/rafamel/poseup/commit/4a14a2f))
* **utils:** containerLs() catches errors for spawned processes ([ab8b3de](https://github.com/rafamel/poseup/commit/ab8b3de))
* **utils:** moves ensureError() to ensure.error(); adds ensure.rejection() ([740bfdb](https://github.com/rafamel/poseup/commit/740bfdb))
* **utils/spawn:** passes environment variables to spawned processes ([0700430](https://github.com/rafamel/poseup/commit/0700430))
* allows tasks with no primary or command ([09cd82c](https://github.com/rafamel/poseup/commit/09cd82c))
* handles relative paths ([aa9846b](https://github.com/rafamel/poseup/commit/aa9846b))




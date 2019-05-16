## [0.4.1](https://github.com/rafamel/poseup/compare/v0.4.0...v0.4.1) (2019-05-16)


### Bug Fixes

* **deps:** updates exits to v1 ([3771a2a](https://github.com/rafamel/poseup/commit/3771a2a))



# [0.4.0](https://github.com/rafamel/poseup/compare/v0.3.0...v0.4.0) (2019-05-15)


### Bug Fixes

* **deps:** updates dependencies ([f909430](https://github.com/rafamel/poseup/commit/f909430))
* fixes dependencies usage to match updated versions ([8ae0474](https://github.com/rafamel/poseup/commit/8ae0474))
* **lifecycle/manager:** doesn't duplicate added fns when attaching after they've been added ([890642d](https://github.com/rafamel/poseup/commit/890642d))
* **lifecycle/teardown:** takes into account order of addition for equal types ([661cade](https://github.com/rafamel/poseup/commit/661cade))


### Features

* **bin:** doesn't run catch function if process is already terminating ([664043f](https://github.com/rafamel/poseup/commit/664043f))
* **bin:** sets common flags to be taken by main poseup command ([041438e](https://github.com/rafamel/poseup/commit/041438e))
* **lifecycle/add:** logs errors as warnings when occurring within exits hooks ([9662dd3](https://github.com/rafamel/poseup/commit/9662dd3))
* **lifecycle/attach:** attach doesn't have any effect after the first call ([07f4c06](https://github.com/rafamel/poseup/commit/07f4c06))
* **lifecycle/initialize:** always resets logging level; if absent, sets default ([2097055](https://github.com/rafamel/poseup/commit/2097055))
* **utils/logger:** adds logger prefixes ([f17e7e2](https://github.com/rafamel/poseup/commit/f17e7e2))


### BREAKING CHANGES

* **bin:** When running poseup on CLI, common flags (log, file, dir, env) were previously
taken by `poseup compose`, `poseup run`, `poseup clean` and `poseup purge`. Now these options are
taken by the main command -`poseup`-, so, as an example, to set the logging level you'd run `poseup
--log debug clean` instead of `poseup clean --log debug`.



# [0.3.0](https://github.com/rafamel/poseup/compare/v0.2.0...v0.3.0) (2019-04-30)


### Bug Fixes

* **bin/main:** reads package from file dir ([fcfdf1e](https://github.com/rafamel/poseup/commit/fcfdf1e))
* **deps:** updates cli-belt to 0.3.0 ([9a71b30](https://github.com/rafamel/poseup/commit/9a71b30))
* **deps:** updates dependencies ([dae365b](https://github.com/rafamel/poseup/commit/dae365b))


### Features

* exports attach and teardown from entry point ([0c27fb9](https://github.com/rafamel/poseup/commit/0c27fb9))
* **bin:** properly uses attach() and isAttached() on binary entry point ([c849354](https://github.com/rafamel/poseup/commit/c849354))
* **bin/main:** fails by throwing on no command instead of exiting ([f8896b5](https://github.com/rafamel/poseup/commit/f8896b5))
* **commands/run:** adds local node_modules/.bin to path for local cmd runs ([4578f7d](https://github.com/rafamel/poseup/commit/4578f7d))
* **commands/run:** uses directory as cwd for local cmd execution ([09691b8](https://github.com/rafamel/poseup/commit/09691b8))
* **utils/teardown:** moves add to teardown; if not attached, teardown can now run added fns by itse ([322072b](https://github.com/rafamel/poseup/commit/322072b))



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




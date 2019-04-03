const project = require('./project.config');
const nps = require('./scripts/nps');

/* Verify root */
if (process.cwd() !== project.get('paths.root'))
  throw Error(`Tasks must be run from root`);

/* Project config */
const DOCS_DIR = project.get('paths.docs');
const TS = project.get('typescript');
const EXT = (TS ? project.get('ext.ts').split(',') : [])
  .concat(project.get('ext.js').split(','))
  .filter(Boolean)
  .join(',');
const DOT_EXT = '.' + EXT.replace(/,/g, ',.');
const { COMMIT, COMMITIZEN } = process.env;

process.env.LOG_LEVEL = 'disable';
module.exports = nps({
  build: {
    default: 'nps validate build.force',
    force: 'cross-env NODE_ENV=production nps build.pack build.types',
    pack: [`pack build`].concat(
      project.get('nodeOnly') && [
        `jake pkg:forbid[esnext,main,module]`,
        `babel src --out-dir ./pkg/dist-lib --extensions ${DOT_EXT} --source-maps inline`,
        `jake pkg:add[main,dist-lib/index.js]`
      ]
    ),
    types: TS && [
      `ttsc --project ttsconfig.json --outDir ./pkg/dist-types/`,
      `jake cpr["./src","./pkg/dist-types/",d.ts]`,
      `jake pkg:add[types,dist-types/index.d.ts]`,
      `shx echo "Declaration files built"`
    ]
  },
  publish: `cd ./pkg && npm publish`,
  watch:
    `onchange "./src/**/*.{${EXT}}" --initial --kill -- ` +
    `jake clear run:exec["shx echo ⚡"] run:zero["nps private.watch"]`,
  fix: `prettier --write "./**/*.{${EXT},json,scss}"`,
  types: TS && 'tsc --noEmit --emitDeclarationOnly false',
  lint: {
    default: `eslint ./src ./test --ext ${DOT_EXT}`,
    md: `markdownlint README.md --config markdown.json`,
    scripts: `jake lintscripts`
  },
  test: {
    default: ['nps lint types', 'cross-env NODE_ENV=test jest'],
    watch:
      `onchange "./{src,test}/**/*.{${EXT}}" --initial --kill -- ` +
      'jake clear run:exec["shx echo ⚡"] run:zero["nps test"]'
  },
  validate: [
    // prettier-ignore
    COMMIT && !COMMITIZEN && 'jake run:conditional[' +
        `"\nCommits should be done via 'npm run commit'. Continue?",` +
        '"","exit 1",Yes,5]',
    'nps test lint.md lint.scripts',
    'jake run:zero["npm outdated"]',
    COMMIT && `jake run:conditional["\nCommit?","","exit 1",Yes,5]`
  ],
  docs: TS && [
    `jake run:zero["shx rm -r \"${DOCS_DIR}\""]`,
    `typedoc --out "${DOCS_DIR}" ./src`
  ],
  changelog: 'conventional-changelog -p angular -i CHANGELOG.md -s -r 0',
  update: ['npm update --save/save-dev', 'npm outdated'],
  clean: [
    `jake run:zero["shx rm -r pkg \"${DOCS_DIR}\" coverage CHANGELOG.md"]`,
    'shx rm -rf node_modules'
  ],
  // Private
  private: {
    watch:
      'cross-env NODE_ENV=development concurrently' +
      ' "nps build.pack build.types" "nps lint"' +
      ' -n build,eslint -c blue,yellow',
    preversion: [
      'shx echo "Recommended version bump is:"',
      'conventional-recommended-bump --preset angular --verbose',
      `jake run:conditional["\nContinue?","","exit 1",Yes]`
    ],
    version: [
      'nps changelog',
      project.get('release.docs') && 'nps docs',
      project.get('release.build') && 'nps build',
      'git add .'
    ]
  }
});

#!/usr/bin/env node

'use strict';

/**
 * Application 실행 도구
 *
 * @author foundy
 * @since 2020.06.22
 */
const { execSync, spawn } = require('child_process');
const commander = require('commander');
const inquirer = require('inquirer');
const colors = require('colors');

const apps = require('../apps.json');

const program = new commander.Command();

/**
 * Configuration
 */
const CONF = {
  CDN_HOST: 'https://d13fzx7h5ezopb.cloudfront.net/www/v',
};

// Applications 정렬
apps.sort();

// Interactive mode를 위한 Questions 설정
const q = {
  service: {
    type: 'list',
    name: 'service',
    message: 'Choose Service',
    choices: [...apps],
    default: 'home',
    pageSize: apps.length,
  },
  environment: {
    type: 'list',
    name: 'environment',
    message: 'Choose Environment',
    choices: ['loc', 'dev', 'qa', 'stage', 'prd'],
    default: 'loc',
    pageSize: 5,
  },
  aot: {
    type: 'confirm',
    name: 'aot',
    message: 'Use Ahead of Time compilation',
    default: false,
  },
  parallel: {
    type: 'confirm',
    name: 'parallel',
    message: 'Run builds in parallel',
    default: false,
  },
  proxy: {
    type: 'confirm',
    name: 'proxy',
    message: 'Should I run it in a proxy environment?',
    default: true,
  },
  proxies: {
    /** @todo PM2를 통한 멀티 실행은 운영해본 이후에 필요에 따라 활성 */
    // type: 'checkbox',
    type: 'list',
    name: 'proxies',
    message: 'Choose Service for proxy',
    choices: [...apps],
    pageSize: apps.length,
  },
};

const appsPort = {
  auth: 9001,
  event: 9002,
  home: 9003,
  list: 9004,
  media: 9005,
  member: 9006,
  mypage: 9007,
  order: 9008,
  product: 9009,
  shop: 9010,
};

/**
 * Angular CLI Serve
 */
program
  .command('serve [service]', { isDefault: true })
  .description('Builds the application and starts a web server.')
  .option('-i, --interactive', 'Run interactive mode.')
  .option('-e, --environment <name>', 'Defines the build environment.', 'loc')
  .option('--aot <mode>', 'Build using Ahead of Time compilation.', false)
  .option('--port [number]', 'Port to listen to for serving.')
  .option('--base-href [baseurl]', 'Base url for the application being built.')
  .action(async (service, options) => {
    // interactive mode
    if (options.interactive) {
      const answer = await inquirer.prompt([ q.service, q.environment, q.aot ]);

      // overriding service
      service = answer.service;

      // overriding options
      options.environment = answer.environment;
      options.aot = answer.aot;
    }

    if (!apps.includes(service)) {
      console.error(`${colors.red(service)} is an invalid service.`);
      console.error();
      console.error('Available services:');
      console.error(`  ${colors.green(apps.toString())}`);
      console.error();
      process.exit(1);
    }

    const cmdArgs = [
      'ng',
      'serve',
      `--app=${service}`,
      `--environment=${options.environment}`,
      `--aot=${options.aot}`,
    ];

    options.port && cmdArgs.push(`--port=${options.port}`);
    options.baseHref && cmdArgs.push(`--base-href=${options.baseHref}`);

    runSync(cmdArgs.join(' '), { stdio: 'inherit', maxBuffer: 1024 * 5000 });
  });

/**
 * Angular CLI Build
 */
program
  .command('build [service]')
  .action(async (service, options) => {
    const targets = ['product'];

    while (targets.length) {
      ngBuild(targets.shift());

      if (!options.parallel) {
        targets.length || console.log(colors.green('All builds are complete!'));
      }
    }

    /**
     * 빌드를 위한 명령어 및 옵션을 설정하고 실행합니다.
     *
     * @param {string} target 대상 서비스
     */
    function ngBuild(target) {
      const cmdArgs = [
        'ng',
        'build',
        `--app=${target}`,
       // `--environment=${options.environment}`,
        `--base-href=/${target}/`,
      ];

      console.log(cmdArgs.join(' '))
        runSync(cmdArgs.join(' '), { stdio: 'inherit', maxBuffer: 1024 * 5000 });
    }
  });
program
  .command('build-webpack [service]')
  .action(async (service, options) => {
    const targets = ['dll', 'product']; // vendor 분리 빌드
    while (targets.length) {
      ngBuild(targets.shift());

      if (!options.parallel) {
        targets.length || console.log(colors.green('All builds are complete!'));
      }
    }

    /**
     * 빌드를 위한 명령어 및 옵션을 설정하고 실행합니다.
     *
     * @param {string} target 대상 서비스
     */
    function ngBuild(target) {
      let cmdArgs = ['webpack'];
      if (target === 'dll') {
        // vendor config 별도 설정
        cmdArgs.push('--config ./scripts/config/webpack.dll.config.js');
      } else {

        cmdArgs.push(`--config ./${target}/webpack.config.js`);
      }
      console.log(cmdArgs.join(' '))
      runSync(cmdArgs.join(' '), { stdio: 'inherit', maxBuffer: 1024 * 5000 });
    }
});
program.parse(process.argv);

program.args.length || program.help();

/**
 * Production 레벨 빌드가 필요한 옵션 포함 여부
 *
 * @description Stage, Prod 환경은 production 빌드를 진행한다.
 * @see {@link https://github.com/angular/angular-cli/wiki/1-x-build#--dev-vs---prod-builds|angular-cli wiki}
 */
function hasProdBuildOptions({ aot, environment }) {
  const prodEnvs = ['stage', 'prd'];

  return aot && prodEnvs.includes(environment);
}

/**
 * Production 빌드 여부
 *
 * @description AOT 컴파일이고, Prod 환경인 경우이다.
 */
function isProdBuild({ aot, environment }) {
  return aot && (environment === 'prd');
}

/**
 * Production 배포 여부
 *
 * @description deployVersion은 Jenkins Live인 경우만 사용되므로 Live 배포로 간주한다.
 */
function isProdDeploy({ aot, environment, deployVersion }) {
  return isProdBuild({ aot, environment }) && deployVersion;
}

/**
 * Mac 환경 여부
 */
function isMacOS() {
  return process.platform.toLowerCase() === 'darwin';
}

/**
 * Asynchronous Command 실행
 *
 * @see child_process.spawn 참조
 * @see {@link https://nodejs.org/docs/latest-v10.x/api/child_process.html|Child Processes}
 */
function run(cmd, args, options = {}) {
  const ps = spawn(cmd, args, options);

  ps.stdout.pipe(process.stdout);
  ps.stderr.pipe(process.stderr);

  ps.on('close', (code) => {
    if (code) {
      console.error();
      console.error('Error Command:');
      console.error(colors.red(`  $ ${[cmd, ...args].join(' ')}`));
      console.error();
      process.exit(1);
    }
  });
}

/**
 * Synchronous Command 실행
 *
 * @see child_process.execSync 참조
 * @see {@link https://nodejs.org/docs/latest-v10.x/api/child_process.html|Child Processes}
 */
function runSync(cmd, options = {}) {
  console.log();
  console.log('Execute Command:');
  console.log(colors.yellow(`  $ ${cmd}`));
  console.log();

  try {
    execSync(cmd, options);
  } catch (e) {
    console.error();
    console.error(colors.red(e.message));
    console.error();
    process.exit(1);
  }
}

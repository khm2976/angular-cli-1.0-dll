'use strict';

const { execSync, spawn } = require('child_process');
const commander = require('commander');
const program = new commander.Command();
const colors = require('colors');

program
  .command('build-webpack [service]')
  .action(async (service, options) => {
    const targets = ['product'/*, ... */];
    while (targets.length) {
      ngBuild(targets.shift());

      if (!options.parallel) {
        targets.length || console.log(colors.green('All builds are complete!'));
      }
    }

    function ngBuild(target) {
      let cmdArgs = ['webpack'];
      cmdArgs.push(`--config ./${target}/webpack.config.js`);
      runSync(cmdArgs.join(' '), { stdio: 'inherit', maxBuffer: 1024 * 5000 });
    }
});

program
  .command('build-dll [service]')
  .action(async (service, options) => {
      const cmdArgs= ['webpack --config ./scripts/config/webpack.dll.config.js'];
      runSync(cmdArgs.join(' '), { stdio: 'inherit', maxBuffer: 1024 * 5000 });
});
program
  .command('serve-webpack [service]', { isDefault: true })
  .action(async (service, options) => {
    const cmdArgs = ['webpack-dev-server --progress --config ./product/webpack.config.js'];
    runSync(cmdArgs.join(' '), { stdio: 'inherit', maxBuffer: 1024 * 5000 });
  });

program.parse(process.argv);

program.args.length || program.help();


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

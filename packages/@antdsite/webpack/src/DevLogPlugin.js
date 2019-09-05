const chalk = require('chalk');
const { logger } = require('@antdsite/util');

module.exports = class DevLogPlugin {
  constructor(options) {
    this.options = options;
  }

  apply(compiler) {
    let isFirst = true;
    compiler.hooks.done.tap('antdsite-log', stats => {
      clearScreen();

      const { displayHost, port, publicPath } = this.options;
      const time = new Date().toTimeString().match(/^[\d:]+/)[0];

      logger.success(
        `\n${chalk.gray(`[${time}]`)} Build ${chalk.italic(
          stats.hash.slice(0, 6)
        )} finished in ${stats.endTime - stats.startTime} ms!`
      );
      if (isFirst) {
        isFirst = false;
        console.log(
          `\n${chalk.gray('>')} VuePress dev server listening at ${chalk.cyan(
            `http://${displayHost}:${port}${publicPath}`
          )}`
        );
      }
    });
    compiler.hooks.invalid.tap('antdsite-log', clearScreen);
  }
};

function clearScreen() {
  process.stdout.write('\x1Bc');
}
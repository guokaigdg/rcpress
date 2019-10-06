module.exports = async function dev(sourceDir, cliOptions = {}, isProd) {
  if (isProd) {
    process.env.NODE_ENV = 'production';
  }

  const fs = require('fs-extra');
  const path = require('path');
  const chalk = require('chalk');

  const fileWatcher = require('../../fileWatcher');
  const createServer = require('../../server');
  const prepare = require('../../prepare');

  const {
    WebpackLogPlugin,
    createSPAConfig,
    markdownLoader: { frontMatterEmitter }
  } = require('@rcpress/webpack');
  const { applyUserWebpackConfig, logger } = require('@rcpress/util');

  logger.wait('\nExtracting site metadata...');

  const options = await prepare(sourceDir);

  if (isProd) {
    if (cliOptions.outDir) {
      options.outDir = cliOptions.outDir;
    }

    const { outDir } = options;
    if (path.resolve() === outDir) {
      return console.error(
        logger.error(
          chalk.red('Unexpected option: outDir cannot be set to the current working directory.\n'),
          false
        )
      );
    }
    await fs.remove(outDir);
  }

  // resolve webpack config
  let config = createSPAConfig(options, cliOptions, isProd);

  config
    .plugin('html')
    // using a fork of html-webpack-plugin to avoid it requiring webpack
    // internals from an incompatible version.
    .use(require('vuepress-html-webpack-plugin'), [
      {
        template: path.resolve(__dirname, '../../templates/index.dev.html')
      }
    ]);

  if (!isProd) {
    // setup watchers to update options and dynamically generated files
    const update = () => {
      prepare(sourceDir).catch(err => {
        console.error(logger.error(chalk.red(err.stack), false));
      });
    };

    new fileWatcher(update, sourceDir).watch();

    // also listen for frontMatter changes from markdown files
    frontMatterEmitter.on('update', update);
  } else {
    config.plugin('rcpress-log').use(WebpackLogPlugin, [
      {
        isProd: true
      }
    ]);
  }

  config = config.toConfig();
  const userConfig = options.siteConfig.configureWebpack;
  if (userConfig) {
    config = applyUserWebpackConfig(userConfig, config, false /* isServer */, isProd);
  }

  if (!isProd) {
    await createServer(options, cliOptions, config);
  }
};

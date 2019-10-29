const path = require('path');

module.exports = {
  base: '',
  title: path.relative('../', process.cwd()),
  description: '',
  lang: 'en-US',
  head: [],
  footer: null,
  port: 3000,
  themeConfig: {
    themeColors: null,
    repo: null,
    docsRepo: null,
    docsDir: 'docs',
    docsRelativeDir: '',
    docsBranch: 'master',
    editLinks: true,
    editLinkText: 'Edit this page',
    lastUpdated: 'Last Updated', // string | boolean
    locales: null,
    showAvatarList: true,
    showBackToTop: true,
    maxTocDeep: 3,
    search: true,
    searchMaxSuggestions: 10
  }
};

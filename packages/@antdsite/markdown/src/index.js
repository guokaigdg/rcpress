const grayMatter = require(`gray-matter`);
const mdx = require(`@mdx-js/mdx`);
const generateTOC = require(`mdast-util-toc`);
const { deepMerge } = require('@antdsite/util');
const path = require('path');
const toString = require(`mdast-util-to-string`);

const resolvePlugin = plugins =>
  plugins.map(plugin => require(path.resolve(__dirname, `./reamarkPlugins/${plugin}`)));

/**
 * @returns html, toc, frontMatter, headings
 * @param {*} mdContent mdx content
 */
const createMarkdown = ({ markdown: options = {} }) => {
  const defaultOptions = {
    maxTocDepth: 3,
    remarkPlugins: resolvePlugin([
      'gatsby-remark-ant-alert',
      'remark-default-class-name',
      'remark-header-custom-ids',
      'remark-img-warpper-p',
      'remark-emoji'
    ])
  };
  options = deepMerge(defaultOptions, options);
  const compiler = mdx.createMdxAstCompiler(options);

  const md = rawMDX => {
    let results = {
      toc: [],
      headings: [],
      frontMatter: {}
    };

    const { content: frontMatterCodeResult } = (results.frontMatter = grayMatter(rawMDX));
    const content = `${frontMatterCodeResult}`;
    const mdast = compiler.parse(content);

    // toc
    results.toc = getItems(generateTOC(mdast, { maxDepth: options.maxTocDepth }).map, {});

    // headings
    visit(mdast, `heading`, heading => {
      results.headings.push({
        value: toString(heading),
        depth: heading.depth
      });
    });
    return results;
  };
  md.render = input => mdx.sync(input);

  return md;
};

module.exports = createMarkdown;

function getItems(node, current) {
  if (!node) {
    return {};
  } else if (node.type === 'paragraph') {
    visit(node, item => {
      if (item.type === 'link') {
        current.url = item.url;
      }
      if (item.type === 'text') {
        current.title = item.value;
      }
    });
    return current;
  } else {
    if (node.type === 'list') {
      current.items = node.children.map(i => getItems(i, {}));
      return current;
    } else if (node.type === 'listItem') {
      const heading = getItems(node.children[0], {});
      if (node.children.length > 1) {
        getItems(node.children[1], heading);
      }
      return heading;
    }
  }
  return {};
}
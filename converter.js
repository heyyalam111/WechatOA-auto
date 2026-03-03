// Markdown 转 HTML 转换器
// 专为微信公众号优化，内联CSS，处理特殊标签

const { marked } = require('marked');
const juice = require('juice');
const hljs = require('highlight.js');
const themes = require('./themes');

class WechatConverter {
  constructor(themeName = 'professional') {
    this.theme = themes[themeName] || themes.professional;
    this.links = [];
    this.linkCounter = 0;

    // 配置 marked
    this.configureMarked();
  }

  configureMarked() {
    // 代码高亮
    marked.setOptions({
      highlight: (code, lang) => {
        if (lang && hljs.getLanguage(lang)) {
          try {
            return hljs.highlight(code, { language: lang }).value;
          } catch (e) {}
        }
        return hljs.highlightAuto(code).value;
      }
    });

    // 自定义渲染器
    const renderer = new marked.Renderer();

    // 列表处理：不使用 ul/ol 标签，用 section 替代
    renderer.list = (body, ordered, start) => {
      // 不输出任何包装标签，直接返回列表项
      return body;
    };

    renderer.listitem = (text, task, checked) => {
      // 判断是有序还是无序（通过检查text是否以数字开头）
      const isOrdered = /^\d+\.?/.test(text.trim());
      const symbol = isOrdered
        ? `<span style="color: ${this.theme.primaryColor}; font-weight: bold;">${text.match(/^\d+\.?\s*/)[0]}</span>`
        : `<span style="color: ${this.theme.primaryColor};">•</span>`;

      // 移除原有的数字前缀
      const cleanText = text.replace(/^\d+\.?\s*/, '');

      return `<section style="${this.theme.styles.li}">${symbol} ${cleanText}</section>`;
    };

    // 链接处理：转换为脚注
    renderer.link = (href, title, text) => {
      if (!href) return text;

      this.linkCounter++;
      const refIndex = this.linkCounter;
      this.links.push({ index: refIndex, href, title, text });

      return `<span style="${this.theme.styles.footnote_ref}">[${refIndex}]</span>`;
    };

    // 图片处理
    renderer.image = (href, title, text) => {
      const alt = text || '';
      const titleAttr = title ? ` title="${title}"` : '';
      return `<img src="${href}" alt="${alt}"${titleAttr} style="${this.theme.styles.img}">`;
    };

    // 表格处理
    renderer.table = (header, body) => {
      return `<table style="${this.theme.styles.table}"><thead style="${this.theme.styles.th}">${header}</thead><tbody>${body}</tbody></table>`;
    };

    renderer.tablerow = (content) => {
      return `<tr>${content}</tr>`;
    };

    renderer.tablecell = (content, flags) => {
      const tag = flags.header ? 'th' : 'td';
      const style = flags.header ? this.theme.styles.th : this.theme.styles.td;
      return `<${tag} style="${style}">${content}</${tag}>`;
    };

    // 引用块
    renderer.blockquote = (quote) => {
      return `<blockquote style="${this.theme.styles.blockquote}">${quote}</blockquote>`;
    };

    // 代码块
    renderer.code = (code, language) => {
      const highlighted = language && hljs.getLanguage(language)
        ? hljs.highlight(code, { language }).value
        : hljs.highlightAuto(code).value;

      return `<pre style="${this.theme.styles.code_block}"><code>${highlighted}</code></pre>`;
    };

    // 分割线
    renderer.hr = () => {
      return `<hr style="${this.theme.styles.hr}">`;
    };

    marked.use({ renderer });
  }

  convert(markdown) {
    // 重置链接计数器
    this.links = [];
    this.linkCounter = 0;

    // 1. 解析 Markdown
    let html = marked.parse(markdown);

    // 2. 移除 HTML 换行符（防止微信渲染空行）
    html = html.replace(/>\s*\n\s*</g, '><');

    // 3. 添加脚注区域
    if (this.links.length > 0) {
      const footnotesHtml = this.generateFootnotes();
      html += footnotesHtml;
    }

    // 4. 添加基础容器样式
    html = `<div style="${this.theme.styles.container}">${html}</div>`;

    // 5. 内联 CSS（使用 juice）
    html = juice(html, {
      inlineStyles: true,
      removeStyleTags: false,
      applyAttributesElements: false
    });

    return html;
  }

  generateFootnotes() {
    if (this.links.length === 0) return '';

    let footnotes = `<div style="${this.theme.styles.footnotes}"><h4 style="font-size: 16px; margin-bottom: 12px;">参考资料</h4>`;

    this.links.forEach(link => {
      footnotes += `<p style="margin: 8px 0;">[${link.index}] <a href="${link.href}" style="${this.theme.styles.a}">${link.href}</a></p>`;
    });

    footnotes += '</div>';
    return footnotes;
  }

  // 处理标题样式
  processHeadings(html) {
    // 包装 h1-h4 标题
    html = html.replace(/<h1>(.*?)<\/h1>/g,
      `<h1 style="${this.theme.styles.h1}">$1</h1>`);
    html = html.replace(/<h2>(.*?)<\/h2>/g,
      `<h2 style="${this.theme.styles.h2}">$1</h2>`);
    html = html.replace(/<h3>(.*?)<\/h3>/g,
      `<h3 style="${this.theme.styles.h3}">$1</h3>`);
    html = html.replace(/<h4>(.*?)<\/h4>/g,
      `<h4 style="${this.theme.styles.h4}">$1</h4>`);

    return html;
  }

  // 处理段落
  processParagraphs(html) {
    // 包装段落
    html = html.replace(/<p>(.*?)<\/p>/g,
      (match, content) => {
        // 跳过已经包装的元素
        if (content.includes('<h') || content.includes('<ul') ||
            content.includes('<ol') || content.includes('<pre') ||
            content.includes('<blockquote') || content.includes('<table')) {
          return match;
        }
        return `<p style="${this.theme.styles.p}">${content}</p>`;
      });

    return html;
  }
}

module.exports = WechatConverter;

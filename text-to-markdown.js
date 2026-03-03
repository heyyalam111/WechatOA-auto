// 文本转 Markdown 转换器
// 将纯文本自动转换为带格式的 Markdown

class TextToMarkdown {
  constructor() {}

  /**
   * 将纯文本转换为 Markdown 格式
   * @param {string} text - 纯文本内容
   * @param {object} options - 转换选项
   * @returns {string} Markdown 格式文本
   */
  convert(text, options = {}) {
    const {
      title = '未命名文章',
      theme = 'professional'
    } = options;

    // 清理文本
    let cleaned = this.cleanText(text);

    // 检测文本结构并转换
    let markdown = this.detectAndConvert(cleaned);

    // 添加 frontmatter
    const frontmatter = this.generateFrontmatter(title, theme);

    return frontmatter + '\n\n' + markdown;
  }

  /**
   * 清理文本
   */
  cleanText(text) {
    // 移除多余的空白行
    return text.replace(/\n{3,}/g, '\n\n').trim();
  }

  /**
   * 检测文本结构并转换
   */
  detectAndConvert(text) {
    const lines = text.split('\n');
    let result = [];
    let inList = false;
    let listNumber = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();

      if (!line) {
        inList = false;
        listNumber = 0;
        continue;
      }

      // 检测标题 (# 开头)
      if (this.isHeading(line)) {
        inList = false;
        listNumber = 0;
        result.push(this.convertHeading(line));
        continue;
      }

      // 检测列表项
      if (this.isListItem(line)) {
        if (!inList) {
          inList = true;
          listNumber = 0;
        }
        listNumber++;
        result.push(`${listNumber}. ${this.cleanListItem(line)}`);
        continue;
      }

      // 检测引用
      if (this.isQuote(line)) {
        inList = false;
        listNumber = 0;
        result.push(`> ${this.cleanQuote(line)}`);
        continue;
      }

      // 检测分隔线
      if (this.isHorizontalRule(line)) {
        result.push('---');
        continue;
      }

      // 普通段落
      if (inList && line.length > 50) {
        // 长段落结束列表
        inList = false;
        listNumber = 0;
      }

      // 转换加粗和斜体
      let processed = this.processInlineFormatting(line);
      result.push(processed);
    }

    return result.join('\n\n');
  }

  /**
   * 检测是否为标题
   */
  isHeading(line) {
    // 检查是否以数字+点+标题格式开头，如 "1. 这是标题" 或 "第一章 标题"
    return /^\d+[\.\、]\s+[\u4e00-\u9fa5]/.test(line) ||
           /^第[一二三四五六七八九十百千\d]+[章篇节]\s+/.test(line) ||
           /^[一二三四五六七八九十百千\d]、\s+/.test(line);
  }

  /**
   * 转换标题
   */
  convertHeading(line) {
    // 移除序号，转换为 ## 标题
    let cleaned = line.replace(/^\d+[\.\、]\s+/, '')
                      .replace(/^第[一二三四五六七八九十百千\d]+[章篇节]\s+/, '');
    return `## ${cleaned}`;
  }

  /**
   * 检测是否为列表项
   */
  isListItem(line) {
    // 以 •, -, *, 数字. 开头的是列表
    return /^[\•\-\*]\s+/.test(line) || /^\d+\.\s+/.test(line);
  }

  /**
   * 清理列表项
   */
  cleanListItem(line) {
    return line.replace(/^[\•\-\*]\s+/, '')
               .replace(/^\d+\.\s+/, '');
  }

  /**
   * 检测是否为引用
   */
  isQuote(line) {
    return line.startsWith('"') && line.endsWith('"') ||
           line.startsWith('「') && line.endsWith('」') ||
           line.startsWith('『') && line.endsWith('』');
  }

  /**
   * 清理引用
   */
  cleanQuote(line) {
    return line.replace(/^["「『]|["」』]$/g, '').trim();
  }

  /**
   * 检测分隔线
   */
  isHorizontalRule(line) {
    return /^[-*_]{3,}$/.test(line);
  }

  /**
   * 处理行内格式（加粗、斜体、代码）
   */
  processInlineFormatting(line) {
    let result = line;

    // 转换 **加粗**
    result = result.replace(/\*\*(.+?)\*\*/g, '**$1**');

    // 转换 *斜体*
    result = result.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '*$1*');

    // 转换 `代码`
    result = result.replace(/`([^`]+)`/g, '`$1`');

    // 检测 URL
    result = result.replace(/(https?:\/\/[^\s]+)/g, '[$1]($1)');

    return result;
  }

  /**
   * 生成 YAML frontmatter
   */
  generateFrontmatter(title, theme) {
    return `---
title: ${title}
theme: ${theme}
---`;
  }

  /**
   * 从文本提取标题
   */
  extractTitle(text) {
    const lines = text.split('\n').filter(l => l.trim());

    // 取第一行作为标题
    if (lines.length > 0) {
      let firstLine = lines[0].trim();

      // 如果第一行是标题格式，去掉序号
      if (this.isHeading(firstLine)) {
        firstLine = firstLine.replace(/^\d+[\.\、]\s+/, '')
                             .replace(/^第[一二三四五六七八九十百千\d]+[章篇节]\s+/, '');
      }

      // 截断过长的标题
      if (firstLine.length > 64) {
        firstLine = firstLine.substring(0, 61) + '...';
      }

      return firstLine;
    }

    return '未命名文章';
  }
}

module.exports = TextToMarkdown;

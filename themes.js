// 微信公众号主题样式定义
// 所有CSS必须内联到HTML中

const themes = {
  // 1. 简约专业 - 蓝色主色调，适合技术文章
  professional: {
    name: '简约专业',
    primaryColor: '#1a73e8',
    backgroundColor: '#ffffff',
    textColor: '#333333',
    codeBackground: '#f5f5f5',
    styles: {
      container: 'max-width: 100%; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      h1: 'font-size: 28px; font-weight: 700; color: #1a73e8; margin: 20px 0 16px; border-bottom: 2px solid #1a73e8; padding-bottom: 10px;',
      h2: 'font-size: 22px; font-weight: 600; color: #333; margin: 18px 0 14px; border-left: 4px solid #1a73e8; padding-left: 12px;',
      h3: 'font-size: 18px; font-weight: 600; color: #555; margin: 16px 0 12px;',
      h4: 'font-size: 16px; font-weight: 600; color: #666; margin: 14px 0 10px;',
      p: 'font-size: 16px; line-height: 1.8; color: #333; margin: 12px 0;',
      strong: 'font-weight: 700; color: #1a73e8;',
      em: 'font-style: italic;',
      code_inline: 'background: #f0f0f0; padding: 2px 6px; border-radius: 3px; font-family: "SF Mono", Consolas, monospace; font-size: 14px; color: #d63384;',
      code_block: 'background: #2d2d2d; color: #f8f8f2; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; font-family: "SF Mono", Consolas, monospace; font-size: 14px; line-height: 1.5;',
      blockquote: 'border-left: 4px solid #1a73e8; background: #f8f9fa; padding: 12px 16px; margin: 16px 0; color: #666; font-style: italic;',
      ul: 'margin: 12px 0; padding-left: 24px;',
      li: 'margin: 8px 0; line-height: 1.8;',
      a: 'color: #1a73e8; text-decoration: none; border-bottom: 1px solid #1a73e8;',
      img: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;',
      hr: 'border: none; border-top: 2px dashed #e0e0e0; margin: 24px 0;',
      table: 'width: 100%; border-collapse: collapse; margin: 16px 0;',
      th: 'background: #1a73e8; color: white; padding: 12px; text-align: left; font-weight: 600;',
      td: 'border: 1px solid #ddd; padding: 10px;',
      footnote_ref: 'color: #1a73e8; font-weight: 600; cursor: pointer;',
      footnotes: 'margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; color: #888; font-size: 14px;'
    }
  },

  // 2. 优雅文艺 - 墨绿主色调，适合散文随笔
  elegant: {
    name: '优雅文艺',
    primaryColor: '#2d5a27',
    backgroundColor: '#fafcf9',
    textColor: '#2c3e2c',
    codeBackground: '#2d2d2d',
    styles: {
      container: 'max-width: 100%; padding: 20px; font-family: "Songti SC", "SimSun", "Noto Serif SC", serif;',
      h1: 'font-size: 30px; font-weight: 700; color: #2d5a27; margin: 24px 0 18px; text-align: center; letter-spacing: 2px;',
      h2: 'font-size: 24px; font-weight: 600; color: #2d5a27; margin: 20px 0 16px; text-align: center;',
      h3: 'font-size: 20px; font-weight: 600; color: #3d6a37; margin: 18px 0 14px;',
      h4: 'font-size: 18px; font-weight: 600; color: #4d7a47; margin: 16px 0 12px;',
      p: 'font-size: 17px; line-height: 2; color: #2c3e2c; margin: 12px 0; text-indent: 2em;',
      strong: 'font-weight: 700; color: #2d5a27;',
      em: 'font-style: italic; color: #3d5a37;',
      code_inline: 'background: #e8efe8; padding: 2px 6px; border-radius: 3px; font-family: "SF Mono", Consolas, monospace; font-size: 14px; color: #2d5a27;',
      code_block: 'background: #2d2d2d; color: #f8f8f2; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; font-family: "SF Mono", Consolas, monospace; font-size: 14px; line-height: 1.5;',
      blockquote: 'border-left: 4px solid #2d5a27; background: #f0f4f0; padding: 14px 18px; margin: 18px 0; color: #4a5a4a; font-style: italic; line-height: 1.8;',
      ul: 'margin: 14px 0; padding-left: 28px;',
      li: 'margin: 10px 0; line-height: 2;',
      a: 'color: #2d5a27; text-decoration: none; border-bottom: 1px dotted #2d5a27;',
      img: 'max-width: 100%; height: auto; border-radius: 4px; margin: 18px 0; box-shadow: 0 2px 8px rgba(0,0,0,0.1);',
      hr: 'border: none; border-top: 1px solid #d0d8d0; margin: 28px 0;',
      table: 'width: 100%; border-collapse: collapse; margin: 18px 0;',
      th: 'background: #2d5a27; color: white; padding: 14px; text-align: center; font-weight: 600;',
      td: 'border: 1px solid #c8d4c8; padding: 12px; text-align: center;',
      footnote_ref: 'color: #2d5a27; font-weight: 600; cursor: pointer;',
      footnotes: 'margin-top: 36px; padding-top: 18px; border-top: 1px solid #d8e0d8; color: #6a7a6a; font-size: 14px;'
    }
  },

  // 3. 活力橙 - 橙色主色调，适合营销活动
  vibrant: {
    name: '活力橙',
    primaryColor: '#ff6b35',
    backgroundColor: '#fffaf8',
    textColor: '#333333',
    codeBackground: '#2d2d2d',
    styles: {
      container: 'max-width: 100%; padding: 20px; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;',
      h1: 'font-size: 28px; font-weight: 800; color: #ff6b35; margin: 20px 0 16px; text-transform: uppercase; letter-spacing: 1px;',
      h2: 'font-size: 22px; font-weight: 700; color: #e85a25; margin: 18px 0 14px; border-bottom: 2px solid #ff6b35; padding-bottom: 8px;',
      h3: 'font-size: 18px; font-weight: 600; color: #d54a15; margin: 16px 0 12px;',
      h4: 'font-size: 16px; font-weight: 600; color: #c43a05; margin: 14px 0 10px;',
      p: 'font-size: 16px; line-height: 1.8; color: #333; margin: 12px 0;',
      strong: 'font-weight: 700; color: #ff6b35;',
      em: 'font-style: italic; color: #e85a25;',
      code_inline: 'background: #fff0e8; padding: 2px 6px; border-radius: 3px; font-family: "SF Mono", Consolas, monospace; font-size: 14px; color: #ff6b35;',
      code_block: 'background: #2d2d2d; color: #f8f8f2; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; font-family: "SF Mono", Consolas, monospace; font-size: 14px; line-height: 1.5;',
      blockquote: 'border-left: 4px solid #ff6b35; background: #fff5f0; padding: 14px 18px; margin: 16px 0; color: #cc4400; font-style: italic;',
      ul: 'margin: 12px 0; padding-left: 24px;',
      li: 'margin: 8px 0; line-height: 1.8;',
      a: 'color: #ff6b35; text-decoration: none; font-weight: 600;',
      img: 'max-width: 100%; height: auto; border-radius: 12px; margin: 16px 0; border: 3px solid #ff6b35;',
      hr: 'border: none; border-top: 3px solid #ff6b35; margin: 24px 0;',
      table: 'width: 100%; border-collapse: collapse; margin: 16px 0;',
      th: 'background: #ff6b35; color: white; padding: 12px; text-align: left; font-weight: 700;',
      td: 'border: 2px solid #ffd8c8; padding: 10px;',
      footnote_ref: 'color: #ff6b35; font-weight: 700; cursor: pointer;',
      footnotes: 'margin-top: 32px; padding-top: 16px; border-top: 2px solid #ff6b35; color: #cc4400; font-size: 14px;'
    }
  },

  // 4. 暗黑极客 - 青色主色调，适合程序员
  dark: {
    name: '暗黑极客',
    primaryColor: '#61dafb',
    backgroundColor: '#1a1a2e',
    textColor: '#e0e0e0',
    codeBackground: '#0f0f1a',
    styles: {
      container: 'max-width: 100%; padding: 20px; font-family: "SF Mono", Consolas, "Fira Code", monospace; background: #1a1a2e; color: #e0e0e0;',
      h1: 'font-size: 28px; font-weight: 700; color: #61dafb; margin: 20px 0 16px; text-shadow: 0 0 10px rgba(97, 218, 251, 0.3);',
      h2: 'font-size: 22px; font-weight: 600; color: #61dafb; margin: 18px 0 14px; border-left: 4px solid #61dafb; padding-left: 12px;',
      h3: 'font-size: 18px; font-weight: 600; color: #a8e6cf; margin: 16px 0 12px;',
      h4: 'font-size: 16px; font-weight: 600; color: #88d8b0; margin: 14px 0 10px;',
      p: 'font-size: 15px; line-height: 1.8; color: #c0c0c0; margin: 12px 0;',
      strong: 'font-weight: 700; color: #61dafb;',
      em: 'font-style: italic; color: #a8e6cf;',
      code_inline: 'background: #2a2a4e; padding: 3px 8px; border-radius: 4px; font-family: "SF Mono", Consolas, monospace; font-size: 14px; color: #ff79c6;',
      code_block: 'background: #0f0f1a; color: #f8f8f2; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0; font-family: "SF Mono", Consolas, monospace; font-size: 14px; line-height: 1.5; border: 1px solid #3a3a5e;',
      blockquote: 'border-left: 4px solid #61dafb; background: #2a2a4e; padding: 12px 16px; margin: 16px 0; color: #a0a0c0; font-style: italic;',
      ul: 'margin: 12px 0; padding-left: 24px;',
      li: 'margin: 8px 0; line-height: 1.8;',
      a: 'color: #61dafb; text-decoration: none; border-bottom: 1px solid #61dafb;',
      img: 'max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; border: 2px solid #3a3a5e;',
      hr: 'border: none; border-top: 1px solid #3a3a5e; margin: 24px 0;',
      table: 'width: 100%; border-collapse: collapse; margin: 16px 0;',
      th: 'background: #2a2a4e; color: #61dafb; padding: 12px; text-align: left; font-weight: 600; border: 1px solid #3a3a5e;',
      td: 'border: 1px solid #3a3a5e; padding: 10px; color: #c0c0c0;',
      footnote_ref: 'color: #61dafb; font-weight: 700; cursor: pointer;',
      footnotes: 'margin-top: 32px; padding-top: 16px; border-top: 1px solid #3a3a5e; color: #808090; font-size: 14px;'
    }
  }
};

module.exports = themes;

// 微信公众号发布 - 主入口文件

const fs = require('fs');
const path = require('path');
const config = require('./config');
const themes = require('./themes');
const WechatConverter = require('./converter');
const ImageUploader = require('./image-uploader');
const CoverGenerator = require('./cover-generator');
const TextToMarkdown = require('./text-to-markdown');

class WechatPublisher {
  constructor(options = {}) {
    this.themeName = options.theme || config.defaults.theme;
    this.retryTimes = options.retryTimes || config.defaults.retryTimes;
    this.retryDelay = options.retryDelay || config.defaults.retryDelay;

    this.wechatConfig = config.wechat;
    this.tempDir = path.join(__dirname, 'temp');
  }

  /**
   * 主发布流程
   * @param {string} markdownFilePath - Markdown 文件路径
   * @param {object} options - 发布选项
   * @returns {Promise<object>} 发布结果
   */
  async publish(markdownFilePath, options = {}) {
    try {
      // 检查是否有进行中的发布任务
      const lockFile = path.join(this.tempDir, '.publish.lock');
      if (fs.existsSync(lockFile)) {
        const lockContent = fs.readFileSync(lockFile, 'utf-8');
        const lockTime = parseInt(lockContent);
        const now = Date.now();
        // 如果锁文件在5分钟内创建，可能是上一次发布在进行中
        if (now - lockTime < 5 * 60 * 1000) {
          return { success: false, message: '已有发布任务正在进行中，请稍后再试' };
        }
        // 锁文件过期，删除它
        fs.unlinkSync(lockFile);
      }

      // 创建锁文件
      fs.writeFileSync(lockFile, Date.now().toString());

      console.log('='.repeat(50));
      console.log('开始发布到微信公众号');
      console.log('='.repeat(50));

      // 1. 读取 Markdown 文件
      console.log('\n[1/9] 读取 Markdown 文件...');
      let { content: markdown, metadata } = this.readMarkdownFile(markdownFilePath);
      console.log(`✓ 文件读取成功`);

      // 2. 获取公众号账号
      console.log('\n[2/9] 获取公众号账号...');
      const account = await this.getWechatAccount(options.account);
      console.log(`✓ 使用公众号: ${account.name}`);

      // 3. 提取标题
      const title = this.extractTitle(markdown, metadata);
      console.log(`\n[3/9] 文章标题: ${title}`);

      // 4. 生成封面图
      console.log('\n[4/9] 生成 AI 封面图...');
      let coverImageUrl = options.coverImage || null;
      // 如果没有封面图且不是自动生成，使用默认占位图
      if (!coverImageUrl && options.autoCover === false) {
        coverImageUrl = 'https://imgbb.com/images/default-cover.png';
      }
      if (!coverImageUrl && options.autoCover !== false) {
        const coverResult = await this.generateCover(title, markdown);
        if (coverResult.success) {
          console.log(`✓ 封面图已生成: ${coverResult.filePath}`);
          // 上传封面图
          const uploader = new ImageUploader();
          const uploadResult = await uploader.uploadToImgBB(coverResult.filePath, 'cover.png');
          if (uploadResult.success) {
            coverImageUrl = uploadResult.url;
            console.log(`✓ 封面上传成功: ${coverImageUrl}`);
          } else {
            console.warn(`⚠ 封面上传失败: ${uploadResult.error}`);
          }
        } else {
          console.warn(`⚠ 封面图生成失败: ${coverResult.error}`);
        }
      }

      // 5. 处理本地图片
      console.log('\n[5/9] 处理本地图片...');
      const uploader = new ImageUploader();
      const imageResult = await uploader.processMarkdownImages(markdown, markdownFilePath);
      markdown = imageResult.content;
      console.log(`✓ 已处理 ${imageResult.uploadedCount} 张图片`);
      if (imageResult.errors.length > 0) {
        console.warn(`⚠ ${imageResult.errors.length} 张图片上传失败`);
      }

      // 6. 转换 Markdown 为 HTML
      console.log('\n[6/9] 转换为 HTML...');
      const converter = new WechatConverter(this.themeName);
      const htmlContent = converter.convert(markdown);
      console.log(`✓ 转换完成`);

      // 7. 生成摘要
      console.log('\n[7/9] 生成摘要...');
      const summary = this.generateSummary(markdown, options.summary);
      console.log(`✓ 摘要: ${summary.substring(0, 50)}...`);

      // 8. 发布到公众号
      console.log('\n[8/9] 发布到公众号草稿箱...');
      const publishResult = await this.publishToWechat({
        account,
        title,
        content: htmlContent,
        summary,
        coverImage: coverImageUrl
      });

      if (publishResult.success) {
        console.log(`✓ 发布成功!`);
        console.log(`  文章ID: ${publishResult.articleId}`);
        console.log(`  草稿链接: ${publishResult.url}`);
      } else {
        throw new Error(publishResult.error);
      }

      // 9. 清理临时文件
      console.log('\n[9/9] 清理临时文件...');
      this.cleanupTempFiles();
      this.removeLockFile();
      console.log(`✓ 清理完成`);

      return {
        success: true,
        message: '发布成功',
        articleId: publishResult.articleId,
        url: publishResult.url
      };

    } catch (error) {
      console.error('\n❌ 发布失败:', error.message);
      this.removeLockFile();
      return {
        success: false,
        message: error.message
      };
    }
  }

  /**
   * 删除发布锁文件
   */
  removeLockFile() {
    try {
      const lockFile = path.join(this.tempDir, '.publish.lock');
      if (fs.existsSync(lockFile)) {
        fs.unlinkSync(lockFile);
      }
    } catch (e) {
      // 忽略删除锁文件的错误
    }
  }

  /**
   * 读取 Markdown 文件
   */
  readMarkdownFile(filePath) {
    // 验证文件存在
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    // 读取内容
    const content = fs.readFileSync(filePath, 'utf-8');

    // 解析 YAML frontmatter
    let metadata = {};
    let markdown = content;

    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const frontmatter = frontmatterMatch[1];
      markdown = content.replace(frontmatterMatch[0], '').trim();

      // 解析 YAML
      frontmatter.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split(':');
        if (key && valueParts.length > 0) {
          metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
        }
      });
    }

    return { content: markdown, metadata };
  }

  /**
   * 文本转 Markdown
   * @param {string} text - 纯文本内容
   * @param {object} options - 选项
   * @returns {string} Markdown 内容
   */
  textToMarkdown(text, options = {}) {
    const converter = new TextToMarkdown();

    // 自动提取标题
    const title = options.title || converter.extractTitle(text);

    // 转换
    const markdown = converter.convert(text, {
      title,
      theme: options.theme || this.themeName
    });

    return { markdown, title };
  }

  /**
   * 获取公众号账号
   */
  async getWechatAccount(preferredAccount) {
    const accounts = await this.getWechatAccounts();

    if (accounts.length === 0) {
      throw new Error('没有找到可用的公众号账号');
    }

    if (preferredAccount) {
      const matched = accounts.find(a =>
        a.name.includes(preferredAccount) || a.appid === preferredAccount
      );
      if (matched) return matched;
    }

    if (accounts.length === 1) {
      return accounts[0];
    }

    // 多个账号，让用户选择
    console.log('\n请选择公众号账号:');
    accounts.forEach((acc, index) => {
      console.log(`  ${index + 1}. ${acc.name} (${acc.appid})`);
    });
    // 这里需要用户交互，实际使用时通过 options.account 指定

    return accounts[0]; // 默认选第一个
  }

  /**
   * 获取公众号账号列表
   */
  async getWechatAccounts() {
    const url = `${this.wechatConfig.baseUrl}/wechat-accounts`;

    for (let attempt = 1; attempt <= this.retryTimes; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'X-API-Key': this.wechatConfig.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({})
        });

        if (response.ok) {
          const result = await response.json();
          // 处理不同的返回格式
          if (result.data && result.data.accounts) {
            return result.data.accounts;
          }
          return result.data || result.accounts || [];
        }

        if (attempt < this.retryTimes) {
          console.log(`获取账号失败，${this.retryDelay/1000}秒后重试...`);
          await this.delay(this.retryDelay);
        }
      } catch (error) {
        console.error(`获取账号失败 (尝试 ${attempt}/${this.retryTimes}):`, error.message);
        if (attempt < this.retryTimes) {
          await this.delay(this.retryDelay);
        }
      }
    }

    throw new Error('获取公众号账号列表失败');
  }

  /**
   * 提取标题
   */
  extractTitle(markdown, metadata) {
    // 优先使用 metadata 中的标题
    if (metadata.title) {
      return metadata.title;
    }

    // 从 Markdown 中提取 # 标题
    const h1Match = markdown.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    // 默认标题
    return '未命名文章';
  }

  /**
   * 生成封面图
   * @param {string} title - 文章标题
   * @param {string} markdown - 完整文章内容
   */
  async generateCover(title, markdown) {
    const generator = new CoverGenerator();
    return await generator.generateCover(title, this.tempDir, markdown);
  }

  /**
   * 生成摘要
   */
  generateSummary(markdown, customSummary) {
    if (customSummary) {
      return customSummary;
    }

    // 移除 Markdown 语法后提取前100字
    const plainText = markdown
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/`/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    return plainText.substring(0, 120);
  }

  /**
   * 发布到公众号
   */
  async publishToWechat(params) {
    const url = `${this.wechatConfig.baseUrl}/wechat-publish`;

    // 验证标题长度
    if (params.title.length > 64) {
      throw new Error(`标题超过64字符限制，当前: ${params.title.length}字符`);
    }

    // 验证摘要长度
    if (params.summary.length > 120) {
      throw new Error(`摘要超过120字符限制，当前: ${params.summary.length}字符`);
    }

    const payload = {
      wechatAppid: params.account.wechatAppid,
      title: params.title,
      content: params.content,
      summary: params.summary,
      coverImage: params.coverImage || '',
      contentFormat: 'html',
      articleType: 'news'
    };

    for (let attempt = 1; attempt <= this.retryTimes; attempt++) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'X-API-Key': this.wechatConfig.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        console.log(`API响应 [${attempt}]:`, JSON.stringify(result).substring(0, 200));

        // 成功条件：response.ok 且 result.success 为 true，或者 result.data 存在
        if (response.ok && (result.success === true || result.data)) {
          return {
            success: true,
            articleId: result.data?.publicationId || result.data?.articleId || result.articleId,
            url: result.data?.url || result.url
          };
        }

        const errorMsg = result.error || result.message || '发布失败';
        console.log(`发布失败 (尝试 ${attempt}/${this.retryTimes}): ${errorMsg}`);

        if (attempt < this.retryTimes) {
          await this.delay(this.retryDelay);
        } else {
          return { success: false, error: errorMsg };
        }
      } catch (error) {
        console.error(`发布异常 (尝试 ${attempt}/${this.retryTimes}):`, error.message);
        if (attempt < this.retryTimes) {
          await this.delay(this.retryDelay);
        } else {
          return { success: false, error: error.message };
        }
      }
    }

    return { success: false, error: '发布失败，已达最大重试次数' };
  }

  /**
   * 清理临时文件
   */
  cleanupTempFiles() {
    try {
      if (fs.existsSync(this.tempDir)) {
        const files = fs.readdirSync(this.tempDir);
        files.forEach(file => {
          if (file !== '.gitkeep') {
            fs.unlinkSync(path.join(this.tempDir, file));
          }
        });
      }
    } catch (error) {
      console.warn('清理临时文件失败:', error.message);
    }
  }

  /**
   * 延迟函数
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = WechatPublisher;

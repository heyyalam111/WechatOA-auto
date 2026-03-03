// 云雾AI 封面图生成模块
// 使用 OpenAI 兼容接口生成公众号封面图
// 支持根据文章内容智能生成相关封面

const fs = require('fs');
const path = require('path');
const https = require('https');
const config = require('./config');

class CoverGenerator {
  constructor() {
    this.apiKey = config.yunwu.apiKey;
  }

  /**
   * 从 Markdown 中提取标题
   */
  extractTitle(markdown) {
    const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
    if (frontmatterMatch) {
      const titleMatch = frontmatterMatch[1].match(/title:\s*(.+)/);
      if (titleMatch) {
        return titleMatch[1].trim().replace(/^["']|["']$/g, '');
      }
    }

    const h1Match = markdown.match(/^#\s+(.+)$/m);
    if (h1Match) {
      return h1Match[1].trim();
    }

    return '公众号文章';
  }

  /**
   * 分析文章内容，提取关键词和主题
   */
  analyzeContent(markdown) {
    // 移除 Markdown 语法
    const text = markdown
      .replace(/^#+\s+/gm, '')
      .replace(/\*\*/g, '')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '')
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\n+/g, ' ')
      .trim();

    // 提取前500字用于分析
    const contentPreview = text.substring(0, 500);

    // 关键词匹配
    const keywords = {
      // 求职招聘
      job: { keywords: ['求职', '招聘', '简历', '面试', '工作', '职场', '跳槽', '入职', 'offer'], style: 'professional', color: '#1a73e8', theme: 'business' },
      // AI科技
      ai: { keywords: ['AI', '人工智能', 'Claude', 'ChatGPT', 'GPT', '大模型', '算法', '机器人'], style: 'tech', color: '#61dafb', theme: 'technology' },
      // 编程开发
      code: { keywords: ['代码', '编程', '开发', '程序员', 'Python', 'JavaScript', 'Git', 'API'], style: 'tech', color: '#2d5a27', theme: 'technology' },
      // 创业商业
      business: { keywords: ['创业', '商业', '赚钱', '变现', '收入', '公司', '融资', '产品'], style: 'business', color: '#ff6b35', theme: 'business' },
      // 学习成长
      learning: { keywords: ['学习', '成长', '技能', '提升', '效率', '方法', '经验', '分享'], style: 'minimalist', color: '#9c27b0', theme: 'education' },
      // 生活休闲
      life: { keywords: ['生活', '日常', '旅行', '美食', '健康', '运动', '周末'], style: 'lifestyle', color: '#e91e63', theme: 'lifestyle' },
      // 金融理财
      finance: { keywords: ['理财', '投资', '股票', '基金', '赚钱', '财务', '收益'], style: 'professional', color: '#4caf50', theme: 'finance' }
    };

    let matchedCategory = null;
    let maxMatches = 0;

    for (const [key, data] of Object.entries(keywords)) {
      const matches = data.keywords.filter(kw => contentPreview.includes(kw)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        matchedCategory = data;
      }
    }

    // 如果没有匹配，使用默认
    if (!matchedCategory) {
      matchedCategory = { style: 'minimalist', color: '#1a73e8', theme: 'general' };
    }

    return {
      category: matchedCategory,
      contentPreview,
      text
    };
  }

  /**
   * 生成封面图
   * @param {string} title - 文章标题
   * @param {string} outputDir - 输出目录
   * @param {string} markdown - 完整的Markdown内容（可选，用于内容分析）
   * @returns {Promise<{success: boolean, filePath?: string, error?: string}>}
   */
  async generateCover(title, outputDir = './temp', markdown = '') {
    try {
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }

      // 分析内容获取主题
      const analysis = markdown ? this.analyzeContent(markdown) : { category: { style: 'minimalist', color: '#1a73e8', theme: 'general' } };

      // 构建智能提示词
      const prompt = this.buildSmartPrompt(title, analysis);

      console.log(`  封面主题: ${analysis.category.theme}, 风格: ${analysis.category.style}, 主色调: ${analysis.category.color}`);

      const imageUrl = await this.generateWithOpenAI(prompt);

      if (!imageUrl) {
        return { success: false, error: '未能生成图片' };
      }

      const fileName = `cover_${Date.now()}.png`;
      const filePath = path.join(outputDir, fileName);
      await this.downloadImage(imageUrl, filePath);

      return {
        success: true,
        filePath: filePath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 构建智能提示词
   */
  buildSmartPrompt(title, analysis) {
    const { category } = analysis;
    const color = category.color;

    // 风格描述
    const styleDescriptions = {
      professional: 'Professional business style, clean and formal, corporate aesthetic',
      tech: 'Modern tech style, futuristic, digital, sleek design',
      business: 'Bold business style, entrepreneurial, dynamic',
      minimalist: 'Minimalist design, clean, simple, modern',
      lifestyle: 'Lifestyle photography style, warm, inviting, natural'
    };

    // 主题描述
    const themeDescriptions = {
      technology: 'Show elements of AI, digital technology, circuits, or futuristic elements',
      business: 'Show charts, graphs, growth arrows, or business meeting elements',
      education: 'Show books, lightbulbs, learning tools, or growth elements',
      lifestyle: 'Show everyday life elements, people, activities',
      finance: 'Show financial charts, coins, upward trends, money symbols',
      general: 'Show abstract shapes, modern graphics'
    };

    return `Create a stunning WeChat article cover image.

Requirements:
1. Aspect ratio 2.35:1 (wide format for WeChat cover)
2. Strong visual impact, eye-catching
3. Clean and uncluttered background
4. Modern, professional design suitable for Chinese social media
5. Do NOT include any text in the image
6. Color scheme: primarily ${color} with complementary colors

Style: ${styleDescriptions[category.style] || styleDescriptions.minimalist}
Theme: ${themeDescriptions[category.theme] || themeDescriptions.general}

The cover should visualize the article about: "${title}"

Generate only the image, no text explanations.`;
  }

  /**
   * 使用 OpenAI 兼容接口生成图片
   */
  generateWithOpenAI(prompt) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'yunwu.ai',
        path: '/v1/images/generations',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + this.apiKey
        }
      };

      const postData = JSON.stringify({
        model: 'dall-e-3',
        prompt: prompt,
        size: '1792x1024',
        n: 1,
        quality: 'standard'
      });

      const req = https.request(options, res => {
        let data = '';
        res.on('data', c => data += c);
        res.on('end', () => {
          try {
            const result = JSON.parse(data);
            if (result.data && result.data[0] && result.data[0].url) {
              resolve(result.data[0].url);
            } else if (result.error) {
              reject(new Error(result.error.message || 'API错误'));
            } else {
              reject(new Error('未获取到图片URL'));
            }
          } catch (e) {
            reject(new Error('解析响应失败: ' + data));
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }

  /**
   * 下载图片到本地
   */
  downloadImage(url, filePath) {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : require('http');
      protocol.get(url, response => {
        if (response.statusCode === 301 || response.statusCode === 302) {
          this.downloadImage(response.headers.location, filePath).then(resolve).catch(reject);
          return;
        }
        const file = fs.createWriteStream(filePath);
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', reject);
    });
  }

  // 保留旧接口兼容性
  buildPrompt(title) {
    return this.buildSmartPrompt(title, { category: { style: 'minimalist', color: '#1a73e8', theme: 'general' } });
  }
}

module.exports = CoverGenerator;

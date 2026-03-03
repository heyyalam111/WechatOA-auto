// ImgBB 图片上传模块
// 上传本地图片到 ImgBB 图床

const fs = require('fs');
const path = require('path');
const config = require('./config');

class ImageUploader {
  constructor() {
    this.apiKey = config.imgbb.apiKey;
    this.endpoint = config.imgbb.endpoint;
  }

  /**
   * 上传单张图片到 ImgBB
   * @param {string} localFilePath - 本地文件路径
   * @param {string} fileName - 可选的文件名
   * @returns {Promise<{success: boolean, url?: string, error?: string}>}
   */
  async uploadToImgBB(localFilePath, fileName) {
    try {
      // 检查文件是否存在
      if (!fs.existsSync(localFilePath)) {
        return { success: false, error: `文件不存在: ${localFilePath}` };
      }

      // 读取图片文件
      const imageData = fs.readFileSync(localFilePath);
      const base64Image = imageData.toString('base64');

      // 构建 FormData
      const formData = new URLSearchParams();
      formData.append('key', this.apiKey);
      formData.append('image', base64Image);
      if (fileName) {
        formData.append('name', fileName);
      }

      // 调用 ImgBB API
      const response = await fetch(this.endpoint, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        return {
          success: true,
          url: result.data.url,
          deleteUrl: result.data.delete_url
        };
      } else {
        return {
          success: false,
          error: result.error?.message || '上传失败'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 处理 Markdown 中的本地图片
   * @param {string} markdown - Markdown 内容
   * @param {string} basePath - Markdown 文件的基础路径
   * @returns {Promise<{content: string, uploadedCount: number, errors: string[]}>}
   */
  async processMarkdownImages(markdown, basePath) {
    // 匹配本地图片路径的正则
    const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
    const localImageRegex = /^(?!http|https|data:image|\/\/)/;

    let match;
    let processedMarkdown = markdown;
    let uploadedCount = 0;
    const errors = [];

    // 收集所有需要上传的图片
    const imagesToUpload = [];
    while ((match = imageRegex.exec(markdown)) !== null) {
      const altText = match[1];
      const imagePath = match[2];

      // 只处理本地图片
      if (localImageRegex.test(imagePath)) {
        imagesToUpload.push({ altText, imagePath, matchStr: match[0] });
      }
    }

    // 逐个上传图片
    for (const img of imagesToUpload) {
      // 转换为绝对路径
      const absolutePath = path.isAbsolute(img.imagePath)
        ? img.imagePath
        : path.resolve(path.dirname(basePath), img.imagePath);

      console.log(`正在上传图片: ${absolutePath}`);

      const result = await this.uploadToImgBB(absolutePath, path.basename(img.imagePath));

      if (result.success) {
        // 替换 Markdown 中的图片路径
        processedMarkdown = processedMarkdown.replace(
          img.matchStr,
          `![${img.altText}](${result.url})`
        );
        uploadedCount++;
        console.log(`上传成功: ${result.url}`);
      } else {
        errors.push(`图片上传失败: ${img.imagePath} - ${result.error}`);
        console.error(`上传失败: ${img.imagePath}`, result.error);
      }
    }

    return {
      content: processedMarkdown,
      uploadedCount,
      errors
    };
  }
}

module.exports = ImageUploader;

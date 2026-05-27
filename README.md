# 微信公众号发布 Skill

语言：中文 | [English](README_EN.md)

`WechatOA-auto` 是一个将 Markdown 文章发布到微信公众号草稿箱的 Claude Code Skill 与 Node.js 工具。它支持主题化排版、AI 封面图、本地图片上传、Markdown 转微信兼容 HTML，以及纯文本转 Markdown。

## 核心能力

- 读取 Markdown 文件并解析 YAML frontmatter。
- 支持 4 种主题：`professional`、`elegant`、`vibrant`、`dark`。
- 将 Markdown 转为微信公众号可用的内联样式 HTML。
- 自动上传本地图片到图床并替换链接。
- 自动生成 2.35:1 封面图并上传。
- 获取公众号账号列表并发布到草稿箱。
- 将纯文本自动转换为 Markdown，再进入发布流程。

## 仓库结构

```text
.
├── SKILL.md              # Claude Code Skill 定义
├── main.js               # 发布主流程
├── converter.js          # Markdown -> 微信 HTML
├── text-to-markdown.js   # 纯文本 -> Markdown
├── image-uploader.js     # 图片上传
├── cover-generator.js    # AI 封面图生成
├── cover-prompt.md       # 封面图提示词
├── config.js             # 服务配置
├── themes.js             # 主题样式
├── package.json
└── package-lock.json
```

## 安装

```bash
git clone https://github.com/heyyalam111/WechatOA-auto.git
cd WechatOA-auto
npm install
```

建议使用 Node.js 18+，因为代码使用了内置 `fetch`。

## 配置

当前代码从 `config.js` 读取：

- 微信公众号发布 API
- ImgBB 图床 API
- 云雾 AI 封面图 API
- 默认主题、重试次数和超时

安全建议：不要在公开仓库提交真实 API Key。生产使用时应把 `config.js` 改成读取环境变量或本地未跟踪配置文件，并轮换已经暴露过的密钥。

## Markdown 示例

```markdown
---
title: VS Code 效率技巧
theme: professional
---

# 10 个提升效率的 VS Code 技巧

这里是正文。

![本地图片](images/demo.png)
```

标题最多 64 字符，摘要最多 120 字符。

## Claude Code 使用方式

将本仓库作为 Skill 放到 Claude Code 可发现目录后，可用以下请求：

```text
把 article.md 发布到公众号
/publish-wechat article.md
发小绿书 article.md
把这段文字转成 markdown 发到公众号
```

## Node.js 调用方式

当前仓库导出 `WechatPublisher` 类，可在脚本中调用：

```javascript
const WechatPublisher = require('./main');

async function run() {
  const publisher = new WechatPublisher({ theme: 'professional' });
  const result = await publisher.publish('article.md');
  console.log(result);
}

run();
```

## 发布流程

1. 检查发布锁，避免重复任务。
2. 读取 Markdown 文件。
3. 获取公众号账号。
4. 提取标题。
5. 生成并上传封面图。
6. 上传 Markdown 中的本地图片。
7. 转换为微信兼容 HTML。
8. 生成摘要。
9. 发布到公众号草稿箱。
10. 清理临时文件。

## 主题

| 主题 | 参数 | 适用场景 |
|---|---|---|
| 简约专业 | `professional` | 技术、职场、教程 |
| 优雅文艺 | `elegant` | 随笔、访谈、品牌故事 |
| 活力橙 | `vibrant` | 营销、活动、增长文章 |
| 暗黑极客 | `dark` | 程序员、AI、工程实践 |

## 输出

发布成功后返回：

```json
{
  "success": true,
  "message": "发布成功",
  "articleId": "xxx",
  "url": "https://..."
}
```

## 限制

- 多公众号场景下，代码会默认选第一个账号；需要稳定发布时建议通过选项指定账号。
- 封面图或图片上传失败时会降级继续，但可能影响最终草稿展示。
- 微信公众号后台仍需人工最终发布。

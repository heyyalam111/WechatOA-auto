---
name: wechat-publish
description: "将Markdown文章发布到微信公众号草稿箱。触发命令：/publish-wechat。支持：发布到公众号、发小绿书、把md文件发公众号。4种主题风格，AI生成封面图，本地图片自动上传云端。额外功能：可将纯文本内容自动转换为Markdown格式。"
license: MIT
---

# 微信公众号发布 Skill

## 概述

此 Skill 用于将 Markdown 文章一键发布到微信公众号草稿箱。支持：
- 4种精美主题风格
- AI 自动生成封面图
- 本地图片自动上传到云端
- Markdown 转微信公众号兼容 HTML
- **文本转 Markdown**（新增）

## 触发方式

| 触发词 | 示例 |
|--------|------|
| 发布到公众号 | "把 article.md 发布到公众号" |
| 发布到微信 | "将这篇 Markdown 发到微信" |
| 发小绿书 | "发小绿书 /path/to/file.md" |
| 斜杠命令 | "/publish-wechat article.md" |
| 文本转Markdown | "把这篇文章转成markdown" |

## 使用前提

1. 安装依赖：
   ```bash
   cd skills/wechat-publish
   npm install
   ```

2. 确保配置文件 `config.js` 中的 API Key 已正确配置：
   - 微信公众号 API Key
   - ImgBB 图床 API Key
   - 云雾AI API Key

## 工作流程

### 步骤1：解析用户输入
- 判断输入是文件路径还是纯文本
- 提取可选的主题风格参数

### 步骤1.5：文本转 Markdown（如输入是纯文本）
- 自动检测文本结构
- 转换标题（数字序号、章节名等）
- 转换列表项
- 转换引用
- 转换行内格式（加粗、斜体、代码、链接）
- 自动提取标题

### 步骤2：读取 Markdown 文件
- 解析 YAML frontmatter（提取标题、摘要等）
- 如无 frontmatter，从内容中提取 # 标题

### 步骤3：验证内容
- 标题长度 ≤ 64字符（否则报错）
- 内容非空

### 步骤4：获取公众号列表
- 调用 API 获取公众号列表
- 1个直接使用，多个让用户选择

### 步骤5：生成 AI 封面图
- 调用云雾AI生成 2.35:1 封面图
- 自动上传到 ImgBB

### 步骤6：处理本地图片
- 扫描 Markdown 中的本地图片路径
- 逐个上传到 ImgBB 并替换 URL

### 步骤7：转换 Markdown 为 HTML
- 使用 marked.js 解析
- 使用 juice 内联 CSS
- 使用 highlight.js 语法高亮
- 链接转换为脚注形式

### 步骤8：生成摘要
- 取文章前 100 字
- 验证长度 ≤ 120 字符

### 步骤9：发布到公众号
- 调用发布 API
- 返回发布结果

### 步骤10：清理临时文件

## 主题风格

| 风格 | 参数值 | 主色调 | 适用场景 |
|------|--------|--------|----------|
| 简约专业 | `professional` | #1a73e8 (蓝) | 技术文章 |
| 优雅文艺 | `elegant` | #2d5a27 (墨绿) | 散文随笔 |
| 活力橙 | `vibrant` | #ff6b35 (橙) | 营销活动 |
| 暗黑极客 | `dark` | #61dafb (青) | 程序员 |

### 指定主题

在文件中添加 YAML frontmatter：

```yaml
---
title: 我的文章标题
theme: elegant
---
```

或在文件名中指定：
- `article-professional.md` → 简约专业风格
- `article-elegant.md` → 优雅文艺风格
- `article-vibrant.md` → 活力橙风格
- `article-dark.md` → 暗黑极客风格

## 使用示例

### 示例1：基本发布
```
用户: 把 demo.md 发布到公众号

系统: 正在发布...
✓ 读取文件: demo.md
✓ 使用公众号: 我的公众号
✓ 标题: 10个提升效率的VS Code技巧
✓ 封面图生成成功
✓ 处理 3 张本地图片
✓ HTML 转换完成
✓ 发布成功! 文章ID: xxx
```

### 示例2：指定主题
```
用户: 将 article.md 用优雅文艺风格发到公众号
```

### 示例3：使用斜杠命令
```
用户: /publish-wechat /path/to/article.md
```

## Markdown 格式支持

### 支持的元素

- 标题 (h1-h6)
- 加粗、斜体、删除线
- 有序/无序列表
- 代码块（带语法高亮）
- 引用块
- 表格
- 图片
- 分割线
- 链接（自动转为脚注）

### 示例

```markdown
---
title: VS Code 效率技巧
theme: professional
---

# 10个提升效率的 VS Code 技巧

大家好，今天分享10个实用的 VS Code 技巧。

## 1. 多光标编辑

按住 `Alt` 点击可以同时编辑多处：

```javascript
const a = 1;
const b = 2;
const c = 3;
```

## 2. 快捷键

| 快捷键 | 功能 |
|--------|------|
| Ctrl+Shift+P | 命令面板 |
| Ctrl+D | 选中下一个 |

> 工具用得好，下班走得早！

更多技巧请参考 [官方文档](https://code.visualstudio.com/docs)。

![插件市场](images/extensions.png)

---

觉得有帮助，记得点个赞！
```

## 错误处理

| 错误情况 | 处理方式 |
|----------|----------|
| 文件不存在 | 报错，提示正确的文件路径 |
| 标题超64字符 | 报错，要求用户修改 |
| 摘要超120字符 | 报错，使用截断内容 |
| API调用失败 | 重试3次，每次间隔2秒 |
| 图片上传失败 | 跳过该图片，继续处理 |
| 封面图生成失败 | 跳过，使用默认占位图 |

## 输出格式

发布成功后返回 JSON：

```json
{
  "success": true,
  "message": "发布成功",
  "articleId": "xxx",
  "url": "https://..."
}
```

## 文件结构

```
wechat-publish/
├── SKILL.md              # 技能说明
├── main.js               # 主入口
├── converter.js          # Markdown 转 HTML
├── text-to-markdown.js   # 文本转 Markdown
├── image-uploader.js     # 图片上传
├── cover-generator.js    # 封面图生成
├── cover-prompt.md       # 封面提示词
├── config.js             # 配置文件
├── themes.js             # 主题样式
├── temp/                 # 临时文件
├── package.json          # 依赖
└── .gitignore
```

## 文本转 Markdown 功能

### 支持的转换

| 输入格式 | 转换为 Markdown |
|----------|-----------------|
| `1. 标题` | `## 标题` |
| `第一章 标题` | `## 标题` |
| `• 列表项` | `1. 列表项` |
| `"引用文本"` | `> 引用文本` |
| `**加粗**` | `**加粗**` |
| `*斜体*` | `*斜体*` |
| `` `代码` `` | `` `代码` `` |
| `http://url` | `[http://url](http://url)` |

### 使用示例

```
用户: 把这段文字转成markdown发到公众号
      今天给大家分享10个VS Code技巧
      1. 多光标编辑
      2. 快捷键
      3. 插件推荐

系统: ✓ 已将文本转换为 Markdown
      ✓ 标题: 10个VS Code技巧
      ✓ 继续发布流程...
```

## 注意事项

1. 标题最多64字符，摘要最多120字符
2. 所有样式必须内联，微信不支持外部 CSS
3. 链接自动转为脚注形式
4. 发布到草稿箱，需手动在公众号后台发布
5. 封面图比例固定为 2.35:1

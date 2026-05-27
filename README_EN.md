# WeChat Official Account Publishing Skill

Language: [中文](README.md) | English

`WechatOA-auto` is a Claude Code Skill and Node.js utility for publishing Markdown articles to WeChat Official Account drafts. It supports themed formatting, AI cover generation, local image upload, Markdown-to-WeChat HTML conversion, and plain-text-to-Markdown conversion.

## Features

- Read Markdown files and parse YAML frontmatter.
- Support 4 themes: `professional`, `elegant`, `vibrant`, and `dark`.
- Convert Markdown into inline-style HTML compatible with WeChat.
- Upload local images and replace Markdown image links.
- Generate a 2.35:1 AI cover image and upload it.
- Fetch Official Account accounts and publish to the draft box.
- Convert plain text into Markdown before publishing.

## Repository Layout

```text
.
├── SKILL.md              # Claude Code Skill definition
├── main.js               # Main publishing workflow
├── converter.js          # Markdown -> WeChat HTML
├── text-to-markdown.js   # Plain text -> Markdown
├── image-uploader.js     # Image upload
├── cover-generator.js    # AI cover generation
├── cover-prompt.md       # Cover prompt
├── config.js             # Service config
├── themes.js             # Theme styles
├── package.json
└── package-lock.json
```

## Installation

```bash
git clone https://github.com/heyyalam111/WechatOA-auto.git
cd WechatOA-auto
npm install
```

Node.js 18+ is recommended because the code uses built-in `fetch`.

## Configuration

The current code reads these values from `config.js`:

- WeChat publishing API
- ImgBB image-hosting API
- Yunwu AI cover-generation API
- Default theme, retry count, and timeout

Security recommendation: do not commit real API keys to a public repository. For production, change `config.js` to read from environment variables or an untracked local config file, and rotate any exposed keys.

## Markdown Example

```markdown
---
title: VS Code Productivity Tips
theme: professional
---

# 10 VS Code Tips That Save Time

Article body.

![Local image](images/demo.png)
```

Title length is limited to 64 characters. Summary length is limited to 120 characters.

## Claude Code Usage

After placing this repository where Claude Code can discover the Skill, use requests such as:

```text
把 article.md 发布到公众号
/publish-wechat article.md
发小绿书 article.md
把这段文字转成 markdown 发到公众号
```

## Node.js Usage

The repository exports the `WechatPublisher` class:

```javascript
const WechatPublisher = require('./main');

async function run() {
  const publisher = new WechatPublisher({ theme: 'professional' });
  const result = await publisher.publish('article.md');
  console.log(result);
}

run();
```

## Publishing Flow

1. Check the publish lock to avoid duplicate tasks.
2. Read the Markdown file.
3. Fetch WeChat Official Account accounts.
4. Extract the title.
5. Generate and upload the cover image.
6. Upload local images referenced by Markdown.
7. Convert Markdown into WeChat-compatible HTML.
8. Generate the summary.
9. Publish to the draft box.
10. Clean temporary files.

## Themes

| Theme | Parameter | Best For |
|---|---|---|
| Professional | `professional` | Technical, career, tutorial articles |
| Elegant | `elegant` | Essays, interviews, brand stories |
| Vibrant | `vibrant` | Marketing, campaigns, growth articles |
| Dark Geek | `dark` | Developers, AI, engineering practice |

## Output

Successful publishing returns:

```json
{
  "success": true,
  "message": "发布成功",
  "articleId": "xxx",
  "url": "https://..."
}
```

## Limitations

- When multiple accounts are available, the code defaults to the first one unless an account is specified.
- Cover or image upload failures degrade gracefully, but the final draft may be less complete.
- Final publication still needs to be done manually in the WeChat backend.

// 微信公众号发布技能 - 配置文件
// 请勿将此文件提交到公开仓库

module.exports = {
  // 微信公众号发布 API
  wechat: {
    baseUrl: 'https://wx.limyai.com/api/openapi',
    apiKey: 'xhs_4d7dbf11310a38e59547432b906b0edd'
  },

  // ImgBB 图床 API
  imgbb: {
    apiKey: '803074ed4851d0f2eadb6446621de7d5',
    endpoint: 'https://api.imgbb.com/1/upload'
  },

  // 云雾AI 封面图生成 API
  yunwu: {
    baseUrl: 'https://yunwu.ai',
    endpoint: '/v1beta/models/gemini-3-pro-image-preview:generateContent',
    apiKey: 'sk-tOo4RId1Dj6htvH6Gy7hLrlz28TrtOckF1rptIWezCVoHZUf'
  },

  // 默认配置
  defaults: {
    theme: 'professional', // 可选: professional, elegant, vibrant, dark
    retryTimes: 3,
    retryDelay: 2000, // ms
    timeout: 30000 // ms
  }
};

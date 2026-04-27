const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');

// 配置内存存储，直接处理 Buffer
const upload = multer({ storage: multer.memoryStorage() });

// 你的千问 API Key
const DASHSCOPE_API_KEY = 'sk-4112588f32f54ccd947338d7c3513e31';

router.post('/recognize', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ code: -1, msg: '请上传文件' });
    }
    const preview = req.file.buffer.toString('base64').substring(0, 50);
    console.log('Base64 预览:', preview);
    console.log('收到文件，大小:', req.file.size, 'Bytes');

    // 1. 强制构造 Base64 字符串（前端传过来的是 PNG 格式）
    // 即使 mimetype 识别不准，我们也强制指定为 image/png
    const base64Image = `data:image/png;base64,${req.file.buffer.toString('base64')}`;

    console.log('正在调用千问 VL API...');

    // 2. 调用千问 VL 模型
    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation',
      {
        model: "qwen-vl-plus",
        input: {
          messages: [
            {
              role: "user",
              content: [
                { image: base64Image },
                { text: "你是一个OCR文字识别助手。请识别图片中的所有文字内容，并直接输出识别结果。\n\n要求：\n1. 只输出识别到的文字内容，不要添加任何提示性语言（如'图片中的文字内容如下'、'以上是识别结果'、'识别完成'等）\n2. 不要添加任何解释说明或总结\n3. 保持原有的段落格式和换行\n4. 如果图片中有表格，尽量保持表格结构\n5. 直接开始输出文字内容，不要有任何开场白" }
              ]
            }
          ]
        },
        parameters: { 
          result_format: "message"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 3. 提取并返回结果
    const content = response.data.output.choices[0].message.content;
    // 千问返回的 content 可能是数组，需要拼接
    const text = Array.isArray(content) ? content.map(i => i.text).join('') : content;
    
    console.log('识别成功，返回文本长度:', text.length);
    res.json({ code: 0, text });

  } catch (err) {
    console.error('OCR 失败详情:', err.response?.data || err.message);
    res.status(500).json({ 
      code: -1, 
      msg: '识别失败', 
      detail: err.response?.data?.message || err.message 
    });
  }
});

module.exports = router;
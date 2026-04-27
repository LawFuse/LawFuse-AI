const express = require('express');
const axios = require('axios');
const router = express.Router();
const fs = require('fs');
const path = require('path');

// 知识库索引文件路径
const INDEX_FILE = path.join(__dirname, '../data/knowledge-index.json');
const KNOWLEDGE_DIR = path.join(__dirname, '../../konwledge');

// 加载知识库索引
let knowledgeBase = null;

function loadKnowledgeBase() {
  if (!knowledgeBase) {
    if (!fs.existsSync(INDEX_FILE)) {
      console.warn('知识库索引不存在');
      return null;
    }
    knowledgeBase = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
    console.log(`✓ 知识库已加载，共 ${knowledgeBase.total_cases} 个案例`);
  }
  return knowledgeBase;
}

// 读取案例完整内容
function getCaseContent(caseItem) {
  const fullPath = path.join(KNOWLEDGE_DIR, caseItem.filePath);
  try {
    let content = fs.readFileSync(fullPath, 'utf-8');
    content = content
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return content;
  } catch (error) {
    console.error(`读取文件失败 ${caseItem.caseNumber}:`, error.message);
    return null;
  }
}

// 搜索相似案例
function searchCases(query, topK = 3) {
  const kb = loadKnowledgeBase();
  if (!kb) return [];
  
  const queryLower = query.toLowerCase();
  const scored = kb.cases.map(caseItem => {
    const keyInfoLower = caseItem.keyInfo.toLowerCase();
    let score = 0;
    const queryWords = queryLower.split(/[\s,，。、]+/).filter(w => w.length > 1);
    
    queryWords.forEach(word => {
      if (keyInfoLower.includes(word)) {
        score += 1;
      }
    });

    return { ...caseItem, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// 你的千问 API Key
const DASHSCOPE_API_KEY = 'sk-4112588f32f54ccd947338d7c3513e31';



const MY_REFERENCE_TEXT = `
你是法律助手，提供法律咨询。
`;


router.get('/asktest', (req, res) => {
  res.send('ask接口运行中');
});

// router.post('/ask', async (req, res) => {
//   console.log("AI 接口调用成功");
//   res.send({answer: 'AI 接口调用成功'});

// });

router.post('/ask', async (req, res) => {
  try {
    const { message } = req.body;

    // 从知识库检索相关案例
    const similarCases = searchCases(message, 3);
    let referenceText = MY_REFERENCE_TEXT;
    let referenceFiles = [];

    if (similarCases.length > 0) {
      referenceText += '\n\n以下是相关的法律案例供参考：\n\n';
      
      similarCases.forEach((caseItem, index) => {
        const content = getCaseContent(caseItem);
        if (content) {
          referenceText += `【参考案例${index + 1}】\n`;
          referenceText += `案号：${caseItem.caseNumber}\n`;
          referenceText += `分类：${caseItem.category}\n`;
          referenceText += `内容摘要：${content.substring(0, 500)}...\n\n`;
          
          referenceFiles.push({
            caseNumber: caseItem.caseNumber,
            category: caseItem.category,
            preview: content.substring(0, 200) + '...'
          });
        }
      });
    }

    const response = await axios.post(
      'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation',
      {
        model: "qwen-turbo",
        input: {
          messages: [
            {
              role: "user",
              content: `${referenceText}\n\n请根据以上资料（如果有）和你的专业知识回答用户问题：${message}`
            }
          ]
        },
        parameters: {
          result_format: "text"
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${DASHSCOPE_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    // 返回 AI 回答和参考文件
    const answer = response.data.output.text;
    res.json({ 
      code: 0, 
      answer: answer,
      referenceFiles: referenceFiles
    });

  } catch (err) {
    console.error('调用千问失败：', err.response?.data || err.message);
    res.status(500).json({ code: -1, msg: 'AI 接口调用失败' });
  }
});

// 启动服务
module.exports = router;
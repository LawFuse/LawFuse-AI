const express = require('express');
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
      throw new Error('知识库索引不存在，请先运行: node kon.js');
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

// 搜索相似案例（基于关键词匹配）
function searchCases(query, topK = 5) {
  const kb = loadKnowledgeBase();
  const queryLower = query.toLowerCase();

  // 计算每个案例的相关性分数
  const scored = kb.cases.map(caseItem => {
    const keyInfoLower = caseItem.keyInfo.toLowerCase();
    
    // 简单的关键词匹配得分
    let score = 0;
    const queryWords = queryLower.split(/[\s,，。、]+/).filter(w => w.length > 1);
    
    queryWords.forEach(word => {
      if (keyInfoLower.includes(word)) {
        score += 1;
      }
    });

    return {
      ...caseItem,
      score: score
    };
  });

  // 按分数排序，取前 topK 个
  const results = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  return results;
}

// 类案推荐接口
router.post('/recommend', async (req, res) => {
  try {
    const { caseDescription } = req.body;
    
    if (!caseDescription) {
      return res.status(400).json({
        code: -1,
        message: '请提供案件描述'
      });
    }

    console.log(`🔍 开始检索相似案例...`);
    
    // 搜索相似案例
    const similarCases = searchCases(caseDescription, 5);
    
    if (similarCases.length === 0) {
      return res.json({
        code: 0,
        cases: [],
        message: '未找到相似案例'
      });
    }

    console.log(`✓ 找到 ${similarCases.length} 个相似案例`);

    // 获取每个案例的完整内容
    const casesWithContent = similarCases.map(caseItem => {
      const fullContent = getCaseContent(caseItem);
      return {
        caseNumber: caseItem.caseNumber,
        category: caseItem.category,
        similarity: caseItem.score,
        preview: caseItem.keyInfo,
        fullContent: fullContent
      };
    });

    res.json({
      code: 0,
      cases: casesWithContent
    });

  } catch (error) {
    console.error('类案推荐失败:', error);
    res.status(500).json({
      code: -1,
      message: '服务异常: ' + error.message
    });
  }
});

// 重新构建知识库索引
router.post('/rebuild', async (req, res) => {
  try {
    console.log('🔄 开始重建知识库索引...');
    // 清除缓存，下次请求时会重新加载
    knowledgeBase = null;
    loadKnowledgeBase();
    console.log('✅ 知识库索引重建完成');
    
    res.json({
      code: 0,
      message: '知识库索引重建成功'
    });
  } catch (error) {
    console.error('重建索引失败:', error);
    res.status(500).json({
      code: -1,
      message: '重建失败: ' + error.message
    });
  }
});

module.exports = router;

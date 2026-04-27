// backfont/scripts/build-knowledge.js
const fs = require('fs');
const path = require('path');

class KnowledgeBaseBuilder {
  constructor() {
    this.knowledgeDir = path.join(__dirname, '../../konwledge');
    this.outputDir = path.join(__dirname, '../data');
    this.indexFile = path.join(this.outputDir, 'knowledge-index.json');
    
    // 确保输出目录存在
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  // 获取所有文件
  getAllFiles(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    
    list.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        results = results.concat(this.getAllFiles(filePath));
      } else if (file.endsWith('.txt') || file.endsWith('.md')) {
        results.push(filePath);
      }
    });
    
    return results;
  }

  // 根据文件路径判断分类
  getCategory(filePath) {
    if (filePath.includes('人格权') || filePath.includes('侵权')) {
      return '人格权纠纷+侵权';
    }
    if (filePath.includes('劳务') || filePath.includes('合同')) {
      return '劳务合同';
    }
    if (filePath.includes('婚姻') || filePath.includes('物权')) {
      return '婚姻与物权';
    }
    if (filePath.includes('缔约过失') || filePath.includes('海事') || filePath.includes('公司')) {
      return '缔约过失/海事海商/公司';
    }
    return '其他';
  }

  // 读取并清理文件内容
  readAndCleanFile(filePath) {
    try {
      let content = fs.readFileSync(filePath, 'utf-8');
      
      // 清理特殊字符和多余空白
      content = content
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();
      
      return content;
    } catch (error) {
      console.error(`读取文件失败 ${filePath}:`, error.message);
      return null;
    }
  }

  // 提取关键信息用于检索（前500字）
  extractKeyInfo(content) {
    // 取前500个字符作为检索关键词
    return content.substring(0, 500);
  }

  // 构建知识库索引
  async buildIndex() {
    console.log('\n🚀 开始构建知识库索引...\n');
    console.log(`📂 知识库目录: ${this.knowledgeDir}\n`);

    const files = this.getAllFiles(this.knowledgeDir);
    console.log(`📄 找到 ${files.length} 个文件\n`);

    const knowledgeBase = {
      version: '1.0',
      created_at: new Date().toISOString(),
      total_cases: 0,
      categories: {},
      cases: []
    };

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const content = this.readAndCleanFile(file);
      
      if (!content || content.length < 50) {
        console.log(`⏭️  [${i + 1}/${files.length}] 跳过: ${path.basename(file)} (内容过短或读取失败)`);
        failCount++;
        continue;
      }

      const caseNumber = path.basename(file, path.extname(file));
      const category = this.getCategory(file);
      const keyInfo = this.extractKeyInfo(content);

      // 统计分类
      if (!knowledgeBase.categories[category]) {
        knowledgeBase.categories[category] = 0;
      }
      knowledgeBase.categories[category]++;

      // 添加案例信息
      knowledgeBase.cases.push({
        id: caseNumber,
        caseNumber: caseNumber,
        category: category,
        filePath: path.relative(this.knowledgeDir, file),
        contentLength: content.length,
        keyInfo: keyInfo,
        indexed_at: new Date().toISOString()
      });

      successCount++;
      
      // 每处理50个文件显示一次进度
      if ((i + 1) % 50 === 0) {
        console.log(`✓ 已处理 ${i + 1}/${files.length} 个文件...`);
      }
    }

    knowledgeBase.total_cases = successCount;

    // 保存索引文件
    fs.writeFileSync(this.indexFile, JSON.stringify(knowledgeBase, null, 2), 'utf-8');
    
    console.log('\n✅ 知识库索引构建完成！\n');
    console.log(`📊 统计信息:`);
    console.log(`   - 总案例数: ${successCount}`);
    console.log(`   - 失败数: ${failCount}`);
    console.log(`   - 分类统计:`);
    
    Object.entries(knowledgeBase.categories).forEach(([cat, count]) => {
      console.log(`     • ${cat}: ${count} 个案例`);
    });
    
    console.log(`\n💾 索引文件已保存到: ${this.indexFile}\n`);

    return knowledgeBase;
  }

  // 简单的文本相似度搜索（基于关键词匹配）
  searchCases(query, topK = 5) {
    if (!fs.existsSync(this.indexFile)) {
      throw new Error('知识库索引不存在，请先运行 buildIndex()');
    }

    const knowledgeBase = JSON.parse(fs.readFileSync(this.indexFile, 'utf-8'));
    const queryLower = query.toLowerCase();

    // 计算每个案例的相关性分数
    const scored = knowledgeBase.cases.map(caseItem => {
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

  // 获取案例完整内容
  getCaseContent(caseNumber) {
    if (!fs.existsSync(this.indexFile)) {
      throw new Error('知识库索引不存在');
    }

    const knowledgeBase = JSON.parse(fs.readFileSync(this.indexFile, 'utf-8'));
    const caseItem = knowledgeBase.cases.find(c => c.caseNumber === caseNumber);
    
    if (!caseItem) {
      return null;
    }

    const fullPath = path.join(this.knowledgeDir, caseItem.filePath);
    const content = this.readAndCleanFile(fullPath);
    
    return {
      ...caseItem,
      fullContent: content
    };
  }
}

// 执行构建
async function main() {
  const builder = new KnowledgeBaseBuilder();
  
  try {
    // 构建索引
    await builder.buildIndex();
    
    // 测试搜索功能
    console.log('\n🔍 测试搜索功能...\n');
    const testQuery = '劳动合同 工资 拖欠';
    const results = builder.searchCases(testQuery, 5);
    
    console.log(`搜索关键词: "${testQuery}"`);
    console.log(`找到 ${results.length} 个相关案例:\n`);
    
    results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.caseNumber}`);
      console.log(`   分类: ${result.category}`);
      console.log(`   相关性得分: ${result.score}`);
      console.log(`   关键信息预览: ${result.keyInfo.substring(0, 100)}...\n`);
    });
    
  } catch (error) {
    console.error('❌ 构建失败:', error);
    process.exit(1);
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

module.exports = KnowledgeBaseBuilder;
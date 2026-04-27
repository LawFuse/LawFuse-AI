<script setup>
import { ref } from 'vue'
import { marked } from 'marked'
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const message = ref('')
const inf = ref('')
const clue = ref('')
const risk = ref('')
const isLoading = ref(false)
const leianResult = ref('')

marked.setOptions({
  breaks: true,
  gfm: true
})
function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
async function getanswer(msg) {
  const response = await fetch(`${API_BASE_URL}/api/ask/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: msg }),
  })
  const data = await response.json()
  return data.answer
}

async function jiexi() {
  if (!message.value.trim()) {
    alert('请输入文书内容');
    return;
  }
  
  isLoading.value = true
  try {
    // 并行请求以提高效率
    const [infResult, clueResult, riskResult] = await Promise.all([
      getanswer(message.value + "请分析案件违法情形"),
      getanswer(message.value + "请分析案件违法线索"),
      getanswer(message.value + "请分析案件风险点")
    ])
    
    inf.value = infResult
    clue.value = clueResult
    risk.value = riskResult
  } catch (error) {
    alert('解析失败，请检查网络或稍后重试');
    console.error('解析失败:', error)
  } finally {
    isLoading.value = false
  }
}
async function leian() {
  if (!message.value.trim()) {
    alert('请输入文书内容');
    return;
  }
  
  isLoading.value = true
  try {
    // 1. 先从知识库检索相似案例
    const response = await fetch(`${API_BASE_URL}/api/cases/recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        caseDescription: message.value 
      })
    })
    
    const data = await response.json()
    
    if (data.code === 0 && data.cases.length > 0) {
      console.log(`找到 ${data.cases.length} 个相似案例`)
      
      // 2. 组装案例信息发送给 AI
      const casesInfo = data.cases.map((c, index) => {
        // 从完整内容中提取基本信息
        const contentPreview = c.fullContent ? c.fullContent.substring(0, 800) : c.preview
        
        return `【类案${index + 1}】
【重要】案号（文件名，请直接使用）：${c.caseNumber}
分类：${c.category}
相关度评分：${c.similarity}

案件内容：
${contentPreview}`
      }).join('\n\n---\n\n')
      
      const aiPrompt = `你是一个专业的法律助手。请基于用户提供的案件描述和从知识库检索到的相似案例，生成类案推荐报告。

用户案件描述：
${message.value}

---

从知识库检索到的相似案例：

${casesInfo}

---

请严格按照以下格式输出类案推荐报告：

争议焦点:
（分析用户案件的核心争议点，输出长一点，详细说明案件的争议焦点）

法律适用:
（列出适用的法律法规）

类案推荐

类案1：民事还是刑事/罪名/判案法院/判案时间/案件号/一审还是二审
案号：（必须使用【重要】案号字段中提供的案号，不要从内容中提取或修改）
案件名称：（根据案号和案件内容推断案件名称）
推荐理由：（说明与用户案件的相似点和参考价值）

类案2：民事还是刑事/罪名/判案法院/判案时间/案件号/一审还是二审
案号：（必须使用【重要】案号字段中提供的案号，不要从内容中提取或修改）
案件名称：（根据案号和案件内容推断案件名称）
推荐理由：（说明与用户案件的相似点和参考价值）

类案3：民事还是刑事/罪名/判案法院/判案时间/案件号/一审还是二审
案号：（必须使用【重要】案号字段中提供的案号，不要从内容中提取或修改）
案件名称：（根据案号和案件内容推断案件名称）
推荐理由：（说明与用户案件的相似点和参考价值）

类案4：民事还是刑事/罪名/判案法院/判案时间/案件号/一审还是二审
案号：（必须使用【重要】案号字段中提供的案号，不要从内容中提取或修改）
案件名称：（根据案号和案件内容推断案件名称）
推荐理由：（说明与用户案件的相似点和参考价值）

类案5：民事还是刑事/罪名/判案法院/判案时间/案件号/一审还是二审
案号：（必须使用【重要】案号字段中提供的案号，不要从内容中提取或修改）
案件名称：（根据案号和案件内容推断案件名称）
推荐理由：（说明与用户案件的相似点和参考价值）

注意：
1. 【极其重要】案号必须直接使用每个案例中【重要】案号字段提供的值（这是文件名去除.txt后缀得到的），绝对不要从案件内容中提取或自行推断案号
2. 如果发现某个案例的案号格式明显不正确（如不符合"(年份)法院代码案件类型编号"的格式），请将该案例从推荐列表中剔除
3. 案件名称可以根据案号和案件内容合理推断
4. 推荐理由要具体说明与用户案件的关联，稍微多输出一点文字
5. 不要输出多余的解释性文字，直接按照格式输出结果
6.不要输出重复的案件号，给你发送的资料不一定要全部使用。请一定保证案号不重复，不重复推荐的请自动删去，不要显示出来了
7.法律适用的要精确到具体法条
8.输出的md格式把标题加粗比如以下文字：“争议焦点”
“法律适用”
“类案推荐”
类案1:
“案件名称”
“推荐理由”
这些字段需要加粗`
      
      const aiResponse = await getanswer(aiPrompt)
      leianResult.value = aiResponse
    } else {
      leianResult.value = '抱歉，未在知识库中找到相似案例。建议您：\n1. 检查案件描述是否清晰\n2. 尝试补充更多案件细节\n3. 联系管理员扩充知识库'
    }
    
  } catch (error) {
    console.error('类案推荐失败:', error)
    leianResult.value = '类案推荐服务暂时不可用，请稍后重试。'
  } finally {
    isLoading.value = false
  }
}



</script>

<template>
  <div class="wenshujiexi-container">
    <h2 class="title"> 智能文书解析</h2>
    
    <!-- 输入区域 -->
    <div class="input-section">
      <div class="form-group">
        <label for="document" class="form-label">文书内容</label>
        <textarea 
          id="document"
          v-model="message" 
          placeholder="请输入需要解析的法律文书内容..."
          class="form-textarea"
          rows="6"
          :disabled="isLoading"
        ></textarea>
      </div>
       <button 
        @click="leian" 
        class="analyze-btn"
        :disabled="!message.trim() || isLoading"
      >
        <span v-if="isLoading" > 解析中...</span>
        <span v-else> 类案推荐</span>
      </button>
      <button 
        @click="jiexi" 
        class="analyze-btn"
        :disabled="!message.trim() || isLoading"
      >
        <span v-if="isLoading"> 解析中...</span>
        <span v-else> 开始解析</span>
      </button>
    </div>

    <!-- 解析结果 -->
    <div v-if="leianResult" class="result-section" >
      <h3 class="result-title">类案推荐</h3>
      <div class="result-cards">
        <div class="result-card">
          <div class="card-header">
            <h4 class="card-title">类案推荐报告</h4>
          </div>
          <div class="card-content">
            <div class="markdown-content" v-html="renderMarkdown(leianResult)"></div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="inf || clue || risk" class="result-section">
      <h3 class="result-title"> 解析结果</h3>
      
      <div class="result-cards">
       
        <div class="result-card">
          <div class="card-header">
            <h4 class="card-title">违法情形</h4>
          </div>
          <div class="card-content">
            <div class="markdown-content" v-html="renderMarkdown(inf)"></div>
          </div>
        </div>
      
      
        <div class="result-card">
          <div class="card-header">
            <h4 class="card-title"> 违法线索</h4>
          </div>
          <div class="card-content">
            <div class="markdown-content" v-html="renderMarkdown(clue)"></div>
          </div>
        </div>
        
       
        <div class="result-card">
          <div class="card-header">
            <h4 class="card-title"> 风险点</h4>
          </div>
          <div class="card-content">
            <div class="markdown-content" v-html="renderMarkdown(risk)"></div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<style scoped>
/* 全局样式 */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #1e40af;
  --accent-color: #60a5fa;
  --success-color: #10b981;
  --warning-color: #f59e0b;
  --error-color: #ef4444;
  --info-color: #3b82f6;
  --background-color: #0f172a;
  --background-secondary: #1e293b;
  --background-tertiary: #334155;
  --text-primary: #f8fafc;
  --text-secondary: #cbd5e1;
  --text-light: #94a3b8;
  --white: #ffffff;
  --border-color: #334155;
  --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2);
  --shadow-hover: 0 10px 15px -3px rgba(59, 130, 246, 0.4), 0 4px 6px -2px rgba(59, 130, 246, 0.2);
  --border-radius: 12px;
  --transition: all 0.3s ease;
}

/* 容器 */
.wenshujiexi-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

/* 标题 */
.title {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

/* 输入区域 */
.input-section {
  background: var(--background-secondary);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  margin-bottom: 30px;
  border: 1px solid var(--border-color);
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  margin-bottom: 10px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 16px;
}

.form-textarea {
  width: 100%;
  padding: 18px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  font-family: inherit;
  line-height: 1.5;
  resize: vertical;
  transition: var(--transition);
  min-height: 200px;
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.form-textarea:disabled {
  background: #f5f5f5;
  cursor: not-allowed;
}


.analyze-btn {
  width: auto;
  padding: 20px 24px;
  background: #437CBB;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
 
  transition: var(--transition);
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
  position: relative;
  overflow: hidden;
  min-width: 150px;
}


.analyze-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.analyze-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.analyze-btn:hover::before {
  left: 100%;
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 结果区域 */
.result-section {
  background: var(--white);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  animation: slideUp 0.5s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.result-title {
  color: var(--text-primary);
  margin-bottom: 25px;
  font-size: 24px;
  font-weight: 600;
  text-align: center;
}

.result-cards {
  display: grid;
  grid-template-columns: column;
  gap: 20px;
}

.result-card {
  background: var(--background-secondary);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--border-color);
  animation: fadeInUp 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.result-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(30, 136, 229, 0.1), transparent);
  transition: left 0.6s ease;
}

.result-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 16px rgba(30, 136, 229, 0.15);
  border-color: var(--primary-color);
}

.result-card:hover::before {
  left: 100%;
}

.result-card:nth-child(1) { animation-delay: 0.1s; }
.result-card:nth-child(2) { animation-delay: 0.2s; }
.result-card:nth-child(3) { animation-delay: 0.3s; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.card-header {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  padding: 15px 20px;
}

.card-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-content p {
  margin: 0;
  color: var(--text-primary);
  line-height: 1.6;
  font-size: 15px;
}

/* Markdown 样式 */
.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 12px 0 8px 0;
  color: var(--text-primary);
}

.markdown-content :deep(p) {
  margin: 8px 0;
  line-height: 1.8;
  color: var(--text-primary);
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
  color: var(--text-primary);
}

.markdown-content :deep(li) {
  margin: 4px 0;
}

.markdown-content :deep(code) {
  background: var(--background-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
  color: var(--text-primary);
}

.markdown-content :deep(pre) {
  background: var(--background-tertiary);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
  border: 1px solid var(--border-color);
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 16px;
  margin: 8px 0;
  color: var(--text-secondary);
}

.markdown-content {
  text-align: left;
  width: 100%;
  margin-left: 20px;
}

/* 响应式设计 */

/* 响应式设计 */
@media (max-width: 768px) {
  .wenshujiexi-container {
    padding: 10px;
  }
  
  .input-section,
  .result-section {
    padding: 20px;
  }
  
  .result-cards {
    grid-template-columns: 1fr;
  }
  
  .form-textarea {
    min-height: 150px;
  }
}
</style>
<script setup>
import { ref, onMounted } from 'vue'

const isLoading = ref(true)
const projectInfo = ref({
  title: 'Lawfuse类案推荐助手',
  subtitle: '',
  description: '智推类案，精准释法，赋能司法高效裁判',
  advantages: [
    {
      title: '裁判文书智能解析',
      description: '依托Qwen2.5-7B大模型+LoRA轻量化微调，实现裁判文书全字段结构化解析，实现多层级、多维度的案件争议焦点精细化拆解，辅助法律从业者快速梳理案件脉络。'
    },
   
    {
      title: '类案精准推荐',
      description: '基于RAG检索增强生成技术，深度对接权威司法案例库，按案件要素、争议焦点、法律适用进行高相关性匹配，一键推送同类生效裁。'
    },
     {
      title: '争议焦点智能提炼',
      description: '对案件材料进行多层级、多维度拆解，快速定位核心法律争议，清晰梳理案件脉络，降低人工梳理成本。'
    },
     {
      title: '线索筛查与风险评估',
      description: '智能识别审判程序中常见违法与违规情形，自动筛查线索、标注风险等级，完美适配检察监督等业务场景'
    },
     {
      title: 'OCR智能解析集成',
      description: '深度对接Mineru OCR，支持纸质卷宗、扫描件等非结构化材料一键解析，自动生成结构化案件报告。'
    },
    

  ]
})

const highlights = ref([
  {
    title: 'LoRA轻量化微调技术',
    description: '',
    features: ['基于通义千问2.5-7B轻量化基座，部署成本低、推理速度快', '多层级递进分析，精准还原文书逻辑与争议焦点', '经实测验证准确率90%+，专业可靠']
  },
  {
    title: 'RAG增强生成系统',
    description: '',
    features: ['深度融合法律法规+权威司法案例，输出合规有据', '采用0.8相关性评分机制，实现类案精准筛选', '全领域覆盖，满足多场景检索与推荐需求']
  }
  
])



const columns1 = ref([
  { label: '基础模型占比', prop: '1' },
  { label: '技术适配层', prop: '2' },
  { label: '能力增强层', prop: '3' },
  { label: '最终交付精度', prop: '4' }
])

const tableData1 = ref([
  { 1: '90%', 2: 'LoRA', 3: 'RAG', 4: '90%+'},
  { 1: '通用法律基座', 2: '轻量化微调', 3: '知识库增强', 4: '专业业务精度' }
])



const columns2 = ref([
  { label: '模型分析流程', prop: '1' },
  { label: '核心模块能力', prop: '2' }
  
])

const tableData2 = ref([
  { 1: '文书解析', 2: '裁判文书结构化解析+争议焦点提取+审查逻辑构建'},
  { 1: '线索筛查与评估', 2: '程序违法情形智能识别、风险评估与标注' },
  { 1: '类案检索', 2: '案件要素精准匹配+高相关类案推送，提供权威参考'},
  { 1: '合规安全', 2: '本地化部署+OCR集成，安全高效、落地即用' }
])


onMounted(() => {
  // 模拟加载过程
  setTimeout(() => {
    isLoading.value = false
  }, 1000)
})
</script>

<template>
  <!-- 加载状态 -->
  <div v-if="isLoading" class="loading-container">
    <div class="loading-spinner"></div>
    <p class="loading-text">加载中，请稍候...</p>
  </div>
  
  <!-- 主内容 -->
  <div v-else class="zhanshi-container">
    <!-- 项目介绍 -->
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">{{ projectInfo.title }} <span class="hero-subtitle">{{ projectInfo.subtitle }}</span></h1>
        <p class="hero-description">{{ projectInfo.description }}</p>
        <div class="cta-button">
          
        </div>
      </div>
    </div>

    <!-- 项目优势 -->
    <section class="advantages-section">
      <h2 class="section-title">核心能力</h2>
      <div class="advantages-grid">
        <div v-for="(item, index) in projectInfo.advantages" :key="index" class="advantage-card">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.description }}</p>
        </div>
      </div>
    </section>

    <!-- 核心功能 -->
    <section class="highlights-section">
      <h2 class="section-title">技术优势</h2>
      <div class="cards-grid">
        <div v-for="(item, index) in highlights" :key="index" class="highlight-card">
          <h3 class="card-title">{{ item.title }}</h3>
          <p class="card-desc">{{ item.description }}</p>
          <ul class="feature-list">
            <li v-for="(feature, fIndex) in item.features" :key="fIndex">
              <span class="feature-check"></span> {{ feature }}
            </li>
          </ul>
        </div>
      </div>
    </section>

    <!--数据安全保护体系 -->
    <section class="tech-section">
      <h2 class="section-title">数据安全保障体系</h2>
      <div >
        <div >
          
          <p >采用本地化部署方案，严格遵循“数据不出本地”安全规范，所有案件信息在本地处理与分析，全面满足司法机关数据安全与保密要求。</p>
        </div>
      </div>
    </section>

    

  <section class="tech-section">
      <h2 class="section-title">基于千问2.5（7B）基座的模型全链路优化</h2>
      
  </section>
  <table class="table1">
    <thead>
      <tr>
        <th v-for="(col, index) in columns1" :key="index">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in tableData1" :key="rowIndex">
        <td v-for="(col, colIndex) in columns1" :key="colIndex">
          {{ row[col.prop] }}
        </td>
      </tr>
    </tbody>
  </table>

<section class="tech-section">
      <h2 class="section-title">LawFuse核心模块能力一览</h2>
      
  </section>
    <table class="table1">
    <thead>
      <tr>
        <th v-for="(col, index) in columns2" :key="index">
          {{ col.label }}
        </th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(row, rowIndex) in tableData2" :key="rowIndex">
        <td v-for="(col, colIndex) in columns2" :key="colIndex">
          {{ row[col.prop] }}
        </td>
      </tr>
    </tbody>
  </table>




    
  </div>
</template>

<style scoped>
/* 全局样式 */
:root {
  --primary-color: #1a237e;
  --secondary-color: #64b5f6;
  --accent-color: #90caf9;
  --success-color: #4caf50;
  --warning-color: #ff9800;
  --error-color: #f44336;
  --info-color: #2196f3;
  --background-color: #ffffff;
  --background-secondary: #f5f5f5;
  --background-tertiary: #e0e0e0;
  --text-primary: #333333;
  --text-secondary: #666666;
  --text-light: #999999;
  --white: #ffffff;
  --border-color: #e0e0e0;
  --shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  --shadow-hover: 0 4px 8px rgba(26, 35, 126, 0.2);
  --border-radius: 8px;
  --transition: all 0.3s ease;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: var(--background-color);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 3px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: var(--text-secondary);
  font-size: 16px;
}

/* 容器 */
.zhanshi-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
  background: var(--background-color);
}



/* 英雄区域 */
.hero-section {
  background: var(--primary-color);
  color: var(--white);
  padding: 80px 20px;
  text-align: center;
  position: relative;
  overflow: hidden;
}

.hero-content {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
}

.hero-title {
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 16px;
  color: #447BBD;
}

.hero-subtitle {
  font-size: 20px;
  font-weight: 400;
  opacity: 0.9;
  margin-left: 10px;
}

.hero-description {
  font-size: 18px;
  line-height: 1.6;
  margin-bottom: 32px;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  opacity: 0.9;
}

.cta-button {
  margin-top: 20px;
}

.primary-btn {
  background: var(--white);
  color: var(--primary-color);
  padding: 18px 36px;
  border: none;
  border-radius: 30px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  box-shadow: 0 4px 12px rgba(255, 255, 255, 0.3);
  position: relative;
  overflow: hidden;
}

.primary-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(26, 35, 126, 0.1), transparent);
  transition: left 0.6s ease;
}

.primary-btn:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 20px rgba(255, 255, 255, 0.4);
}

.primary-btn:hover::before {
  left: 100%;
}

/* 项目优势 */
.advantages-section {
  padding: 80px 20px;
  background: var(--background-secondary);
}

.advantages-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);  /* 使用6列网格 */
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
}


.advantage-card:nth-child(1),
.advantage-card:nth-child(2),
.advantage-card:nth-child(3) {
  grid-column: span 2;
}

/* 第4、5个卡片：每个占2列，但通过margin实现居中 */
.advantage-card:nth-child(4) {
  grid-column: 2 / span 2;  /* 从第2列开始，占2列 */
}

.advantage-card:nth-child(5) {
  grid-column: 4 / span 2;  /* 从第4列开始，占2列 */
}

.advantage-card {
  background: var(--white);
  padding: 40px 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--border-color);
  text-align: center;
  animation: fadeInUp 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.advantage-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(26, 35, 126, 0.1), transparent);
  transition: left 0.6s ease;
}

.advantage-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-color);
}

.advantage-card:hover::before {
  left: 100%;
}

.advantage-card:nth-child(1) { animation-delay: 0.1s; }
.advantage-card:nth-child(2) { animation-delay: 0.2s; }
.advantage-card:nth-child(3) { animation-delay: 0.3s; }

/* 核心功能 */
.highlights-section {
  padding: 80px 20px;
  background: var(--background-color);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 25px;
  max-width: 1200px;
  margin: 0 auto;
}

.highlight-card {
  background: var(--white);
  padding: 40px 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--border-color);
  animation: fadeInUp 0.6s ease-out;
  position: relative;
  overflow: hidden;
}

.highlight-card::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transition: width 0.3s ease;
}

.highlight-card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-color);
}

.highlight-card:hover::after {
  width: 100%;
}

.highlight-card:nth-child(1) { animation-delay: 0.1s; }
.highlight-card:nth-child(2) { animation-delay: 0.2s; }
.highlight-card:nth-child(3) { animation-delay: 0.3s; }
.highlight-card:nth-child(4) { animation-delay: 0.4s; }
.highlight-card:nth-child(5) { animation-delay: 0.5s; }
.highlight-card:nth-child(6) { animation-delay: 0.6s; }

/* 技术栈 */
.tech-section {
  padding: 80px 20px;
  background: var(--background-secondary);
}

.tech-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  max-width: 1000px;
  margin: 0 auto;
}

.tech-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.tech-badge {
  color: var(--white);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: bold;
  font-size: 16px;
  box-shadow: var(--shadow);
  transition: transform 0.3s;
}

.tech-badge:hover {
  transform: scale(1.05);
}

.tech-desc {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 使用指南 */
.guide-section {
  padding: 80px 20px;
  background: var(--background-color);
}

.guide-steps {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.step {
  display: flex;
  align-items: flex-start;
  gap: 30px;
  background: var(--white);
  padding: 30px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  transition: var(--transition);
  border: 1px solid var(--border-color);
}

.step:hover {
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
  border-color: var(--primary-color);
}

.step-number {
  width: 50px;
  height: 50px;
  background: var(--primary-color);
  color: var(--white);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  font-weight: bold;
  flex-shrink: 0;
}

.step-content h4 {
  font-size: 20px;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.step-content p {
  color: var(--text-secondary);
  line-height: 1.6;
  margin: 0;
}

/* 通用样式 */
.section-title {
  font-size: 28px;
  color: var(--text-primary);
  margin-bottom: 30px;
  text-align: center;
  font-weight: 600;
}

.card-title {
  font-size: 22px;
  color: #447BBD;
  margin-bottom: 15px;
  font-weight: 600;
}

.card-desc {
  color: var(--text-secondary);
  line-height: 1.6;
  margin-bottom: 20px;
  font-size: 18px;
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: center;
}

.feature-list li {
  color: var(--text-secondary);
  padding: 8px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center; 

  gap: 8px;
  text-align: center;
}

.feature-check {
  color: var(--success-color);
  font-weight: bold;
}

/* 动画 */
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

/* 响应式设计 */
@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
  }
  
  .hero-subtitle {
    font-size: 16px;
  }
  
  .advantages-grid,
  .cards-grid {
    grid-template-columns: 1fr;
  }
  
  .step {
    flex-direction: column;
    align-items: center;
    text-align: center;
  }
  
  .tech-grid {
    flex-direction: column;
    align-items: center;
  }
  
  .tech-item {
    width: 100%;
    max-width: 200px;
  }
}


.table1 {
  width: 100%;
  border-collapse: collapse;
  background: var(--white);
  border-radius: var(--border-radius);
  overflow: hidden;
  box-shadow: var(--shadow);
  margin: 30px 0;
  animation: fadeInUp 0.6s ease-out;
}

.table1 thead {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
}

.table1 th {
  padding: 16px 20px;         /* 修改：与 td 保持一致 */
   text-align: center;
  font-weight: 600;
  font-size: 16px;
  color: var(--white);
  border-bottom: 2px solid rgba(255, 255, 255, 0.2);
  vertical-align: middle;     /* 添加：垂直居中 */
}

.table1 td {
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 15px;
  line-height: 1.6;
  vertical-align: middle;     /* 添加：垂直居中 */
}

.table1 tbody tr {
  transition: var(--transition);
}

.table1 tbody tr:hover {
  background: linear-gradient(90deg, rgba(26, 35, 126, 0.05), rgba(100, 181, 246, 0.05));
  transform: scale(1.01);
}

.table1 tbody tr:last-child td {
  border-bottom: none;
}

.table1 tbody tr:nth-child(even) {
  background: var(--background-secondary);
}

.table1 tbody tr:nth-child(even):hover {
  background: linear-gradient(90deg, rgba(26, 35, 126, 0.08), rgba(100, 181, 246, 0.08));
}


</style>
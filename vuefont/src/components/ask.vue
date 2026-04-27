<script setup>
import { ref, nextTick } from 'vue'
import { marked } from 'marked'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const message = ref('')
const chathistory = ref([])
const isLoading = ref(false)

// 配置 marked
marked.setOptions({
  breaks: true,  // 支持 GitHub 风格的换行
  gfm: true      // 启用 GitHub Flavored Markdown
})

async function getanswer(msg) {
  const response = await fetch(`${API_BASE_URL}/api/ask/ask`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message: msg }),
  })
  const data = await response.json()
  return {
    answer: data.answer,
    referenceFiles: data.referenceFiles || []
  }
}

async function ask() {
  if (!message.value.trim()) return
  
  const userMessage = message.value
  message.value = '' // 清空输入框
  isLoading.value = true
  
  // 添加用户消息到历史记录
  chathistory.value.push({ 
    message: userMessage, 
    answer: '',
    loading: true 
  })
  
  try {
    const result = await getanswer(userMessage)
    // 更新最后一条消息的答案
    const lastMsg = chathistory.value[chathistory.value.length - 1]
    lastMsg.answer = result.answer
    lastMsg.referenceFiles = result.referenceFiles
    lastMsg.loading = false
  } catch (error) {
    console.error('获取回答失败:', error)
    const lastMsg = chathistory.value[chathistory.value.length - 1]
    lastMsg.answer = '抱歉，服务暂时不可用，请稍后重试。'
    lastMsg.referenceFiles = []
    lastMsg.loading = false
  } finally {
    isLoading.value = false
  }
  
  // 滚动到底部
  await nextTick()
  const chatContainer = document.querySelector('.chat-history')
  if (chatContainer) {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }
}

// 处理 Enter 键发送
function handleKeydown(event) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault()
    ask()
  }
}

// 渲染 Markdown
function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
</script>



















<template>
  
   
    
    <!-- 聊天历史区域 -->
    <div class="chat-history">
      
      
      <div v-for="(item, index) in chathistory" :key="index" class="chat-item">
        <!-- 用户消息 -->
        <div class="message-wrapper user-wrapper">
          <div class="message-bubble user-bubble">
            {{ item.message }}
            <div class="message-time">{{ new Date().toLocaleTimeString() }}</div>
          </div>
        </div>

        <!-- AI 回复 -->
        <div class="message-wrapper ai-wrapper">
          <div class="message-avatar"></div>
          <div class="message-bubble ai-bubble">
            <div v-if="item.loading" class="loading-dots">
              <span></span><span></span><span></span>
            </div>
            <div v-else>
              <div class="markdown-content" v-html="renderMarkdown(item.answer)"></div>
              
              <!-- 显示参考文件 -->
              <div v-if="item.referenceFiles && item.referenceFiles.length > 0" class="reference-section">
                <div class="reference-title">📚 参考案例</div>
                <div v-for="(ref, idx) in item.referenceFiles" :key="idx" class="reference-item">
                  <div class="reference-header">
                    <span class="reference-number">案例{{ idx + 1 }}</span>
                    <span class="reference-case-number">{{ ref.caseNumber }}</span>
                  </div>
                  <div class="reference-category">分类：{{ ref.category }}</div>
                  <div class="reference-preview">{{ ref.preview }}</div>
                </div>
              </div>
            </div>
            <div class="message-time">{{ new Date().toLocaleTimeString() }}</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 输入区域 -->
    <div class="input-area" >
      <textarea 
        v-model="message" 
        @keydown="handleKeydown"
        placeholder="请输入您的法律问题，我会基于参考资料为您提供专业解答（Shift+Enter 换行，Enter 发送）"
        rows="1"
        class="input-box"
        :disabled="isLoading"
      ></textarea>
      <button 
        @click="ask" 
        :disabled="!message.trim() || isLoading"
        class="send-btn"
      >
        <span v-if="isLoading">思考中</span>
        <span v-else>发送</span>
      </button>
    </div>
  
</template>

<style scoped>
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

.ask-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  height: calc(100vh - 100px);
  flex-direction: column;
  background: transparent;
  border: none;
  box-shadow: none;

}



.title {
  text-align: center;
  color: #447BBD;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

/* 聊天历史区域 */

  /* 聊天历史区域 */
.chat-history {
  display: flex;
  justify-content: center;
  overflow-y: auto;
  padding: 0;
  background: var(--background-secondary);
  border-radius: none;
  margin-bottom: 0;
  box-shadow: none;            /* 去掉阴影 */
  border: none;                /* 去掉边框 */
  width: 60%;
  margin: 0 auto;              /* 容器自身居中 */
  flex-direction: column;      /* 垂直排列消息 */
}
  


.empty-state {
  text-align: center;
  color: var(--text-light);
  padding: 60px 20px;
}

.empty-state p {
  margin: 10px 0;
  font-size: 16px;
}

.chat-item {
  margin-bottom: 20px;
  animation: fadeInUp 0.5s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.message-wrapper {
  display: flex;
  margin-bottom: 16px;
  align-items: flex-end;
}

.user-wrapper {
  justify-content: flex-end;
}

.ai-wrapper {
  justify-content: flex-start;
  gap: 10px;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
  border: 1px solid var(--border-color);
}

.message-bubble {
  max-width: 75%;
  border-radius: var(--border-radius);
  line-height: 1.6;
  word-wrap: break-word;
  position: relative;
  box-shadow: var(--shadow);
}

.user-bubble {
  background: var(--primary-color);
  color: var(--text-primary);
  border-radius: var(--border-radius);
  padding: 16px 20px;
  text-align: left;
}

.ai-bubble {
  background: var(--white);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--border-radius);
  padding: 16px 20px;
}

.message-time {
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
  margin-top: 8px;
}

/* Markdown 样式 */
.markdown-content {
  font-size: 15px;
}

.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 12px 0 8px 0;
  color: var(--text-primary);
}

.markdown-content :deep(p) {
  margin: 8px 0;
  color: var(--text-primary);
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

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
  color: var(--text-primary);
}

.markdown-content :deep(li) {
  margin: 4px 0;
}

/* 加载动画 */
.loading-dots {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--primary-color);
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) { animation-delay: -0.32s; }
.loading-dots span:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

/* 输入区域 */
.input-area {
  display: flex;
  gap: 10px;
  align-items: flex-end;
  background: var(--background-secondary);
  padding: 15px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  animation: slideInUp 0.6s ease-out;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  justify-content: center;
  width: 60%;
  margin:120px auto 0; 
}

.input-area::before {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60%;
  height: 2px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color));
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.3s ease;
}

.input-area:focus-within::before {
  transform: scaleX(1);
}

@keyframes slideInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.input-box {
  padding: 16px 20px;
  height: 60px; 
  width: 60%;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  resize: none;
  font-family: inherit;
  line-height: 1.5;
  max-height: 150px;
  transition: border-color 0.3s;
  background: var(--background-tertiary);
  color: var(--text-primary);
  
}

.input-box:focus {
  outline: none;
  border-color: var(--primary-color);
}

.input-box:disabled {
  background: var(--background-tertiary);
  cursor: not-allowed;
  opacity: 0.7;
}

.send-btn {
  
  padding: 12px 24px;          /* 减小内边距（上下 12，左右 24） */
  background: #447BBD;
  color: white;
  border: none;
  border-radius: 8px;          /* 减小圆角 */
  font-size: 15px;             /* 稍微减小字体 */
  font-weight: 500;            /* 改回正常字重（120 太轻了） */
  cursor: pointer;
  transition: all 0.3s;
  white-space: nowrap;
  box-shadow: 0 4px 6px rgba(68, 123, 189, 0.3);
  position: relative;
  overflow: hidden;
   margin-left: 80px;

}

.send-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
  transition: left 0.6s ease;
}

.send-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.send-btn:hover::before {
  left: 100%;
}

.send-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
}

/* 滚动条样式 */
.chat-history::-webkit-scrollbar {
  width: 6px;
}

.chat-history::-webkit-scrollbar-track {
  background: var(--background-tertiary);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 3px;
}

.chat-history::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}
.markdown-content {
  text-align: left;
}

/* 参考案例样式 */
.reference-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--border-color);
}

.reference-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 12px;
}

.reference-item {
  background: var(--background-secondary);
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid var(--primary-color);
}

.reference-item:last-child {
  margin-bottom: 0;
}

.reference-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.reference-number {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
}

.reference-case-number {
  font-size: 12px;
  color: var(--primary-color);
  font-family: 'Courier New', monospace;
}

.reference-category {
  font-size: 12px;
  color: var(--text-secondary);
  margin-bottom: 6px;
}

.reference-preview {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}
</style>
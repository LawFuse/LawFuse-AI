<script setup>
import { ref } from 'vue'
import axios from 'axios'
import * as pdfjsLib from 'pdfjs-dist'
import { marked } from 'marked'
marked.setOptions({
  breaks: true,
  gfm: true
})
// 配置 Worker (使用 CDN 避免 Vite 路径问题)
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const selectedFile = ref(null)
const previewUrl = ref('')
const ocrResult = ref('')
const isLoading = ref(false)
const progress = ref(0)
const statusText = ref('')
const isPdf = ref(false)
const totalPages = ref(0)
function renderMarkdown(text) {
  if (!text) return ''
  return marked.parse(text)
}
async function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  processFile(file)
}

function handleDrop(event) {
  const file = event.dataTransfer.files[0]
  if (!file) return
  
  processFile(file)
}

async function processFile(file) {
  selectedFile.value = file
  ocrResult.value = ''
  progress.value = 0
  statusText.value = ''
  
  if (file.type === 'application/pdf') {
    isPdf.value = true
    statusText.value = '正在解析 PDF...'
    try {
      const arrayBuffer = await file.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      totalPages.value = pdf.numPages
      previewUrl.value = `PDF 文档 (${pdf.numPages} 页)`
      console.log('PDF 解析成功，共', pdf.numPages, '页')
    } catch (err) {
      console.error('PDF 解析失败:', err)
      statusText.value = 'PDF 解析失败'
    }
  } else if (file.type.startsWith('image/')) {
    isPdf.value = false
    previewUrl.value = URL.createObjectURL(file)
    totalPages.value = 1
  }
}

async function recognizeOCR() {
  if (!selectedFile.value) return
  
  isLoading.value = true
  ocrResult.value = ''
  let fullText = ''

  try {
    if (isPdf.value) {
      const arrayBuffer = await selectedFile.value.arrayBuffer()
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise
      
      for (let i = 1; i <= pdf.numPages; i++) {
        statusText.value = `正在处理第 ${i}/${pdf.numPages} 页...`
        
        // 1. 获取页面并渲染到 Canvas
        const page = await pdf.getPage(i)
        const scale = 1.5 
        const viewport = page.getViewport({ scale })
        
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        
        await page.render({ canvasContext: context, viewport }).promise
        
        // 2. 转为 Data URL
        const dataUrl = canvas.toDataURL('image/png')
        
        // 3. 将 DataURL 转为 Blob
        const response = await fetch(dataUrl)
        const blob = await response.blob()
        
        // 4. 发送请求
        const formData = new FormData()
        formData.append('file', blob, `page_${i}.png`)
        
        const res = await axios.post(`${API_BASE_URL}/api/ocr/recognize`, formData)
        
        if (res.data.code === 0) {
          fullText += `\n--- 第 ${i} 页 ---\n${res.data.text}\n`
          ocrResult.value = fullText
        }
        
        progress.value = Math.round((i / pdf.numPages) * 100)
      }
    } else {
      // 普通图片逻辑
      statusText.value = '正在识别图片...'
      const formData = new FormData()
      formData.append('file', selectedFile.value)
      const res = await axios.post(`${API_BASE_URL}/api/ocr/recognize`, formData)
      if (res.data.code === 0) ocrResult.value = res.data.text
      progress.value = 100
    }
    statusText.value = '识别完成！'
  } catch (error) {
    console.error('OCR 流程出错:', error)
    statusText.value = '发生错误: ' + error.message
  } finally {
    isLoading.value = false
  }
}

function downloadTxt() {
  if (!ocrResult.value) return
  const blob = new Blob([ocrResult.value], { type: 'text/plain;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `完整OCR结果_${Date.now()}.txt`
  a.click()
}
</script>

<template>
  <div class="ocr-container">
    <h2 class="title">智能文档 OCR 识别</h2>
    
    <!-- 上传区域 -->
    <div class="upload-section">
      <div class="upload-area" @dragover.prevent @drop.prevent="handleDrop">
        <input 
          type="file" 
          @change="handleFileSelect" 
          accept="image/*,.pdf"
          id="file-input"
          class="file-input"
        />
        <label for="file-input" class="upload-label">
          <div class="upload-icon">📁</div>
          <p class="upload-text">点击或拖拽文件到此处</p>
          <p class="upload-hint">支持 PDF、JPG、PNG 等格式，最大 10MB</p>
        </label>
      </div>
      
      <!-- 文件信息 -->
      <div v-if="previewUrl && !isLoading" class="file-info">
        <div class="info-item">
          <span class="info-label">文件名：</span>
          <span class="info-value">{{ selectedFile?.name }}</span>
        </div>
        <div class="info-item">
          <span class="info-label">类型：</span>
          <span class="info-value">{{ isPdf ? 'PDF 文档' : '图片' }}</span>
        </div>
        <div class="info-item" v-if="isPdf">
          <span class="info-label">页数：</span>
          <span class="info-value">{{ totalPages }} 页</span>
        </div>
      </div>

      <!-- 进度条 -->
      <div v-if="isLoading" class="progress-section">
        <div class="progress-bar">
          <div class="bar" :style="{ width: progress + '%' }"></div>
        </div>
        <p class="progress-text">{{ statusText }}</p>
        <p class="progress-percent">{{ progress }}%</p>
      </div>


      <br>
      <br>
      <br>
      <button 
        @click="recognizeOCR" 
        :disabled="!selectedFile || isLoading" 
        class="start-btn"
      >
        <span v-if="isLoading"> 识别中...</span>
        <span v-else>开始全文识别</span>
      </button>
    </div>

    <!-- 识别结果 -->
    <div v-if="ocrResult" class="result-box">
      <div class="result-header">
        <h3>识别结果</h3>
        <button @click="downloadTxt" class="dl-btn">下载 TXT</button>
      </div>
      <div class="result-content">
        <div class="markdown-content" v-html="renderMarkdown(ocrResult)"></div>
      </div>
    </div>
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

.ocr-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

.title {
  text-align: center;
  color: var(--text-primary);
  margin-bottom: 30px;
  font-size: 28px;
}

/* 上传区域 */
.upload-section {
  background: var(--background-secondary);
  padding: 30px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  margin-bottom: 20px;
  border: 1px solid var(--border-color);
}

.upload-area {
  border: 2px dashed var(--primary-color);
  border-radius: 12px;
  padding: 50px 30px;
  text-align: center;
  background: linear-gradient(135deg, var(--background-tertiary) 0%, rgba(59, 130, 246, 0.1) 100%);
  transition: all 0.3s;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  animation: fadeInUp 0.6s ease-out;
}

.upload-area::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s ease;
}

.upload-area:hover {
  border-color: var(--secondary-color);
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  transform: translateY(-5px);
  box-shadow: var(--shadow-hover);
}

.upload-area:hover::before {
  left: 100%;
}

.file-input {
  display: none;
}

.upload-label {
  cursor: pointer;
  display: block;
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 15px;
}

.upload-text {
  font-size: 18px;
  color: #2c3e50;
  margin: 10px 0;
  font-weight: 500;
}

.upload-hint {
  font-size: 14px;
  color: #7f8c8d;
  margin: 5px 0;
}

/* 文件信息 */
.file-info {
  margin-top: 20px;
  padding: 18px;
  background: var(--background-tertiary);
  border-radius: 8px;
  border-left: 4px solid var(--primary-color);
}

.info-item {
  display: flex; flex-direction: column;
  margin: 8px 0;
  font-size: 15px;
}

.info-label {
  color: #7f8c8d;
  min-width: 80px;
  font-weight: 500;
}

.info-value {
  color: #2c3e50;
  flex: 1;
}

/* 进度条 */
.progress-section {
  margin-top: 20px;
  text-align: center;
}

.progress-bar {
  width: 100%;
  height: 24px;
  background: #e0e0e0;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
}

.bar {
  height: 100%;
  background: linear-gradient(90deg, var(--primary-color) 0%, var(--secondary-color) 100%);
  transition: width 0.4s ease;
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.bar::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.3),
    transparent
  );
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
}

.progress-text {
  color: #2c3e50;
  font-size: 16px;
  margin: 10px 0 5px 0;
  font-weight: 500;
}

.progress-percent {
  color: var(--primary-color);
  font-size: 24px;
  font-weight: bold;
  margin: 5px 0;
}

/* 按钮 */
.start-btn {
  width: 100%;
  margin-top: 20px;
  padding: 20px 24px;
  background: var(--primary-color);
  color: #447BBD;
  border: none;
  border-radius: var(--border-radius);
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: var(--shadow);
  z-index: 99999;
}

.start-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.start-btn:active:not(:disabled) {
  transform: translateY(0);
}

.start-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  box-shadow: none;
}

/* 结果区域 */
.result-box {
  background: var(--background-secondary);
  padding: 25px;
  border-radius: 12px;
  box-shadow: var(--shadow);
  animation: slideUp 0.5s ease;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
}

.result-box::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--primary-color));
  animation: gradientShift 3s ease infinite;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 2px solid #f0f0f0;
}

.result-header h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 22px;
}

.dl-btn {
  padding: 10px 20px;
  background: linear-gradient(135deg, #4caf50 0%, #45a049 100%);
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 15px;
  transition: all 0.3s;
  box-shadow: 0 2px 4px rgba(76, 175, 80, 0.3);
}

.dl-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(76, 175, 80, 0.4);
}

.result-content {
  background: var(--background-tertiary);
  padding: 20px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  max-height: 600px;
  overflow-y: auto;
}

.result-content pre {
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
  line-height: 1.8;
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 14px;
  color: #333;
}

/* 滚动条样式 */
.result-content::-webkit-scrollbar {
  width: 8px;
}

.result-content::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.result-content::-webkit-scrollbar-thumb {
  background: var(--primary-color);
  border-radius: 4px;
}

.result-content::-webkit-scrollbar-thumb:hover {
  background: var(--secondary-color);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .ocr-container {
    padding: 10px;
  }
  
  .upload-section {
    padding: 20px;
  }
  
  .result-header {
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
  }
  
  .dl-btn {
    width: 100%;
  }
}


.markdown-content :deep(h1),
.markdown-content :deep(h2),
.markdown-content :deep(h3) {
  margin: 12px 0 8px 0;
  color: var(--text-primary);
}

.markdown-content :deep(p) {
  margin: 8px 0;
  line-height: 1.8;
}

.markdown-content :deep(ul),
.markdown-content :deep(ol) {
  padding-left: 20px;
  margin: 8px 0;
}

.markdown-content :deep(li) {
  margin: 4px 0;
}

.markdown-content :deep(code) {
  background: var(--background-tertiary);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: 'Courier New', monospace;
}

.markdown-content :deep(pre) {
  background: var(--background-tertiary);
  padding: 12px;
  border-radius: 6px;
  overflow-x: auto;
}

.markdown-content :deep(blockquote) {
  border-left: 4px solid var(--primary-color);
  padding-left: 16px;
  margin: 8px 0;
  color: var(--text-secondary);
}
.markdown-content {
  text-align: left;
}
</style>
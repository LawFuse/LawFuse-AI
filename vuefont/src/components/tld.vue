<template>
  <div class="tld-container">
    <h2 class="title">本地部署服务</h2>
    
    <div class="form-card">
      <p class="form-description">请填写以下信息，我们会尽快与您联系</p>
      
      <div class="form-group">
        <label for="orgName" class="form-label">机构名称</label>
        <input 
          id="orgName"
          v-model="formData.orgName" 
          type="text" 
          placeholder="请输入您的机构名称"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="contact" class="form-label">联系方式</label>
        <input 
          id="contact"
          v-model="formData.contact" 
          type="text" 
          placeholder="请输入手机号或邮箱"
          class="form-input"
        />
      </div>

      <div class="form-group">
        <label for="description" class="form-label">详细描述</label>
        <textarea 
          id="description"
          v-model="formData.description" 
          placeholder="请描述您的部署需求和场景"
          class="form-textarea"
          rows="6"
        ></textarea>
      </div>

      <button 
        @click="submitForm" 
        class="submit-btn"
        :disabled="!isFormValid"
      >
        提交申请
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const formData = ref({
  orgName: '',
  contact: '',
  description: ''
})

const isFormValid = computed(() => {
  return formData.value.orgName.trim() && 
         formData.value.contact.trim() && 
         formData.value.description.trim()
})

function submitForm() {
  if (!isFormValid.value) {
    alert('请填写完整信息')
    return
  }
  
  console.log('提交的数据：', formData.value)
  alert('提交成功！我们会尽快与您联系')
  
  formData.value = {
    orgName: '',
    contact: '',
    description: ''
  }
}
</script>

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

.tld-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.title {
  text-align: center;
  color: #447BBD;
  margin-bottom: 30px;
  font-size: 28px;
  font-weight: 600;
}

.form-card {
  background: var(--white);
  padding: 40px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  width: 100%;
}

.form-description {
  color: var(--text-secondary);
  margin-bottom: 30px;
  text-align: center;
  font-size: 15px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: #447BBF;
  font-weight: 500;
  font-size: 15px;
}

.form-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 15px;
  font-family: inherit;
  transition: var(--transition);
  background: var(--background-secondary);
  color: var(--text-primary);
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(68, 123, 189, 0.1);
}

.form-textarea {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--border-color);
  border-radius: var(--border-radius);
  font-size: 15px;
  font-family: inherit;
  line-height: 1.6;
  resize: vertical;
  transition: var(--transition);
  background: var(--background-secondary);
  color: var(--text-primary);
  box-sizing: border-box;
  min-height: 120px;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(68, 123, 189, 0.1);
}

.submit-btn {
  width: 100%;
  padding: 16px 24px;
  background: #447BBD;
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 10px;
  box-shadow: var(--shadow);
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
</style>
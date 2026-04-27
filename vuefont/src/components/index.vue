<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Ask from './ask.vue'
import Ocr from './ocr.vue'
import Zhanshi from './zhanshi.vue'
import Wenshujiexi from './wenshujiexi.vue'
import Tld from './tld.vue'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL
const username = ref('')
const password = ref('')
const loginStatus = ref(false)
const ask1 = ref(true)
const ocr1 = ref(false)
const zhanshi1 = ref(false)
const tld = ref(false)
const dev = ref(false)
const wenshujiexi = ref(false)
const isLoading = ref(false)
const login1 = ref(false)

async function Login() {
  if (!username.value.trim() || !password.value.trim()) {
    alert('请输入用户名和密码');
    return;
  }
  
  isLoading.value = true
  try {
    const res = await axios.post(`${API_BASE_URL}/api/login/tologin`, {
      username: username.value,
      password: password.value,
    })
    if(res.data === "登录成功"){
        
        loginStatus.value = true;
        // 默认显示介绍页面
        tozhanshi();
       }
  } catch (error) {
    alert('登录失败，请检查网络或账号密码');
  } finally {
    isLoading.value = false
  }
}

function toask() {
  ask1.value = true
  zhanshi1.value = false
  ocr1.value = false
  wenshujiexi.value = false
  tld.value = false
}

function tozhanshi() {
  zhanshi1.value = true
  ask1.value = false
  ocr1.value = false
  wenshujiexi.value = false
  tld.value = false
  login1.value = false
}

function toocr() {
  ocr1.value = true
  ask1.value = false
  zhanshi1.value = false
  wenshujiexi.value = false
  tld.value = false 
  login1.value = false
}

function towenshujiexi() {
  wenshujiexi.value = true
  ask1.value = false
  ocr1.value = false
  zhanshi1.value = false
  tld.value = false
  login1.value = false
}
function totld() {
  tld.value = true
  wenshujiexi.value = false
  ask1.value = false
  ocr1.value = false
  zhanshi1.value = false
  login1.value = false
  
}
function tologin() {
  login1.value = true
  tld.value = false
  ask1.value = false
  ocr1.value = false
  zhanshi1.value = false
  wenshujiexi.value = false
}

onMounted(() => {
  // 页面加载完成后的逻辑
})
</script>

<template>
  <div class="app-container">
    <!-- 头部 -->
 

    <!-- 主内容 -->
    <main class="app-main">
      <!-- 登录区域 -->
     

      <div v-if="dev" class="dev-container">
        <h2>开发环境</h2>
        <p>文书解析:{{ wenshujiexi }}</p>
        <p>本地化部署:{{ tld }}</p>
     
        <p>OCR识别:{{ ocr1 }}</p>
        <p>首页:{{ zhanshi1 }}</p>
        <p>智能助手:{{ ask1 }}</p>
     

      </div>







      <!-- 导航区域 -->
      <div  class="nav-container" style="position: sticky; top: 0; z-index: 9999; background: #fff;">
        <nav class="nav-menu">
           <div class="header-content">
        <img src="/src/logo.jpg" alt="律合" class="logo" style="width: 120px; height: auto; display: block;">
      </div>
          <button @click="tozhanshi" class="nav-btn" :class="{ active: zhanshi1 }">
            首页
          </button>
          <button @click="toask" class="nav-btn" :class="{ active: ask1 }">
            智能助手
          </button>
          <button @click="toocr" class="nav-btn" :class="{ active: ocr1 }">
            OCR识别
          </button>
          <button @click="towenshujiexi" class="nav-btn" :class="{ active: wenshujiexi }">
            文书解析
          </button>
          <button @click="totld" class="nav-btn">
            本地化部署
          </button>
          <button v-if="!loginStatus" style="background:#447BBD; color:#fff;margin-left: auto;" @click="tologin" class="nav-btn" >
            登录
          </button>
          <div class="user-info" v-if="loginStatus">
          <span class="welcome-text">欢迎您，{{ username }}</span>
        </div>
        </nav>
        
        <!-- 用户信息 -->
        <!-- <div class="user-info" v-if="loginStatus">
          <span class="welcome-text">欢迎您，{{ username }}</span>
        </div> -->
      </div>





       <div v-if="!loginStatus &&login1" class="login-container">
       
        <div class="login-card">
          <h2 class="login-title">用户登录</h2>
          <div class="form-group">
            <label for="username" class="form-label">用户名</label>
            <input 
              id="username"
              v-model="username" 
              type="text" 
              placeholder="请输入用户名"
              class="form-input"
            > 
          </div>
        
          <div class="form-group">
            <label for="password" class="form-label">密码</label>
            <input 
              id="password"
              v-model="password" 
              type="password" 
              placeholder="请输入密码"
              class="form-input"
            >
          </div>
          <button 
            @click="Login" 
            class="login-btn"
            :disabled="isLoading"
          >
            <span v-if="isLoading">登录中...</span>
            <span v-else>登录</span>
          </button>
          
        </div>

        
      </div>



      <!-- 内容区域 -->
      <div class="content-container">
        <div v-if="ask1">
          <Ask/>
        </div>
        
        <div v-if="ocr1">
          <Ocr/>
        </div>
        
        <div v-if="zhanshi1">
          <Zhanshi/>
        </div>
        
        <div v-if="wenshujiexi">
          <Wenshujiexi/>
        </div>
        <div v-if="tld">
          <Tld/>
        </div>
      </div>
    </main>

    <!-- 底部 -->
    <footer class="app-footer">
      <p class="footer-text">© 2026 Lawfuse类案推荐助手</p>
    </footer>
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

/* 应用容器 */
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}

/* 头部 */
.app-header {
  background: var(--primary-color);
  color: var(--white);
  padding: 15px 40px;
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-container {
  display: flex;
  align-items: center;
}

.logo-image {
  height: 40px;
  width: auto;
  object-fit: contain;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.app-title {
  font-size: 28px;
  font-weight: 700;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 10px;
}

.app-subtitle {
  font-size: 16px;
  font-weight: 400;
  opacity: 0.9;
}

/* 主内容 */
.app-main {
  flex: 1;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

/* 登录容器 */
.login-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.login-card {
  background: var(--background-secondary);
  padding: 40px;
  border-radius: var(--border-radius);
  box-shadow: var(--shadow);
  width: 100%;
  max-width: 400px;
  text-align: center;
  animation: fadeInUp 0.8s ease-out;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  display: flex; flex-direction: column;
  align-items: center;
  gap: 20px;
}

.login-card::before {
  content: '';
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: linear-gradient(45deg, transparent, rgba(30, 136, 229, 0.1), transparent);
  transform: rotate(45deg);
  animation: shine 3s infinite;
}

@keyframes shine {
  0% {
    transform: translateX(-100%) rotate(45deg);
  }
  100% {
    transform: translateX(100%) rotate(45deg);
  }
}

.login-title {
  color: var(--text-primary);
  margin-bottom: 30px;
  font-size: 24px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 20px;
  text-align: left;
}

.form-label {
  display: block;
  margin-bottom: 8px;
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
}

.form-input {
  width: 100%;
  padding: 14px 18px;
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  transition: var(--transition);
  background: var(--background-tertiary);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
}

.login-btn {
  width: 100%;
  padding: 18px 24px;
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  border: none;
  border-radius: 10px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-top: 10px;
  box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: var(--shadow-hover);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

/* 导航容器 */
.nav-container {
  .nav-container {
  background: var(--white);
  box-shadow: var(--shadow);
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  animation: fadeInUp 0.6s ease-out;
  
  /* 修改这些属性 */
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  margin: 0;           /* 去掉外边距 */
  border-radius: 0;    /* 去掉圆角 */
  border: none;        /* 去掉边框 */
  width: 100%;         /* 确保占满全宽 */
  box-sizing: border-box; /* 包含 padding 在宽度内 */
}
}

.nav-menu {
  display: flex;
  gap: 15px;
}

.nav-btn {
  padding: 16px 28px;
  background: var(--background-secondary);
  color: var(--text-primary);
  border: 2px solid var(--border-color);
  border-radius: 10px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  overflow: hidden;
}

.nav-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.1), transparent);
  transition: left 0.6s ease;
}

.nav-btn:hover {
  border-color: var(--primary-color);
  color: var(--primary-color);
  transform: translateY(-2px);
  box-shadow: var(--shadow-hover);
}

.nav-btn:hover::before {
  left: 100%;
}

.nav-btn.active {
  background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
  color: var(--white);
  border-color: var(--primary-color);
  box-shadow: var(--shadow-hover);
}

.user-info {
  display: flex;
  align-items: center;
  
  margin-left: auto;
}

.welcome-text {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}

/* 内容容器 */
.content-container {
  flex: 1;
  background: var(--background-secondary);
  border-radius: var(--border-radius);
  box-shadow: none;
  padding: 20px;
  min-height: 500px;
  animation: fadeInUp 0.6s ease-out 0.2s both;
  position: relative;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border: none;
}

.content-container::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, var(--primary-color), var(--secondary-color), var(--primary-color));
  animation: gradientShift 3s ease infinite;
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

/* 底部 */
.app-footer {
  background: var(--text-primary);
  color: var(--white);
  padding: 20px;
  text-align: center;
  margin-top: auto;
}

.footer-text {
  margin: 0;
  font-size: 14px;
  opacity: 0.8;
}

/* 动画定义 */
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

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 15px 20px;
  }
  
  .app-title {
    font-size: 24px;
  }
  
  .app-main {
    padding: 20px;
  }
  
  .login-card {
    padding: 30px;
  }
  
  .nav-container {
    flex-direction: column;
    gap: 15px;
    align-items: stretch;
  }
  
  .nav-menu {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .nav-btn {
    padding: 10px 20px;
  }
}
</style>
const https = require('https');

// 👉 把你的 API KEY 填这里
const API_KEY = "sk-4112588f32f54ccd947338d7c3513e31";

const postData = JSON.stringify({
  "model": "qwen3.6-plus",
  "messages": [
    { "role": "user", "content": "你是谁？" }
  ]
});

const req = https.request({
  hostname: "dashscope.aliyuncs.com",
  port: 443,
  path: "/compatible-mode/v1/chat/completions",
  method: "POST",
  headers: {
    "Authorization": "Bearer " + API_KEY,
    "Content-Type": "application/json"
  }
}, (res) => {
  let data = "";
  res.on("data", (chunk) => { data += chunk });
  res.on("end", () => {
    console.log("\n✅ AI 返回结果：");
    console.log(data);
  });
});

req.write(postData);
req.end();




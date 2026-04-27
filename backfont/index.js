// 引入 express
const express = require('express');
const app = express();
const port = 3000;
const login = require('./api/login');
const ask = require('./api/ask');
const cors = require('cors');
const ocr = require('./api/ocr');
const cases = require('./api/cases');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/login', login);
app.use('/api/ask', ask);
app.use('/api/ocr', ocr);
app.use('/api/cases', cases);
// 测试接口
app.get('/', (req, res) => {
  res.send('Node.js 后端启动成功！');
});

// 启动服务
app.listen(port, () => {
  console.log(`服务运行在 http://localhost:${port}`);
});
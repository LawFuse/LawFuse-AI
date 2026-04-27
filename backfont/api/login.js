const express = require('express');
const router = express.Router();

const acountjson = {
    "admin":"123456",
    "root":"123456",
    "user1":"123456",
    "user2":"123456",
}
router.get('/', (req, res) => {
  res.send('登录接口运行成功');
});
router.post('/tologin', (req, res) => {
 const username = req.body.username;
 const password = req.body.password;
 if(!username || !password){
    res.send('用户名或密码不能为空');
    return;
 }
 if(acountjson[username] !== password){
    res.send('用户名或密码错误');
    return;
 }
  res.send('登录成功');
});









module.exports = router;
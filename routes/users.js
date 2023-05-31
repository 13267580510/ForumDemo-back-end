var express = require('express');
var router = express.Router();
const { User } = require('../API/Model/User')
const bcrypt = require('bcrypt')

//用户登录
router.post('/login',async (req,res,next)=>{
  //先从数据库中查找该用户数据
  const user = await User.findOne({ username:req.body.UserName});
  //判断是否有该用户
  if(user==null){
    res.send('不存在该用户');
    return ;
  }
  console.log(user);
  //用户发过来的密码
  const password_1=req.body.Password;
  //数据库中的密码
  const password_2=user.password;
  try {
    bcrypt.compare(password_1,password_2,(err,result)=>{
      if (err) {
        // 处理错误
        console.error(err);
        return;
      }

      if (result) {
        // 密码匹配
        console.log('密码匹配');
        res.send({
          code:200,
          data:{
            satoken:user.satoken,
            status:user.status,
            profile: {
              UID:user.UID,
              username: user.username,
              nickname: user.nickname,
              avatar: user.avatar,
              description: user.description
            }
          }
        })
      } else {
        // 密码不匹配
        console.log('密码不匹配');
        res.send({
          data:500,
          data:"用户名或密码错误"
        })
      }
    })
  }catch (error){
    console.log(error);
  }
  })

//修改用户登录状态
router.post('/UpdateStatus',async (req,res,next)=>{
      console.log('UpdateStatus:',req.body);
      const UID = req.body.UID;
      const ifStatus = req.body.status;
      await User.findOneAndUpdate(
          {UID:UID},//查询条件
          {status:ifStatus},
          {new:true}
      ).then(success=> {
        try {
        if(UID==''){
          return
        }
        if (success.status) {
          console.log("用户", UID, '登录成功', success);
        } else {
          console.log("用户", UID, '登出成功', success);
        }
       }catch (error){
         console.log('错误:',error)
        }
      }).catch(error=>{
        console.log(error);
      })
})

// 用户注册
router.post('/register', async (req, res, next) => {
  console.log('接收到注册请求');
  console.log('req:',req.body.username);
  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    nickname: req.body.nickname,
    avatar:req.body.avatar,
    status: false
    }).then((success)=>{
      res.send(success);
  }).catch((err)=>{
    console.log("出现错误",err);
    res.send("注册失败")
  })

});

// 获取用户信息
router.get('/info', async (req, res, next) => {
  console.log(req.query.username);
  const user = await User.findOne({
    username: req.query.username})
  if(user!=null) {
    res.send({
      code: 200,
      data: user,
    })
  }else {
    res.send({
      code: 500,
      data: "未找到该用户",
    })
  }
})

// 获取用户列表
router.get('/list', async(req, res, next)=>{
  const user = await User.find();
  res.send({
    code: 200,
    msg: '获取成功',
    data: user
  })
})

module.exports = router;


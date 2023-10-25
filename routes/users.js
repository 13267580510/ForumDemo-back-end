var express = require('express');
var router = express.Router();
const { User } = require('../API/Model/User')
const bcrypt = require('bcryptjs');
const {Avatar} = require('../API/Model/Avatar');
const fs =require('fs');
const path = require('path');
//用户登录
router.post('/login',async (req,res,next)=>{
     try{
      //先从数据库中查找该用户数据
      console.log('接收到登录请求:',req.body);
      const user = await User.findOne({ username:req.body.username});
      //判断是否有该用户
      if(user==null){
        res.send('不存在该用户');
        return ;
      }else{
        console.log(user);
        //用户发过来的密码
        const password_1=req.body.password;
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
                code:1000,
                data:{
                  satoken:user.satoken,
                  status:user.status,
                  UID:user.UID,
                  username: user.username,
                  nickname: user.nickname,
                  avatar: user.avatar,
                  description: user.description,
                  tags:user.tags
                },
                message:"请求成功",
                success:true
              })
            } else {
              // 密码不匹配
              console.log('密码不匹配');
              res.send({
                data:500,
                message:"用户名或密码错误"
              })
            }
          })
        }catch (error){
          console.log(error);
        }
      }

     }catch (err){
       console.log("err:",err);
     }
})

//修改用户登录状态
router.post('/UpdateStatus',async (req,res,next)=>{
  try {

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
  }catch(err){
    console.log("err:",err)
  }


})

// 用户注册
router.post('/register', async (req, res, next) => {
  try {

    console.log('接收到注册请求');
    console.log('req:',req.body.username);
    const user = await User.create({
      username: req.body.username,
      password: req.body.password,
      nickname: req.body.nickname,
      avatar:req.body.avatar,
      status: false
    }).then((success)=>{
      res.send({
        code:1000,
        data:{
          username:success.username,
          nickname:success.username,
          avatar:success.avatar,
          description:success.description
        },
        message:'注册成功',
        success:'true'
      });
    }).catch((err)=>{
      console.log("出现错误",err);
      res.send("注册失败")
    })

  }catch(err){
    console.log("err:",err)
  }




});

// 获取用户信息
router.get('/info', async (req, res, next) => {
    try {
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
    }catch(err){
      console.log("err:",err)
    }
})

// 获取用户列表
router.get('/list', async(req, res, next)=>{
  try {
    const user = await User.find();
    res.send({
      code: 200,
      msg: '获取成功',
      data: user
    })
  }catch(err){
    console.log("err:",err)
  }


})

//修改用户标签
router.post('/updateTag',async (req,res)=>{
  try {

    console.log('接收到更改用户标签的请求:',req.body.data);
    console.log('UID：',req.body);
    const tagArr = req.body.data;
    const user = await  User.findOne({UID:req.body.UID});
    if(user){
      user.tags.splice(0, user.tags.length);
      console.log('user:',user);
      for(let i =0;i<tagArr.length;i++){
        user.tags.push({tagName:tagArr[i]})
      }
      console.log(user);
      const NewUser  = await user.save();

      res.send({
        code:1000,
        data:user.tags,
        success:true
      })

      console.log('标签修改成功');
    }else{
      console.log('没找到user:',user);
      res.send({
        code:1000,
        msg:"没找到用户",
        success:false
      })
    }

  }catch(err){
    console.log("err:",err)
  }


})
//修改用户的头像
router.post('/updateAvatar',async (req,res)=>{
  try{
    let fileObj = null;
    let filePath = '';
    console.log("req.files:",req.files[0]);
    if(!req.files || Object.keys(req.files).length === 0) {
      res.status(400).send({
        code: 1,
        msg: 'Bad Request.'
      })
      return;
    }

    /* file 是上传时候body中的一个字段，有可以随意更改*/
    console.log(req.files, req.files.file)
    fileObj = req.files.file;

    filePath = './avatar/' + fileObj.name;
    fileObj.mv(filePath, async (err) => {
      if(err) {
        return res.status(500).send({
          code: 1,
          msg: 'System error'
        })
      }

      await  Avatar.create({
        avatarName:fileObj.name,
        avatarPath:"/avatar/"+fileObj.name
      })

      res.send({
        code: 0,
        data: 'Upload Successfuly'
      })
    })

  }catch (err){
    console.log(err);
  }


});
//获取头像库中的所有头像
router.get('/getAllAvatar',async (req,res)=>{
  try{
    const avatars = await Avatar.find();
    if(avatars){
        res.send({
            code:1000,
            data:avatars,
            success:true
        })
    }else{
      res.send({
        code:1000,
        success:false,
        message:"请求失败"
      })
    }
  }catch (err){
    console.log("err:",err)
  }


})
//获取头像库中的头像
router.get(`/getAvatar`,async (req,res)=>{
  console.log("req",req.query._id)
  const _id = req.query._id;
  if(_id){
    const avatar = await  Avatar.findOne({_id});
    //avatarName
    //avatarPath
    const file = {
      name: avatar.avatarName,
      path: avatar.avatarPath
    }
    let exist = fs.existsSync(path.resolve(file.path))
    if(exist) {
      res.download(file.path)
    } else {
      res.send({
        code: 1,
        msg: 'File Not Exits'
      })
    }
  }else{
    const file = {
      name: "01.svg",
      path: "./avatar/01.svg"
    }
    let exist = fs.existsSync(path.resolve(file.path))
    if(exist) {
      res.download(file.path)
    } else {
      res.send({
        code: 1,
        msg: 'File Not Exits'
      })
    }
  }

})
module.exports = router;


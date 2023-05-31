var express = require('express');
var router = express.Router();
const { Issue } = require('../API/Model/Issue');

//新增问题
router.post('/addIssue',async (req,res)=>{
    console.log('新增问题请求');
    console.log('req:',req.body.username);
    const issue = await  Issue.create({
        title:req.body.title,
        content:req.body.title,
        category:req.body.category,
        author:req.body.author,
        createTime:req.body.createTime,
        updateTime:req.body.updateTime
    }).then((success)=>{
        console.log('新增问题成功');
        res.send(success);
    }).catch((err)=>{
        console.log('新增问题失败',err);
    })
})

//删除问题

module.exports = router;
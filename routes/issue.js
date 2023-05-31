var express = require('express');
var router = express.Router();
const { Issue } = require('../API/Model/Issue');

//新增问题
router.post('/addIssue',async (req,res)=>{
    console.log('新增问题请求');
    console.log('req:',req.body.username);

    const issue = await  Issue.create({
        title:req.body.title,
        content:req.body.content,
        category:req.body.category,
        author:req.body.author,
        createTime:req.body.createTime,
        updateTime:req.body.updateTime
    }).then((success)=>{
        console.log('新增问题成功');
        res.send(success);
    }).catch((err)=>{
        console.log('新增问题失败',err);
        res.send(err)
    })
})
//查找问题
router.post('/getIssue',async (req,res)=> {
    console.log("接收到查询问题请求",req.body.keyword);
    const keyword = req.body.keyword;
    const issue = await Issue.find({
        $or: [
            {title: {$regex: keyword, $options: 'i'}}, // 匹配标题字段
            {content: {$regex: keyword, $options: 'i'}}, // 匹配内容字段
        ]
    })
    console.log(issue);
    res.send(issue);
})
//删除问题

module.exports = router;
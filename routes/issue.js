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
        updateTime:req.body.updateTime,
        UID:req.body.UID
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
    res.send(issue);
})
//获取所有问题
router.get('/getIssueInfo',async (req,res)=> {
    console.log("接收到获取所有问题请求");
    const issue  = await Issue.find();
    console.log(issue)
    res.send(issue);
})
//删除问题
router.post('/deleteIssue',async (req,res)=>{
    console.log("接收到删除问题请求",req.body);
    // 构造搜索条件
    const filter = { _id: req.body._id };

    // 执行删除操作
    const result = await Issue.findOneAndDelete(filter);
    console.log(result);

})
//修改问题
router.post('/updateIssue',async (req,res)=>{
    console.log('接收到修改问题请求，以下是新的问题信息:',req.body);
    //调取需要修改的问题具体信息
    const IssueID=req.body._id;
    const issue = await Issue.findOne({
        _id:IssueID
    })

    //判断有无这个问题
    if(issue){
        console.log("开始权限判断");
        //判断是否为原作者
        if(issue.UID==req.body.UID){
            console.log('权限核对完成，开始修改信息');
            Issue.findOneAndUpdate(
                {_id:IssueID},
                {
                    title:req.body.title,
                    content:req.body.content,
                    category:req.body.category,
                    updateTime:Date.now()
                },
                {new:true}
            ).then(result=>{
                console.log('问题修改完成');
                res.send(result);
            }).catch(err=>{
                console.log(err);
            })
        }
    }else {
        res.send('无权修改')
    }


})
module.exports = router;
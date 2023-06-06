var express = require('express');
var router = express.Router();
const { Issue } = require('../API/Model/Issue');
const {User} = require('../API/Model/User');
const moment = require("moment-timezone");

//新增问题
router.post('/addIssue',async (req,res)=>{
    console.log('新增问题请求');
    console.log('req:',req.body);

    const issue = await  Issue.create({
        title:req.body.title,
        content:req.body.content,
        categoryId:req.body.categoryId,
        author:req.body.author,
        UID:req.body.UID,
        contactWay:req.body.contactWay,
        contactNumber:req.body.contactNumber
    }).then(async  (success)=>{
        console.log('新增问题成功');
        res.send({
            code:1000,
            data:{
                content:await Issue.find(),
                current:1,
                size:10,
                total:await Issue.find().countDocuments()
            },
            message:"请求成功",
            success:true,
        });
    }).catch((err)=>{
        console.log('新增问题失败',err);
        res.send(err)
    })
})
//查找问题
router.post('/getIssue',async (req,res)=> {
    console.log("接收到查询问题请求",req.body);
    //判断是根据关键字查找问题，还是根据问题_id来查找
    if(req.body.id) {
        console.log('开始根据问题_id查找');
        const issue = await Issue.findOne({_id: req.body.id});
        const user = await User.findOne({UID: issue.UID});
        console.log("author:", user);
        if (user) {
        res.send({
            code: 1000,
            data: {
                author: {
                    avatar: "default",
                    description: user.description,
                    nickname: user.nickname,
                    username: user.username
                },
                category: {
                    name: "",
                    code: issue.categoryId
                },
                commentCount: 0,
                comments: [],
                contactNumber: issue.contactNumber,
                contactWay: issue.contactWay,
                content: issue.content,
                createTime: issue.createTime,
                title: issue.title,
                voteCount:issue.voteCount
            },
            message: "请求成功",
            success: true
        });
        }else{
            res.send({
                message:"提出此问题的用户已经注销",
                success:false
            })
        }
    }
    if(req.body.keyword){
        const keyword = req.body.keyword;
        const issue = await Issue.find({
            $or: [
                {title: {$regex: keyword, $options: 'i'}}, // 匹配标题字段
                {content: {$regex: keyword, $options: 'i'}}, // 匹配内容字段
            ]
        })
        res.send(issue);
    }
})
//获取所有问题
router.get('/getIssueInfo',async (req,res)=> {
    console.log("接收到获取所有问题请求");
    const issue  = await Issue.find();
    if(issue){
        res.send({
            code:1000,
            data:{
                content:issue,
                current:1,
                size:10,
                total:await Issue.find().countDocuments()
            },
            message:"请求成功",
            success:true,
        });
    }
    console.log(issue)
})
//获取用户自己提出的问题
router.post('/getUserIssue',async  (req,res)=>{
    console.log('接收到用户:',req.body.UID,"的获取问题请求");
    const issue = await  Issue.findOne({UID:req.body.UID});
    console.log('Issue:',issue);
    if(issue){
        res.send({
            code:1000,
            data:{
                content:issue,
                current:1,
                size:10,
                total:await Issue.find().countDocuments()
            },
            message:"请求成功",
            success:true,
        });
    }
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
                    updateTime:() => moment().tz('Asia/Shanghai').format()
                },
                {new:true}
            ).then(result=>{
                console.log('问题修改完成');
                res.send(result);
            }).catch(err=>{
                console.log(err);
            })
        }else{
            res.send('无权修改');
        }
    }else {
        res.send('找不到该问题')
    }


})
//点赞此问题
router.post('/vote',async (req,res)=>{
    console.log('接收到点赞问题请求:',req.body.id);
    const issue = await Issue.findOne({_id:req.body.id});
    if(issue){
        console.log('找到Issue:',issue);
        issue.voteCount = issue.voteCount+1;
        console.log('voteCount:',issue.voteCount);
        const result = await issue.save();
        res.send({
            code:1000,
            message:"请求成功",
            success:true
        })
    }else{
        console.log("未找到此问题:",issue);
        res.send({
            code:3003,
            message:"此问题已经注销",
            success:false
        })
    }
});
module.exports = router;
var express = require('express');
var router = express.Router();
const {Comment} = require('../API/Model/Comment');
const {Issue} = require("../API/Model/Issue");
//增加一级评论
router.post('/addOneLevelComment',async (req,res)=>{


    console.log('接收到增加一级评论请求',req.body);
     await Comment.create({
        issueID:req.body.issueID,
        content:req.body.content,
        author:req.body.author,
        UID:req.body.UID,
        likes:req.body.likes,
        dislikes:req.body.dislikes
    }).then((result)=>{
        console.log(result);
        res.send({
            code:200,
            data:result
        })
    }).catch((err)=>{
        console.log("出现错误",err);
        res.send({
            code:500,
            body:err
        })
    })

})
//查找该问题下的所有评论
router.post('/getComment',async (req,res)=>{
    console.log('接收到获取所有评论的请求');
    const commentList = await  Comment.find({issueID:req.body.issueID})
    res.send(commentList);
})
//删除某一级评论
router.post('/deleteComment',async  (req,res)=>{
    console.log('接收到删除请求,开始判断权限',req.body.UID);

    //从数据库中调取请求删除的问题的作者UID
    const comment  = await Comment.findOne({_id:req.body.item._id})

    if(req.body.UID == comment.UID){
        console.log();
        await Comment.findOneAndDelete({_id:req.body.item._id});
        res.send({
            code:200,
            data:'删除成功'
        });
    }else {
        res.send({
            code:500,
            data:'删除失败'
        });
    }
})
module.exports = router;
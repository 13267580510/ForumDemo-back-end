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
    }).then((success)=>{
        console.log(success);
    }).catch((err)=>{
        console.log("出现错误",err);
        res.send("新增评论失败")
    })

})

module.exports = router;
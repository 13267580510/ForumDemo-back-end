var express = require('express');
var router = express.Router();
const {Comment} = require('../API/Model/Comment');
const {Issue} = require("../API/Model/Issue");
const {User} = require("../API/Model/User");
//增加一级评论
router.post('/addOneLevelComment',async (req,res)=>{

    try{
        console.log('接收到增加一级评论请求',req.body);
        await Comment.create({
            issueID:req.body.issueID,
            content:req.body.content,
            author:req.body.author,
            UID:req.body.UID,
        }).then(async  (result)=>{
            await Issue.findOneAndUpdate({_id:req.body.issueID},{ $inc: { commentCount: 1 } })
            const user =  await  User.findOne({UID:req.body.UID});
            console.log(result);
            res.send({
                // code:200,
                // data:result
                code:1000,
                data:{
                    author:{
                        nickname:user.nickname
                    },
                    UID:user.UID,
                    issueID:req.body.issueID,
                    replies:result.replies,
                    content:result.content,
                    createTime:result.createTime,
                    id:result._id,
                    likes:result.likes,
                    dislikes:result.dislikes,
                },
                success:true,
                message:"请求成功"
            })

        }).catch((err)=>{
            console.log("出现错误",err);
            res.send({
                code:500,
                body:err
            })
        })

   }catch (err){
    console.log("err:",err)
   }
})
//查找该问题下的所有评论
router.post('/getComment',async (req,res)=>{
    try {
        console.log('接收到获取所有评论的请求',req.body.issueID);
        const comment = await Comment.find({issueID:req.body.issueID});
        console.log("comment:",comment);
        if(comment){
            res.send({
                code:1000,
                data:comment,
                message:"请求成功",
                success:true
            });

        }
    }catch(err){
        console.log("err:",err)
    }




})
//删除某一级评论
router.post('/deleteComment',async  (req,res)=>{
    try {

        console.log('接收到删除请求,开始判断权限',req.body.UID);
        //从数据库中调取请求删除的问题的作者UID
        const comment  = await Comment.findOne({_id:req.body.id})
        console.log("comment.UID:",comment);
        if(comment){
            try{
                if(req.body.UID == comment.UID){
                    console.log("此评论的问题id是：",comment.issueID);
                    const issueID = comment.issueID;
                    await Issue.findOneAndUpdate(
                        {_id:issueID},
                        { $inc: { commentCount: -1 } }
                    );
                    await Comment.findOneAndDelete({_id:req.body.id});
                    res.send({
                        code:200,
                        data:'删除成功',
                        success:true,
                        message:"请求成功"
                    });
                }else {
                    res.send({
                        code:500,
                        data:'删除失败'
                    });
                }
            }catch(err){
                console.log("删除失败");
            }
        }else{
            console.log("未找到该评论");
        }
    }catch(err){
        console.log("err:",err)
    }

})
//增加某一级评论的二级评论
router.post('/addTw0LevelComment', async (req, res) => {
    try {

        console.log('接收到了增加二级评论请求，请求体如下：', req.body);
        // 判断是否存在此评论
        const comment = await Comment.findOne({ _id: req.body.CommentDetail._id });

        if (comment) {
            console.log('评论存在:', comment);
            const commentId = comment._id;
            const replyForm = req.body.twoReplyForm;
            const issueID = comment.issueID;
            console.log("req");
            try {
                const foundComment = await Comment.findById(commentId);
                if (foundComment) {
                    // 将新的回复对象添加到 Comment 对象的 replies 数组中
                    foundComment.replies.push(replyForm);

                    // 保存修改后的 Comment 对象到数据库
                    const savedComment = await foundComment.save();
                    //给该评论的问题的评论数+1
                    const issue = await Issue.findOneAndUpdate(
                        {_id:issueID},
                        { $inc: { commentCount: 1 } }
                    )
                    console.log('回复添加成功');
                    res.send({
                        code:1000,
                        data:savedComment,
                        message:"请求成功",
                        success:true
                    })
                } else {
                    console.log('未找到指定的 Comment 对象');
                }
            } catch (error) {
                console.error(error);
            }
        } else {
            res.send({
                code:3003,
                success:false,
                message:"评论未找到或已删除"
            })
        }
    }catch(err){
        console.log("err:",err)
    }


});
//删除二级评论
router.post('/deleteTwoLevelComment',async (req,res)=>{
    try {

        console.log('接收到删除二级评论的请求:',req.body);
        //判断权限
        const comment =await Comment.findOne({_id:req.body._id});
        console.log('comment:',comment);
        //判断权限
        if(comment.UID == req.body.UID){
            const index = req.body.index;
            comment.replies.splice(index, 1);
            const result = await comment.save();
            const issueID =  result.issueID;
            await Issue.findOneAndUpdate(
                {_id:issueID},
                { $inc: { commentCount: -1 } }
            );
            console.log("result:",result);
            res.send({
                code:1000,
                data:result,
                success:true,
                message:"请求成功"
            })
        }else{
            res.send({
                code:3003,
                success:false,
                message:"你无权利删除此评论"
            })
        }
    }catch(err){
        console.log("err:",err)
    }


});
//回复二级评论
router.post('/addTwoLevelReply',async (req,res)=>{
    try {

        console.log('接收到了增加二级评论请求，请求体如下：', req.body);
        // 判断是否存在回复的一级评论
        const OneComment = await Comment.findOne({ _id: req.body._id });

        //判断是否存在要回复一级评论的二级评论
        if (OneComment) {
            console.log('一级评论存在:', OneComment);
            const commentIndex = req.body.twoReplyForm.replyToIndex;
            console.log("commentIndex",commentIndex);
            const TwoComent = OneComment.replies[commentIndex];
            if(TwoComent){
                console.log('二级评论存在:', TwoComent);
                try {
                    const foundComment = await Comment.findById({ _id: req.body._id });
                    if (foundComment) {
                        // 将新的回复对象添加到 Comment 对象的 replies 数组中
                        const replyForm = req.body.twoReplyForm
                        foundComment.replies.push(replyForm);

                        // 保存修改后的 Comment 对象到数据库
                        const savedComment = await foundComment.save({new:true});

                        console.log('回复添加成功',savedComment);
                        res.send({
                            code:1000,
                            message:"请求成功",
                            success:true,
                            data:savedComment
                        });
                    } else {
                        console.log('未找到指定的 Comment 对象');
                    }

                } catch (error) {
                    console.error(error);
                }
            }else{
                console.log('没有请求的二级评论');
            }
        } else {
            console.log('没有请求的一级评论');
        }
    }catch(err){
        console.log("err:",err)
    }


});
//一级评论点赞
router.post('/voteOneLevelComment',async(req,res)=>{
    try {

        console.log("接收到一级评论点赞请求:",req.body.id);
        //开始查询是否有此评论
        const commentID = req.body.id
        const result = await Comment.findOneAndUpdate(
            {_id:commentID},
            { $inc: { likes: +1 } }
        )
        if(result){
            res.send({
                code:1000,
                message:"请求成功",
                success:true
            })
        }else{
            res.send({
                code:3003,
                message:"请求失败",
                success:false
            })
        }
    }catch(err){
        console.log("err:",err)
    }





})
//二级评论点赞
router.post('/voteTwoLevelComment', async (req, res) => {
    try {

        const comment = await Comment.findOne({ _id: req.body.item._id });

        if (comment) {
            // 找到需要点赞的二级评论的索引
            const index = req.body.index;

            // 使用 $inc 操作符将 likes 属性加1
            comment.replies[index].likes += 1;

            // 保存更新后的评论对象
            await comment.save();

            res.send({
                code: 1000,
                message: '请求成功',
                success: true
            });
        } else {
            res.send({
                code: 3003,
                message: '请求失败',
                success: false
            });
        }
    }catch(err){
        console.log("err:",err)
    }



});

module.exports = router;
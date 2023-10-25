var express = require('express');
var router = express.Router();
const {Comment} = require('../API/Model/Comment');
const {Issue} = require("../API/Model/Issue");
const {User} = require("../API/Model/User");
const {Action} = require('../API/Model/Action');
const lodash = require('lodash');
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
router.post('/getComment', async (req, res) => {
    try {
        const issueID = req.body.issueID;
        const UID = req.body.UID;
        console.log('接收到获取所有评论的请求', req.body.UID);
        console.log('接收到获取所有评论的请求', req.body.issueID);

        // 通过issueID查找comment集合中的评论
        let result = await Comment.find({ issueID }).lean();

        let comments = lodash.clone(result);

        if (comments) {
            const updatedComments = [];

            for (let comment of comments) {
                const updatedReplys = [];

                // 使用UID和comment的_id来查询Action集合
                const action = await Action.findOne({ UID, targetID: comment._id });

                // 如果找到匹配的对象，并且对象中有isFinish属性
                if (action) {
                    console.log("用户点赞过:",action)
                    comment.isFinish = action.isFinish
                } else{
                    // 如果找不到action，说明用户没有点赞此问题
                    // 先创建一个action
                    await Action.create({
                        UID,
                        targetID: comment._id
                    });
                    console.log("用户未点赞过!");
                    // 然后再给这个对象一个false
                    comment.isFinish = false;
                }

                for (const reply of comment.replies) {
                    const replyAction = await Action.findOne({ UID, targetID: reply._id });

                    // 如果找到匹配的对象，并且对象中有isFinish属性
                    if (replyAction) {
                        // 在reply对象中添加isFinish属性
                        reply.isFinish = replyAction.isFinish;
                    } else {
                        // 如果找不到replyAction，说明用户没有点赞此问题
                        // 先创建一个action
                        await Action.create({
                            UID,
                            targetID: reply._id
                        });

                        // 然后再给这个对象一个false
                        reply.isFinish = false;
                    }

                    updatedReplys.push(reply);
                }

                comment.replies = updatedReplys;
                updatedComments.push(comment);

            }
            console.log("评论列表已经修改:",updatedComments[0])//此处能输出isFinish，
            console.log("开始回应");
            res.send({
                code: 1000,
                data: updatedComments,
                message: '请求成功',
                success: true
            });
        }
    } catch (err) {
        console.log('err:', err);
        res.send({
            code: 2000,
            message: '请求失败',
            success: false
        });
    }
});
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

        const UID = req.body.UID;
        console.log("接收到一级评论点赞请求:",req.body.id);
        //开始查询是否有此评论
        const commentID = req.body.id;
        const action = await Action.findOne({UID:UID,targetID:commentID});
        if(action.isFinish){
            res.send({
                code:3003,
                message:"不可重复点赞",
                success:false
            })
        }else{
        const result = await Comment.findOneAndUpdate(
            {_id:commentID},
            { $inc: { likes: +1 } }
        )

            if(result){
                await Action.findOneAndUpdate({UID:UID,targetID:commentID},{isFinish:true})
                res.send({
                    code:1000,
                    message:"请求成功",
                    success:true
                })
            }else{
                res.send({
                    code:3003,
                    message:"评论不存在",
                    success:false
                })
            }
        }
    }catch(err){
        console.log("err:",err)
    }
})
//取消一级评论点赞
router.post('/cancelOneLevelVote',async (req,res)=>{
    try {
        const UID = req.body.UID;
        console.log("接收到一级评论取消点赞请求:",req.body.id);
        //开始查询是否有此评论
        const commentID = req.body.id

        const action = await Action.findOne({UID:UID,targetID:commentID});
        if(action.isFinish==false){
            res.send({
                code:3003,
                message:"不可重复取消点赞",
                success:false
            })
        }else {

            const result = await Comment.findOneAndUpdate(
                {_id: commentID},
                {$inc: {likes: -1}}
            )
            if (result) {
                const action = await Action.findOne({UID: UID, targetID: commentID});
                if (action) {
                    await Action.findOneAndUpdate({UID: UID, targetID: commentID}, {isFinish: false})
                } else {
                    const action = await Action.create({UID: UID, targetID: commentID});
                    action.isFinish = true;
                    await action.save();
                }
                res.send({
                    code: 1000,
                    message: "请求成功",
                    success: true
                })
            } else {
                res.send({
                    code: 3003,
                    message: "评论不存在",
                    success: false
                })
            }
        }
    }catch(err){
        console.log("err:",err)
    }

})
//二级评论点赞
router.post('/voteTwoLevelComment', async (req, res) => {
    try {
        const UID = req.body.UID;
        const comment = await Comment.findOne({_id: req.body.item._id});
        const index = req.body.index;
        console.log("comment",comment);
        console.log("index",index);

        const action = await Action.findOne({UID:UID,targetID:comment.replies[index]._id});

        if(action.isFinish==true){
            res.send({
                code:3003,
                message:"不可重复点赞",
                success:false
            })
        }
        if(action.isFinish==false){
            if (comment) {
                // 找到需要点赞的二级评论的索引
                // 使用 $inc 操作符将 likes 属性加1
                comment.replies[index].likes += 1;
                // 保存更新后的评论对象
                await comment.save();
                await Action.findOneAndUpdate({UID:UID,targetID:comment.replies[index]._id},{isFinish:true})
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
        }else{
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
//取消二级评论点赞
router.post('/cancelvoteTwoLevelComment', async (req, res) => {
    try {
        const UID = req.body.UID;
        const comment = await Comment.findOne({_id: req.body.item._id});
        const index = req.body.index;
        const action = await Action.findOne({UID:UID,targetID:comment.replies[index]._id});

        if(action.isFinish==false){
            res.send({
                code:3003,
                message:"不可重复取消点赞",
                success:false
            })
        }
        if(action.isFinish==true){
            if (comment) {
                // 找到需要点赞的二级评论的索引
                // 使用 $inc 操作符将 likes 属性加1
                comment.replies[index].likes -= 1;
                // 保存更新后的评论对象
                await comment.save();
                await Action.findOneAndUpdate({UID:UID,targetID:comment.replies[index]._id},{isFinish:false})
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
        }else{
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
var express = require('express');
var router = express.Router();
const {Doc} = require('../API/Model/Doc');
const {Issue} = require("../API/Model/Issue");
const {Favorite} = require("../API/Model/Favorite");
//新增文档
router.post('/createDoc',async (req,res)=>{
    try {

        console.log("接收到增加文档请求",req.body);
        const data = req.body;
        const result = await Doc.create({
            title:data.title,
            introduction:data.introduction,
            content:data.content,
            author:data.author,
            UID:data.UID,
            tags: data.tags.map(tag => ({ tagName: tag }))
        })
        if(result){
            res.send({
                code:1000,
                message:"请求成功",
                success:true,
                data:result
            })
        }else{
            res.send({
                code:3003,
                message:"请求失败",
                success:false,
            })
        }
    }catch(err){
        console.log("err:",err)
    }


});
//获取用户文档
router.post('/getUserDoc',async (req,res)=>{
    try {
        const docs = await Doc.find({UID:req.body.UID});
        if(docs){
            res.send({
                code:1000,
                success:true,
                message:"请求成功",
                data:docs
            })
        }else{
            res.send({
                code:3003,
                message:"请求失败",
                success:false,
            })
        }
    }catch(err){
        console.log("err:",err)
    }



});
//删除文档
router.post('/deleteDoc',async (req,res)=>{
    try {

        //id为文档id
        const UID = req.body.UID;
        const _id  = req.body._id;
        console.log(UID,_id);
        //开始鉴权
        const doc = await  Doc.findOne({_id:_id});
        if(doc){
            console.log("查询到该文档,开始身份鉴权");
            if(UID==doc.UID){
                console.log("用户身份正确,开始执行删除");
                const result = await Doc.findOneAndDelete({_id:_id},{new:true});
                if(result){
                    const docs = await Doc.find({UID:UID});
                    res.send({
                        code:1000,
                        message:"请求成功",
                        success:true,
                        data:docs
                    })
                }else{
                    res.send({
                        code:3003,
                        message:"请求失败",
                        success:false,
                    })
                }
            }else{
                res.send({
                    code:3003,
                    message:"用户身份不匹配",
                    success:false,
                })
            }
        }else{
            res.send({
                code:3003,
                message:"未查找到该文档",
                success:false,
            })
        }
    }catch(err){
        console.log("err:",err)
    }



});
//查找某一个文档
router.post('/findOne',async  (req,res)=>{
    try{
    //分为模糊查找和具体查找
    //用id为具体查找，关键字为模糊查找
    if(req.body._id && !req.body.keywords){
        console.log("req.body._id:",req.body._id,"req.body.keywords:",req.body.keywords)
        const _id = req.body._id;
        const result = await  Doc.findOne({_id:_id});
        if(result){
            res.send({
                code:1000,
                message:"请求成功",
                success:true,
                data:result
            })
        }else{
            res.send({
                code:3003,
                message:"请求失败",
                success:false,
            })
        }
    }else if(req.body.keywords){
        console.log("开始模糊查找,关键字:",req.body.keywords);
        const UID = req.body.UID;
        const keywords = req.body.keywords;
        const result = await Doc.find({
            UID:UID,
            $or: [
                {title: {$regex: keywords, $options: 'i'}}, // 匹配标题字段
                {content: {$regex: keywords, $options: 'i'}}, // 匹配内容字段
            ]
        })
        if(result){
            res.send({
                code:1000,
                message:"请求成功",
                success:true,
                data:result
            })
        }else{
            res.send({
                code:3003,
                message:"请求失败",
                success:false,
            })
        }
    }
    else{
        res.send({
            code:3003,
            message:"请求条件有误！",
            success:false,
        })
    }
    }catch (err){
        console.log("err:",err);
    }
});
//修改文档
router.post('/updateDoc',async (req,res)=>{
    try {

        console.log("接收到修改文档请求",req.body);
        const UID = req.body.UID;
        const _id = req.body._id;
        const newDocForm = req.body.newDocForm;
        //先查询有无此文档
        const doc = await Doc.findOne({_id:_id});

        if(doc){
            console.log("找到该文档:",doc)
            //开始鉴权
            if(UID==doc.UID){
                console.log("开始修改文档")
                //开始修改文档
                const data = newDocForm;
                const result = await Doc.findOneAndUpdate(
                    {_id:_id},
                    {
                        title:data.title,
                        introduction:data.introduction,
                        content:data.content,
                        author:data.author,
                        UID:data.UID,
                        tags: data.tags.map(tag => ({ tagName: tag }))
                    },
                    {new:true}
                );
                if(result){
                    res.send({
                        code:1000,
                        message:"请求成功",
                        success:true,
                        data:result
                    })
                }else{
                    res.send({
                        code:3003,
                        message:"请求失败",
                        success:false,
                    })
                }

            }else{
                console.log("用户无权修改")
                res.send({
                    code:3003,
                    message:"修改文档出错，请重试",
                    success:false,
                })
            }
        }else{
            res.send({
                code:3003,
                message:"未找到该文档",
                success:false,
            })
        }
    }catch(err){
        console.log("err:",err)
    }

});
//获取所有文档
router.get('/getAll',async (req,res)=>{
    try {
        const result = await Doc.find();
        if(result){
            res.status(200).send({
                code:1000,
                success:true,
                message:"请求成功",
                data:result
            })
        }else{
            res.status(404).send({
                code:3003,
                message:"请求失败",
                success:false,
            })
        }
    }catch(err){
        console.log("err:",err)
    }



});
//点赞
router.post('/vote',async (req,res)=>{
    try {
        const doc = await Doc.findOne({_id:req.body._id});
        if(doc){
            console.log('找到doc:',doc);
            doc.likes = doc.likes+1;
            console.log('likes:', doc.likes );
            const result = await doc.save();
            res.status(200).send({
                code:1000,
                message:"请求成功",
                success:true
            })
        }else{
            console.log("未找到此问题:",issue);
            res.status(404).send({
                code:3003,
                message:"此问题已经注销",
                success:false
            })
        }
    }catch (err){
        console.log(err);
    }


})
//收藏文档
router.post('/collecte',async  (req,res)=>{
    try {
        const DocID = req.body.DocID;
        const FavoriteID = req.body.FavoriteID;
        const UID = req.body.UID;
        //开始判断有无此收藏夹以及有无此文档
        const doc = await Doc.findOne({_id:DocID});
        const favorite = await Favorite.findOne({_id:FavoriteID});
        if( doc && favorite){
            try {
                //开始查询此收藏夹内有无此文档
                const isDocIDInFavorite =favorite.docs.some(doc => doc.DocID == DocID);
                if(isDocIDInFavorite){
                    res.status(200 ).send({
                        code:3003,
                        success:false,
                        message:"不可重复收藏同一篇文档",
                    })
                }else{
                    //开始鉴权
                    if(UID == favorite.UID){
                        // 使用 findOneAndUpdate 方法找到用户的收藏文档并添加新的文档
                        const favorite = await Favorite.findOneAndUpdate(
                            { _id: FavoriteID },
                            { $push: { docs: { title: doc.title,introduction:doc.introduction,DocID:doc._id } } },
                            { new: true }
                        );
                        if(favorite){
                            doc.collects = doc.collects+1;
                            await doc.save();
                            res.status(200).send({
                                code:1000,
                                success:true,
                                message:"收藏成功",
                                data:favorite
                            })
                        }else{
                            res.status(400).send({
                                code:3003,
                                success:false,
                                message:"收藏失败",
                            })
                        }
                    }else{
                        res.status(400).send({
                            code:3003,
                            success:false,
                            message:"用户无权限",
                        })
                    }

                }
            } catch (error) {
                // 处理收藏过程中的错误
                throw new Error('收藏文档失败');
            }
        }else{
            res.status(400).send({
                code:3003,
                message:"文档不存在或收藏夹不存在",
                success:false,
            })
        }
    }catch(err){
        console.log("err:",err)
    }
})

module.exports=router;
const express = require('express');
const router = express.Router();
const {Favorite} = require('../API/Model/Favorite');
const {Doc} = require("../API/Model/Doc");

//获取用户的所有收藏夹信息
router.post('/getFavorite',async (req,res)=>{
    console.log("收到获得收藏夹请求：",req.body.UID);
    try{
        const UID = req.body.UID;
        if(UID){
        const result = await Favorite.find({UID:UID});
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
//新增加收藏夹
router.post('/createFavorite',async (req,res)=>{
        try {
            const {name,introduction,author,UID} = req.body;
            const result = await Favorite.create({
                name:name,
                introduction:introduction,
                author:author,
                UID:UID
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
})
//获取具体收藏夹内的文档
router.post('/findOne',async (req,res)=>{
    try {
        const _id = req.body._id;
        const result = await Favorite.findOne({_id:_id});
        console.log("result:",result);
        if(result){
            res.send({
                code:1000,
                message:"请求成功",
                success:true,
                data:result.docs
            })
        }else{
            res.send({
                code:3003,
                message:"请求失败",
                success:false,
            })
        }

    }catch (err){

    }
});
router.post('/delete',async (req,res)=>{
    //id为文档id
    const UID = req.body.UID;
    const _id  = req.body._id;
    console.log(UID,_id);
    //开始鉴权
    const favorite = await  Favorite.findOne({_id:_id});
    if(favorite){
        console.log("查询到该文档,开始身份鉴权");
        if(UID==favorite.UID){
            console.log("用户身份正确,开始执行删除");
            const result = await Favorite.findOneAndDelete({_id:_id},{new:true});
            if(result){
                const favorites = await Favorite.find({UID:UID});
                res.send({
                    code:1000,
                    message:"请求成功",
                    success:true,
                    data:favorites
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
            message:"未查找到该收藏夹",
            success:false,
        })
    }
})
//收藏文档
router.post('/collecte',async  (req,res)=>{
    const DocID = req.body.DocID;
    const FavoriteID = req.body.FavoriteID;
    //开始判断有无此收藏夹以及有无此文档
    const doc = await Doc.findOne({_id:DocID});
    const favorite = await Favorite.findOne({_id:FavoriteID});
    if( doc && favorite){
    try {
            // 使用 findOneAndUpdate 方法找到用户的收藏文档并添加新的文档
            const favorite = await Favorite.findOneAndUpdate(
                { _id: FavoriteID },
                { $push: { docs: { title: doc.title,introduction:doc.introduction,DocID:doc._id } } },
                { new: true }
            );

            return favorite;
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
})
module.exports = router;
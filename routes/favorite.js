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
//删除文档
router.post('/delete',async (req,res)=>{
    try {
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
    }catch(err){
        console.log("err:",err)
    }



})
//判断该用户是否已经收藏了此文档
router.post('/isCollecte',async  (req,res)=>{
    try {


        const UID = req.body.UID;
        const DocID = req.body.DocID;
        try {
            const result = await Favorite.find({ UID: UID, "docs.DocID": DocID });

            if (result.length > 0) {
                console.log('给定的 DocID 在收藏夹中。');
                res.send({
                    code:1000,
                    message:"请求成功",
                    data:true,
                    success:true,
                })
            } else {
                console.log('给定的 DocID 不在收藏夹中。');
                res.send({
                    code:3003,
                    message:"请求成功",
                    data:false,
                    success:true,
                })
            }
        } catch (error) {
            console.error('查询过程中出现错误：', error);
        }
    }catch(err){
        console.log("err:",err)
    }


})
//移除收藏的文档
router.post('/remove',async  (req,res)=>{
    const DocID = req.body.DocID;
    const UID = req.body.UID;
    try {
        const result = await Favorite.findOne({ UID: UID, "docs.DocID": DocID });
        if(result) {
            result.docs = result.docs.filter(doc => doc.DocID.toString() !== DocID);
            const doc = await Doc.findOne({_id:DocID});
            doc.collects = doc.collects-1;
            await  doc.save();
            await result.save();
            //已找到需要移除的文档，开始移除文档
            res.send({
                code: 1000,
                message: "请求成功",
                success: true,
            })
        }
        else {
            res.send({
                code:3003,
                message:"请求失败",
                success:false,
            })
        }

    }catch (err){
        console.log("在移除时遇到错误：",err);
    }
})
module.exports = router;
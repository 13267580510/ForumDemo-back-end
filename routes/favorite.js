const express = require('express');
const router = express.Router();
const {Favorite} = require('../API/Model/Favorite');

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
module.exports = router;
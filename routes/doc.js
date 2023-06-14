var express = require('express');
var router = express.Router();
const {Doc} = require('../API/Model/Doc');

router.post('/createDoc',async (req,res)=>{
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
});
router.post('/getUserDoc',async (req,res)=>{
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
});
module.exports=router;
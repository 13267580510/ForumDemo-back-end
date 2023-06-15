var express = require('express');
var router = express.Router();
const {Doc} = require('../API/Model/Doc');
//新增文档
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
//获取用户文档
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
//删除文档
router.post('/deleteDoc',async (req,res)=>{
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
});
//查找某一个文档
router.post('/findOne',async  (req,res)=>{
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
});
//修改文档
router.post('/updateDoc',async (req,res)=>{
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
});
module.exports=router;
var express = require('express');
var router = express.Router();
const {DocCategory} = require('../API/Model/DocCategory');

//创建文档种类
router.post('/createDCategory',async (req,res)=>{
    try {
        console.log("接收到请求创建文档种类请求：",req.body);
        const arr = ["前端","后端","软件开发","网络与系统管理","数据库管理","人工智能与机器学习","嵌入式系统","信息安全与网络安全","云计算与大数据"]
        for(let i =0;i<arr.length;i++){
            await DocCategory.create({
                name:arr[i]
            })
        }
    }catch(err){
        console.log("err:",err)
    }
})
//获取种类列表
router.get('/getDCategory',async (req,res)=>{
    try {
        const docCategory = await  DocCategory.find();
        if(docCategory){
            res.send({
                code:1000,
                message:"请求成功",
                success:true,
                data:docCategory
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


module.exports = router;
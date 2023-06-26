var express = require('express');
var router = express.Router();
const { Category } =require('../API/Model/IssueCategorys');

router.get('/getCategorys',async (req,res)=>{
    try {
        const category = await  Category.find();
        if(category){
            res.send({
                code:1000,
                data:category,
                message:"请求成功",
                success:true
            })
        }else{
            res.send({
                code:3003,
                data:null,
                message:"请求失败",
                success:false
            })
        }
    }catch(err){
        console.log("err:",err)
    }
});


module.exports = router;
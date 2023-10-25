var express = require('express');
var router = express.Router();
const {Action} = require('../API/Model/Action');
//判断是否点赞
router.post('/ifAction',async (req,res)=>{
    const UID = req.body.UID;
    const targetID = req.body.targetID;
    try{
        console.log("UID:",UID);
        console.log("targetID:",targetID);

        const result = await Action.findOne({
            UID:UID,
            targetID:targetID
        })

        if(result){
            res.send({
                code:1000,
                message:"请求成功",
                success:true,
                data:result.isFinish
            })
        }else{
            await Action.create({
                UID:UID,
                targetID:targetID
            })

            res.send({
                code:1000,
                message:"请求成功",
                data:false,
                success:success,
            })
        }
    }catch (err){
        console.log("err:",err);
    }
});

module.exports=router;
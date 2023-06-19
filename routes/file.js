var express = require('express');
var router = express.Router();
const {File} = require('../API/Model/File');
const fileController = require('../controllers/fileController')

router.post('/upload', fileController.upload);
router.post('/download',fileController.download);
router.get('/findAll',async (req,res)=>{
    const file = await File.find();
    if(file){
        res.send({
            code:1000,
            success:true,
            message:"请求成功",
            data:file
        })
    }else{
        res.send({
            code:3003,
            success:false,
            message:"请求失败",
        })
    }
})
module.exports = router;
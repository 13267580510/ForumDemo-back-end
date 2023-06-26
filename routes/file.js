var express = require('express');
var router = express.Router();
const {File} = require('../API/Model/File');
// const fileController = require('../controllers/fileController')
import {uploadChunk,mergeChunk,download,isFileExist,uploadAlready} from '../controllers/fileController'
router.post('/uploadChunk',async (req, res) => {
    try {
        await uploadChunk(req, res)
    }
    catch (err) {
        console.log(err);
        res.send({
            code: 1,
            success: false,
            data: {
                err: err.message,
            },
            message: 'Oops!!',
        })
    }
} );
router.post('/download',download);
router.post('/mergeChunk',async (req, res) => {
    try {
        await mergeChunk(req, res)
    }
    catch (err) {
        res.send({
            code: 1,
            success: false,
            data: {
                err: err.message,
            },
            message: 'Oops!!',
        })
    }
});
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

router.get('/isFileExist', async (req, res) => {
    try {
        await isFileExist(req, res)
    }
    catch (err) {
        res.send({
            code: 1,
            success: false,
            data: {
                err: err.message,
            },
            message: 'Oops!!',
        })
    }
})
router.get('/uploadAlready', async (req, res) => {
    try {
        await uploadAlready(req, res)
    }
    catch (err) {
        console.log("err:",err)
        res.send({
            code: 1,
            success: false,
            data: {
                err: err.message,
            },
            message: 'Oops!!',
        })
    }
})
module.exports = router;
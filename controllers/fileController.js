/*  controllers/fileController.js */
const iconv = require('iconv-lite');
const {File} = require('../API/Model/File');
const upload =async (req, res) => {
   try{
    let fileObj = null;
    let filePath = '';

    if(!req.files || Object.keys(req.files).length === 0) {
        res.status(400).send({
            code: 1,
            msg: 'Bad Request.'
        })
        return;
    }

    /* file 是上传时候body中的一个字段，有可以随意更改*/
    console.log(req.files, req.files.file)
    fileObj = req.files.file;

    const fileName = iconv.decode(Buffer.from(fileObj.name, 'binary'), 'utf-8');

    filePath = './upload/' +  fileName ;

    console.log("filePath:",filePath)

     const file =   await File.findOne({fileName:fileName})
    if(!file){
        fileObj.mv(filePath, async (err) => {
        if(err) {
            return res.status(500).send({
                code: 1,
                msg: 'System error'
            })
        }

        const result = await File.create({
            fileName:fileName,
            filePath:filePath
        })
        if(result){
            res.send({
                code:1000,
                message:"上传文件成功",
                success:true
            });
        }
    })
    }else{
        res.send({
            code:1000,
            message:"已存在相同的文件，如果需要升级文件请联系管理员",
            success:false
        });
    }
   }catch (err){
       console.log(err);
   }

}

const download = (req, res) => {
    const file = {
        name: '无标题.png',
        path: './upload/无标题.png'
    }
    let exist = fs.existsSync(path.resolve(file.path))
    if(exist) {
        res.download(file.path)
    } else {
        res.send({
            code: 1,
            msg: 'File Not Exits'
        })
    }
}
module.exports = {
    upload,
    download
}
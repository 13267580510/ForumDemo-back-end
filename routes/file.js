const express = require("express");
const path = require("path");
const fs = require("fs");
const router = express.Router();

const UPLOAD_DIR = path.resolve(__dirname, '../upload');

const multiparty = require('multiparty');
let PORT = 3000,
    HOST = 'http://localhost',
    HOSTNAME = `${HOST}:${PORT}`
// 获取已经上传完的切片
router.get('/get_uploaded_chunks', async (req, resp) => {
    try {
        // 获取参数md5、后缀suffix
        const { md5, suffix } = req.query
        // 文件的文件夹
        console.log("UPLOAD_DIR:",UPLOAD_DIR);
        const foldPath = `${UPLOAD_DIR}/${md5}`
        console.log("foldPath:",foldPath);
        // 文件夹里面的文件
        const filePath = `${foldPath}.${suffix}`
        // 文件名
        const fileName = `${md5}.${suffix}`
        let fileList = []
        const isFileExist =  fs.existsSync(filePath)
        // 已经上传过了
        if (isFileExist) {
            resp.send({
                code: 200,
                msg: 'uploaded',
                fileList,
                filePath: `${HOSTNAME}/${fileName}`,
                success:true
            })
            return
        }

        // 文件夹存在，代表有些块在里面，有些块还没上传完
        const isFoldExist = await fs.existsSync(foldPath)
        if (isFoldExist) {
            // 同步读取目录内容
            fileList = fs.readdirSync(foldPath)

            // 排序
            fileList = fileList.sort((a, b) => {
                let reg = /_(\d+)/

                return reg.exec(a)[1] - reg.exec(b)[1]
            })
            // 把已经传过的块返回给前端，下次就不要重复传了
            resp.send({
                code: 200,
                msg: 'success',
                fileList:fileList,
                success:true
            })
            return
        }

        // 如果既没有存在过文件，之前也没传过什么块，就返回200，fileList为空
        resp.send({
            code: 200,
            msg: 'success',
            fileList,
            success:true
        })

    } catch (err) {
        console.log('获取已经上传的切片报错：', err)
        // 错误返回400
        resp.send({
            code: 400,
            msg: 'fail',
            success:true
        })
    }
})



// 解析formData数据
const multipartyFormData = (req) => {

    return new Promise(async (resolve, reject) => {
        new multiparty.Form().parse(req, (err, fields, files) => {
            if (err) {
                reject(err)
                return
            }

            resolve({
                fields,
                files
            })
        })
    })
}

// 写文件
const writeFile = (resp, path, file) => {
    try {
        const buffer = fs.readFileSync(file.path)
        fs.writeFile(path, buffer, function (err) {
            resp.send({
                code: 200,
                msg: 'success',
                success:true
            })
        })
    } catch (err) {
        console.log('文件块写入失败：', err)
    }
}

// 上传切片
router.post('/upload_chunk', async(req, resp) => {
    try {
        let { fields, files } = await multipartyFormData(req)

        let file = (files.file && files.file[0]) || {},
            fileName = (fields.fileName && fields.fileName[0]) || '',
            path = '',
            isExists = false

        let md5 = /^([^_]+)_(\d+)/.exec(fileName)[1]

        path = `${UPLOAD_DIR}/${md5}`

        // 没有该文件的文件夹就新建一个文件夹放这个文件块
        !fs.existsSync(path) ? fs.mkdirSync(path) : null

        path = `${UPLOAD_DIR}/${md5}/${fileName}`

        // 如果已经存在这个文件就不用进行下面写文件的操作了
        isExists = await fs.existsSync(path)

        if (isExists) {
            resp.send({
                code: 200,
                msg: 'success',
                success:true
            })
            return
        }

        // 给每个块写进去这个文件夹中
        writeFile(resp, path, file)

    } catch(err) {
        console.log('上传切片报错：', err)

        resp.send({
            code: 400,
            msg: 'fail',
            success:false
        })
    }
})


// 合并切片的具体实现方法
const mergeChunks = (md5) => {
    return new Promise(async (resolve, reject) => {
        let path = `${UPLOAD_DIR}/${md5}`,
            fileList = [],
            suffix,
            isExists;

        // 切片是否存在
        isExists = await fs.existsSync(path)

        if (!isExists) {
            reject('md5 path is not found')
            return
        }

        // 读取文件夹，返回该文件夹下所有文件名数组
        fileList = fs.readdirSync(path)

        // 文件名后面_序号进行排序
        const newFileList = fileList.sort((a, b) => {
            let reg = /_(\d+)/
            return reg.exec(a)[1] - reg.exec(b)[1]
        })

        newFileList.forEach(item => {
            !suffix ? suffix = /\.([0-9a-zA-Z]+)$/.exec(item)[1] : null

            // 向 upload/md5 文件追加该文件内容
            fs.appendFileSync(`${UPLOAD_DIR}/${md5}.${suffix}`, fs.readFileSync(`${path}/${item}`))

            // 追加完后删掉该文件内容
            fs.unlinkSync(`${path}/${item}`)
        })

        // 全部完成后删除该md5文件夹
        fs.rmdirSync(path)

        resolve({
            path: `${UPLOAD_DIR}/${md5}.${suffix}`,
            fileName: `${md5}.${suffix}`
        })
    })
}

// 合并切片的接口
router.get('/merge_chunks', async (req, resp) => {
    let { md5 } = req.query

    try {
        let { fileName, path } = await mergeChunks(md5)
        console.log("切片合并成功");
        console.log("${HOSTNAME}/${fileName}:",`${HOSTNAME}/${fileName}`);
        resp.send({
            code: 200,
            msg: 'success',
            filePath: `${HOSTNAME}/${fileName}`,
            success:true
        })
    } catch (err) {
        console.log('切片合并失败:', err)
        resp.send({
            code: 400,
            msg: 'fail',
            success:false
        })
    }
})


//文件下载
router.get("/down/:name", (req, res) => {
    try {
        const filename = req.params.name;
        const filePath = path.resolve(UPLOAD_DIR, filename);

        // 检查文件是否存在
        if (!fs.existsSync(filePath)) {
            res.status(404).send("File not found");
            return;
        }

        // 设置响应头，告诉浏览器以附件形式下载
        res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
        res.setHeader("Content-Type", "application/octet-stream");

        // 创建可读流，将文件内容传输到响应对象
        const fileStream = fs.createReadStream(filePath);

        fileStream.on("error", (error) => {
            res.status(500).send("Internal Server Error");
        });

        // 将文件流通过管道传输到响应对象，实现文件下载
        fileStream.pipe(res);
    } catch (err) {
        console.error("文件下载失败:", err);
        res.status(500).send("Internal Server Error");
    }
});
module.exports = router;
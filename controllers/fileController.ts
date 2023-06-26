
const fs = require('fs')
const path = require('path')
import type { Request, Response } from 'express'

import { HOST_NAME, UPLOAD_DIR } from './constant'
import { extractExt, isExists, path2url, useMultiParty, writeFile } from './utils'



export function uploadAlready(req: Request, res: Response) {
    const { HASH } = req.query

    const pt = path.normalize(`${UPLOAD_DIR}/${HASH}`)
    let fileList: string[] = []

    try {
        if (fs.existsSync(pt)) {
            fileList = fs.readdirSync(pt)

            // 因为前端对于切片命名是 `${hash}_{index + 1}${suffix}`
            fileList = fileList.sort((a, b) => {
                const reg = /_(\d+)\./
                return Number(reg.exec(a)![1]) - Number(reg.exec(b)![1])
            })
        }

        res.send({
            code: 0,
            success: true,
            data: {
                fileList,
            },
            message: 'get successfully',
        })
    }
    catch (err) {
        throw new Error(err)
    }
}

export async function isFileExist(req: Request, res: Response) {
    const { HASH, suffix } = req.query

    const filePt = path.normalize(`${UPLOAD_DIR}/${HASH}${suffix}`)

    if (await isExists(filePt)) {
        res.send({
            code: 0,
            success: true,
            data: {
                url: `${HOST_NAME}/${HASH}${suffix}`,
            },
            message: 'get successfully',
        })

        return
    }

    res.send({
        code: 0,
        success: true,
        data: {
            url: '',
        },
        message: 'get successfully',
    })
}


export async function uploadChunk(req: Request, res: Response) {
    try {
        const { fields, files } = await useMultiParty(req)
        console.log("fields:",fields);
        const file = (files.file && files.file[0]) || {}
        const filename = (fields.filename && fields.filename[0]) || ''

        const HASH = /^([^_]+)_(\d+)/.exec(filename)![1]

        let pt = `${UPLOAD_DIR}/${HASH}`

        if (!fs.existsSync(pt))
            fs.mkdirSync(pt)

        pt = `${UPLOAD_DIR}/${HASH}/${filename}`

        if (await isExists(pt)) {
            res.send({
                code: 0,
                success: true,
                data: {
                    url: pt.replace(UPLOAD_DIR, HOST_NAME),
                },
                message: 'get successfully',
            })
            return
        }

        await writeFile(pt, file, true)

        res.send({
            code: 0,
            success: true,
            data: {
                url: path2url(pt),
            },
            message: 'upload successfully!!',
        })
    }
    catch (err) {
        throw new Error(err)
    }
}

export async function mergeChunk(req: Request, res: Response) {
    const { HASH, count, suffix } = req.body

    const hashDir = path.normalize(`${UPLOAD_DIR}/${HASH}`)

    if (!(await isExists(hashDir)))
        throw new Error('HASH path is not found!')

    const fileList = fs.readdirSync(hashDir)

    if (fileList.length < count)
        throw new Error('the slice has not been uploaded!')

    fileList.sort((a, b) => {
        const reg = /_(\d+)/
        return Number(reg.exec(a)![1]) - Number(reg.exec(b)![1])
    }).forEach((file) => {
        const suffix = extractExt(file)
        fs.appendFileSync(`${UPLOAD_DIR}/${HASH}${suffix}`, fs.readFileSync(`${hashDir}/${file}`))
        fs.unlinkSync(`${hashDir}/${file}`)
    })

    fs.rmdirSync(hashDir)

    res.send({
        code: 0,
        success: true,
        data: {
            url: `${HOST_NAME}/${HASH}${suffix}`,
        },
        message: 'upload successfully!!',
    })
}

export  async  function download (){
    console.log("开始下载")
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = exports.path2url = exports.writeFile = exports.extractExt = exports.isExists = exports.useMultiParty = void 0;
var path = require('path');
var fs = require('fs');
var multiparty_1 = require("multiparty");
var constant_1 = require("./constant");
function useMultiParty(req, auto) {
    console.log("HOST_NAME:", constant_1.HOST_NAME);
    console.log("MAX_SIZE:", constant_1.MAX_SIZE);
    console.log("UPLOAD_DIR:", constant_1.UPLOAD_DIR);
    var config = {
        maxFieldsSize: constant_1.MAX_SIZE,
    };
    if (auto)
        config.uploadDir = constant_1.UPLOAD_DIR;
    return new Promise(function (resolve, reject) {
        new multiparty_1.default.Form(config).parse(req, function (err, fields, files) {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                fields: fields,
                files: files,
            });
        });
    });
}
exports.useMultiParty = useMultiParty;
function isExists(p) {
    p = path.normalize(p);
    return new Promise(function (resolve) {
        fs.access(p, fs.constants.F_OK, function (err) {
            err ? resolve(false) : resolve(true);
        });
    });
}
exports.isExists = isExists;
function extractExt(filename) {
    return filename.slice(filename.lastIndexOf('.'), filename.length);
}
exports.extractExt = extractExt;
function writeFile(path, file, stream) {
    return new Promise(function (resolve, reject) {
        if (stream) {
            var reader = fs.createReadStream(file.path);
            var writer = fs.createWriteStream(path);
            reader.on('end', function () {
                // NOTE: 删除 multiparty 生成的临时文件
                fs.unlinkSync(file.path);
                resolve();
            });
            reader.pipe(writer);
            return;
        }
        fs.writeFile(path, file, function (err) {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}
exports.writeFile = writeFile;
function path2url(p) {
    var pt = path.normalize(p);
    var uploadDir = path.normalize(constant_1.UPLOAD_DIR);
    var index = uploadDir.length + 1;
    return "".concat(constant_1.HOST_NAME, "/").concat(pt.substring(index));
}
exports.path2url = path2url;
function delay(time) {
    if (time === void 0) { time = 1000; }
    return new Promise(function (resolve) {
        var timer = setTimeout(function () {
            clearTimeout(timer);
            timer = null;
            resolve();
        }, time);
    });
}
exports.delay = delay;

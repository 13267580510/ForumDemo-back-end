"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.download = exports.mergeChunk = exports.uploadChunk = exports.isFileExist = exports.uploadAlready = void 0;
var fs = require('fs');
var path = require('path');
var constant_1 = require("./constant");
var utils_1 = require("./utils");
function uploadAlready(req, res) {
    var HASH = req.query.HASH;
    var pt = path.normalize("".concat(constant_1.UPLOAD_DIR, "/").concat(HASH));
    var fileList = [];
    try {
        if (fs.existsSync(pt)) {
            fileList = fs.readdirSync(pt);
            // 因为前端对于切片命名是 `${hash}_{index + 1}${suffix}`
            fileList = fileList.sort(function (a, b) {
                var reg = /_(\d+)\./;
                return Number(reg.exec(a)[1]) - Number(reg.exec(b)[1]);
            });
        }
        res.send({
            code: 0,
            success: true,
            data: {
                fileList: fileList,
            },
            message: 'get successfully',
        });
    }
    catch (err) {
        throw new Error(err);
    }
}
exports.uploadAlready = uploadAlready;
function isFileExist(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, HASH, suffix, filePt;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.query, HASH = _a.HASH, suffix = _a.suffix;
                    filePt = path.normalize("".concat(constant_1.UPLOAD_DIR, "/").concat(HASH).concat(suffix));
                    return [4 /*yield*/, (0, utils_1.isExists)(filePt)];
                case 1:
                    if (_b.sent()) {
                        res.send({
                            code: 0,
                            success: true,
                            data: {
                                url: "".concat(constant_1.HOST_NAME, "/").concat(HASH).concat(suffix),
                            },
                            message: 'get successfully',
                        });
                        return [2 /*return*/];
                    }
                    res.send({
                        code: 0,
                        success: true,
                        data: {
                            url: '',
                        },
                        message: 'get successfully',
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.isFileExist = isFileExist;
function uploadChunk(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, fields, files, file, filename, HASH, pt, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, (0, utils_1.useMultiParty)(req)];
                case 1:
                    _a = _b.sent(), fields = _a.fields, files = _a.files;
                    console.log("fields:", fields);
                    file = (files.file && files.file[0]) || {};
                    filename = (fields.filename && fields.filename[0]) || '';
                    HASH = /^([^_]+)_(\d+)/.exec(filename)[1];
                    pt = "".concat(constant_1.UPLOAD_DIR, "/").concat(HASH);
                    if (!fs.existsSync(pt))
                        fs.mkdirSync(pt);
                    pt = "".concat(constant_1.UPLOAD_DIR, "/").concat(HASH, "/").concat(filename);
                    return [4 /*yield*/, (0, utils_1.isExists)(pt)];
                case 2:
                    if (_b.sent()) {
                        res.send({
                            code: 0,
                            success: true,
                            data: {
                                url: pt.replace(constant_1.UPLOAD_DIR, constant_1.HOST_NAME),
                            },
                            message: 'get successfully',
                        });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, (0, utils_1.writeFile)(pt, file, true)];
                case 3:
                    _b.sent();
                    res.send({
                        code: 0,
                        success: true,
                        data: {
                            url: (0, utils_1.path2url)(pt),
                        },
                        message: 'upload successfully!!',
                    });
                    return [3 /*break*/, 5];
                case 4:
                    err_1 = _b.sent();
                    throw new Error(err_1);
                case 5: return [2 /*return*/];
            }
        });
    });
}
exports.uploadChunk = uploadChunk;
function mergeChunk(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var _a, HASH, count, suffix, hashDir, fileList;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _a = req.body, HASH = _a.HASH, count = _a.count, suffix = _a.suffix;
                    hashDir = path.normalize("".concat(constant_1.UPLOAD_DIR, "/").concat(HASH));
                    return [4 /*yield*/, (0, utils_1.isExists)(hashDir)];
                case 1:
                    if (!(_b.sent()))
                        throw new Error('HASH path is not found!');
                    fileList = fs.readdirSync(hashDir);
                    if (fileList.length < count)
                        throw new Error('the slice has not been uploaded!');
                    fileList.sort(function (a, b) {
                        var reg = /_(\d+)/;
                        return Number(reg.exec(a)[1]) - Number(reg.exec(b)[1]);
                    }).forEach(function (file) {
                        var suffix = (0, utils_1.extractExt)(file);
                        fs.appendFileSync("".concat(constant_1.UPLOAD_DIR, "/").concat(HASH).concat(suffix), fs.readFileSync("".concat(hashDir, "/").concat(file)));
                        fs.unlinkSync("".concat(hashDir, "/").concat(file));
                    });
                    fs.rmdirSync(hashDir);
                    res.send({
                        code: 0,
                        success: true,
                        data: {
                            url: "".concat(constant_1.HOST_NAME, "/").concat(HASH).concat(suffix),
                        },
                        message: 'upload successfully!!',
                    });
                    return [2 /*return*/];
            }
        });
    });
}
exports.mergeChunk = mergeChunk;
function download() {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            console.log("开始下载");
            return [2 /*return*/];
        });
    });
}
exports.download = download;

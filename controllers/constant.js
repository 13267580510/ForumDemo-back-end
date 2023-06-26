"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_SIZE = exports.HOST_NAME = exports.UPLOAD_DIR = exports.PORT = void 0;
var path = require('path');
exports.PORT = 3000;
exports.UPLOAD_DIR = path.join(__dirname, '..', 'upload');
exports.HOST_NAME = "http://localhost:".concat(exports.PORT);
exports.MAX_SIZE = 200 * 1024 * 1024;

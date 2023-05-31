const mongodb =  require('../Mongoose');
const mongoose = require("../Mongoose");

const IssueSchema = new mongodb.Schema({
        title:{
            type:String,
            required:true
        },
        content:{
            type:String,
            required:true
        },
        category:{
            type:String,
            required:true
        },
        author:{
            type:String,
            required:true
        },
        createTime:{
            type:Date,
            default:Date.now
        },
        updateTime:{
            type:Date,
            default:Date.now
        },
        UID:{
            type:Number,
            ref:'User',
            required:true
        }
});

// 建立问题回答模块数据库模型
const Issue = mongoose.model('Issue', IssueSchema)


module.exports = { Issue }
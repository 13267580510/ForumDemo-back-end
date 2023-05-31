const mongodb =  require('../Mongoose');
const mongoose = require("../Mongoose");

const IssueSchema = new mongodb.Schema({
        //不需要设置id字段，因为MongoDB默认生成一个_id字段
        // id:{
        //   type:String,
        //   unique: true,
        //   required:true,
        //
        // },
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
        }
});

// 建立问题回答模块数据库模型
const Issue = mongoose.model('Issue', IssueSchema)


module.exports = { Issue }
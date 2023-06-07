const mongodb =  require('../Mongoose');
const mongoose = require("../Mongoose");
const moment = require("moment-timezone");

const IssueSchema = new mongodb.Schema({
    //主键采用默认的_id
        title:{
            type:String,
            required:true
        },
        content:{
            type:String,
            required:true
        },
        categoryId:{
            type:String,
            required:true
        },
        author:{
            type:String,
            required:true
        },
        createTime:{
            type:Date,
            default:() => moment().tz('Asia/Shanghai').format()
        },
        updateTime:{
            type:Date,
            default:() => moment().tz('Asia/Shanghai').format()
        },
        contactWay:{
            type:String,
            required:true
        },
        contactNumber:{
            type:String,
            required:true
        },
        UID:{
            type:Number,
            ref:'User',
            required:true
        },
        solved:{
            type:Boolean,
            default:false
        },
        voteCount:{
            type:Number,
            default:0
        },
        commentCount:{
            type:Number,
            default:0
        }

});

// 建立问题回答模块数据库模型
const Issue = mongoose.model('Issue', IssueSchema)


module.exports = { Issue }
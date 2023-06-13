const mongoose = require('../Mongoose')
const moment = require("moment-timezone");
const mongodb = require("../Mongoose");

const DocsSchema = new mongodb.Schema({
    author:{
        type:String,
        required: true
    },
    UID:{
        type:String,
        ref:"User",
        required: true
    },
    contain:[{
        DocID: {
            type:mongoose.Schema.Types.ObjectId,
            required:true
        },
        title:{
            type:String,
            required:true
        },
        Introduction:{
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
        likes:{
            type:Number,
            default:0
        }
    }],
    createTime:{
        type:Date,
        default:() => moment().tz('Asia/Shanghai').format()
    },
    updateTime:{
        type:Date,
        default:() => moment().tz('Asia/Shanghai').format()
    },
})
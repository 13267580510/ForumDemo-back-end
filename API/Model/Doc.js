const mongoose = require('../Mongoose')
const moment = require("moment-timezone");
const mongodb = require("../Mongoose");

const DocSchema = new mongodb.Schema({
    title:{
        type:String,
        required: true
    },
    introduction:{
        type:String,
        required: true
    },
    content:{
        type:String,
        required: true
    },
    sort:{
        type:Number,
        required: true
    },
    author:{
        type:String,
        required: true
    },
    UID:{
        type:String,
        ref:"User",
        required: true
    },
    DocsID:{
        type:mongoose.Schema.Types.ObjectId,
        required: true
    },
    createTime:{
        type:Date,
        default:() => moment().tz('Asia/Shanghai').format()
    },
    updateTime:{
        type:Date,
        default:() => moment().tz('Asia/Shanghai').format()
    },

})

const Doc = mongoose.models('Doc',DocSchema);

module.exports = { Doc }

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
    author:{
        type:String,
        required: true
    },
    UID:{
        type:String,
        ref:"User",
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
    tags:{
        type:[
            {
                tagName:{
                    type:String,
                    default:null
                }
            }
        ]
    },
    likes:{
        type:Number,
        default:0
    },
    collects:{
        type:Number,
        default:0
    }

})
//const DocCategory = mongoose.model('DocCategory',DocCategorySchema);
const Doc = mongoose.model('Doc',DocSchema);

module.exports = { Doc }

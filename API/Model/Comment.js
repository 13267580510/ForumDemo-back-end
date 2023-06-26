const mongodb =  require('../Mongoose');
const mongoose = require("../Mongoose");
const moment = require('moment-timezone');


const CommentSchema = new mongodb.Schema({
    issueID:{
        type:mongodb.Schema.Types.ObjectId,
        ref:'Issue'
    },
    content: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    },
    UID:{
        type:Number,
        required:true,
        ref:'User'
    },
    //评论的回复，子评论
    replies: [
        {
            content: {
                type: String,
                required: true
            },
            author: {
                type: String,
                ref: 'User',
                required: true
            },
            UID:{
                type:Number,
                required:true,
                ref:'User'
            },
            replyTo:{
                type:mongodb.Schema.Types.ObjectId,
                ref:'User',
                default:null
            },
            replyToIndex:{
                type:Number,
                default:null
            },
            likes:{
                type:Number,
                default:0,
                required:true
            },
            dislikes:{
                type:Number,
                default:0,
                required:true
            },
            createTime: {
                type: Date,
                default:() => moment().tz('Asia/Shanghai').format()
            }

        },
    ],
    likes:{
        type:Number,
        default:0,
        required:true
    },
    dislikes:{
        type:Number,
        default:0,
    },
    createTime: {
        type: Date,
        default:() => moment().tz('Asia/Shanghai').format()
        }

})

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {Comment};
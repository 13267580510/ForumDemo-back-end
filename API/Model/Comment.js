const mongodb =  require('../Mongoose');
const mongoose = require("../Mongoose");


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
                type:Number,
                required:true
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
        required:true
    },
    createTime: {
        type: Date,
        default:Date.now()
        }

})

const Comment = mongoose.model('Comment', CommentSchema);

module.exports = {Comment};
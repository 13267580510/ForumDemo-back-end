const mongoose = require('../Mongoose');


const CommentSchema = new mongoose.Schema({
    issueID:{
        type:mongoose.Schema.Types.ObjectId,
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
    //评论的回复，就是子评论
    replies: [
        {
            content: {
                type: String,
                required: true
            },
            author: {
                type: Number,
                ref: 'User',
                required: true
            },
            UID:{
                type:Number,
                required:true,
                ref:'User'
            }
        },
    ],
})

const {Comment} = mongoose.model('Comment', CommentSchema);

module.exports = {Comment};
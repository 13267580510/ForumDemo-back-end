const mongoose = require('../Mongoose')
const moment = require("moment-timezone");
const mongodb = require("../Mongoose");

const FavoriteSchema = new mongodb.Schema({
    name:{
        type:String,
        required:true
    },
    introduction:{
        type:String,
        required:true
    }
    ,
    author:{
        type:String,
        required: true
    },
    UID:{
        type:String,
        ref:"User",
        required: true
    },
    docs:[{
        title:{
            type:String,
            required: true
        },
        introduction:{
            type:String,
            required: true
        },
        DocID:{
            type:mongodb.Schema.Types.ObjectId,
            required: true
        }

    }],
    createTime:{
        type:Date,
        default:() => moment().tz('Asia/Shanghai').format()
    },
})
const Favorite = mongoose.model('Favorite',FavoriteSchema);

module.exports = { Favorite }
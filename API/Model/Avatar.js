const mongodb =  require('../Mongoose');
const mongoose = require("../Mongoose");

const AvatarSchema = new mongodb.Schema({
    avatarName:{
        type:String,
        require:true
    },
    avatarPath:{
        type:String,
        require:true
    }
})

const Avatar = new mongoose.model("Avatar",AvatarSchema);

module.exports = {Avatar};
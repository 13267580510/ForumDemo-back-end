const mongoose = require('../Mongoose')
const moment = require("moment-timezone");
const mongodb = require("../Mongoose");
const FileSchema = new mongodb.Schema({
    fileName:{
        type:String,
        require:true,
        unique:true
    },
    filePath:{
        type:String,
        require: true,
        unique:true
    }
})

const File = mongoose.model('File',FileSchema);
module.exports = {File}
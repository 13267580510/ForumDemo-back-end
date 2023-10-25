const mongodb =  require('../Mongoose');
const mongoose = require("../Mongoose");
const ActionSchema = new mongodb.Schema({
        UID:{
            type:String,
            require:true,
        },
        targetID:{
            type:String,
            require:true,
        },
        isFinish:{
            type:Boolean,
            require:true,
            default:false
        }
})

const Action = new mongoose.model("Action",ActionSchema);

module.exports = {Action};
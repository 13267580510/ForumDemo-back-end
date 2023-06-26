
const mongoose = require('../Mongoose')

const CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true
    },
    code:{
        type:String,
        unique: true
    }

})

const Category = mongoose.model('Category', CategorySchema)


module.exports = { Category }
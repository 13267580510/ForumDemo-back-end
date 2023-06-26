const mongoose = require('../Mongoose')
const moment = require("moment-timezone");
const mongodb = require("../Mongoose");

const DocCategorySchema = new mongodb.Schema({
    name:{
        type:String,
        require:true
    },
    code:{
        type:Number,
        unique: true
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


 // 在保存前生成自增 UID
DocCategorySchema.pre('save', async function (next) {
    try {
        // 只有在 code 未定义时才自增
        if (!this.code) {
            const doc = this;
            // 在数据库中查找最大的 UID 值
            const DocCategory = await mongoose.models['DocCategory']
                .findOne({}, {}, { sort: { code: -1 } })
                .exec();

            // 自增 UID 值
            doc.code = DocCategory ? DocCategory.code + 1 : 1;
        }
        next();
    } catch (err) {
        next(err);
    }
});



const DocCategory = mongoose.model('DocCategory',DocCategorySchema);

module.exports = { DocCategory }

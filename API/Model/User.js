// 引入mongodb
const mongoose = require('../Mongoose')
const bcrypt = require('bcryptjs');
const moment = require("moment-timezone");
// 建立用户表
const UserSchema = new mongoose.Schema({
    satoken:{
        type:String,
        default:"common",
        required:true
    },
    status:{
        type:Boolean,
        default:false,
        required:true
    },
    UID:{
        type: Number,
        unique: true,

    },
    username: {
        type: String,
        unique: true,
        required:true
    },
    password: {
        type: String,
        set(val){
            return bcrypt.hashSync(val, 10)
        },
        select: true,
        required:true
    },
    nickname:{
        type: String,
        unique: true,
        required:true
    },
    salt:{
        type: Date,
        default:Date.now,
        unique:false,
        required:true
    },
    avatar:{
        type: String,
        default:"default"
    },
    description:{
        type: String,
        default:null,
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
    createTime: {
        type: Date,
        default: () => moment().tz('Asia/Shanghai').format(),
        required:true
    },
    updateTime: {
        type: Date,
        default: () => moment().tz('Asia/Shanghai').format(),
        required:true
    }
})

// 在保存前生成自增 UID
UserSchema.pre('save', async function (next) {
    try {
        // 只有在 UID 未定义时才自增
        if (!this.UID) {
            const doc = this;
            // 在数据库中查找最大的 UID 值
            const user = await mongoose.models['User']
                .findOne({}, {}, { sort: { UID: -1 } })
                .exec();

            // 自增 UID 值
            doc.UID = user ? user.UID + 1 : 1;
        }
        next();
    } catch (err) {
        next(err);
    }
});

// 建立用户数据库模型
const User = mongoose.model('User', UserSchema)


module.exports = { User }
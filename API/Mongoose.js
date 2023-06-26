const mongoose = require('mongoose')

// 连接数据库，自动新建 ExpressApi 库
// mongoose.connect('mongodb://localhost:27017/ExpressApi')
const db_url = 'mongodb://127.0.0.1:27017/ExpressApi';
/*  3.建立和MongoDB数据库的连接:
       useNewUrlParser：是否使用新的url地址转换方式
       useUnifiedTopology：是否使用新的用户安全策略
*/
mongoose.connect(db_url,{useNewUrlParser:true,useUnifiedTopology:true});


//4.1 : 建立连接---连接成功触发connected事件
mongoose.connection.on('connected',function (){
    console.log('数据库连接成功！连接地址是：'+db_url)
})
// 4.2 : 连接异常 --- 回调函数的参数中保存了异常的信息
mongoose.connection.on('error',function (err){
    console.log('数据库连接异常！'+err)
})
// 4.3 : 断开连接
mongoose.connection.on('disconnectied',function (){
    console.log('断开数据库的连接!')
})


module.exports = mongoose

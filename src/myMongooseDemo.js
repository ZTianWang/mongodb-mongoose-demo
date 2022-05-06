import mongoose, { Schema } from 'mongoose'

// 创建node连接mongo
const db = mongoose.createConnection('mongodb://localhost:27017/wnwn')

// 设置存储结构：
// 1.创建骨架: 第一个参数：创建属性，第二个参数(optianal)：配置信息
const studentSchema = new Schema({
    name: { 
        type: String, 
        unique: true
    },
    firstName: String,
    lastName: String,
    age: Number,
    gender: String,
    birth: Date,
    courses: [{ name: String, teacher: String }],    //表示这个字段值为一个有两个属性的数组
    classmates: [{     //表示这是一个关联查询的项，ref属性表示需要关联的Schema(Collection)，数组中的每个元素通过ref属性的_id关联
        type: Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        default: ''
    }],
}, {
    timestamps: true    //自动添加creatAt和updateAt两个字段，代表创建和更新时间
})

// Schema验证validate： 在执行.save()时会自动执行验证
const breakfastSchema = new Schema({
    eggs:{
        // 验证Number
        type: Number,
        min : [2, 'Too few eggs'],   //最小值：2个，低于2个抛出自定义err信息, 仅
        max: 5      //最大值：5个，多余5则抛出err
    },
    bacon:{
        type:{
            type : Number,
            required : [true, 'Why no bacon?']
        }
    },
    drink:{
        // 验证String
        type : String,
        enum : ['Coffe', 'Tea', 'Juice'],    //枚举数据
        required : function () {
            return this.eggs > 3        //若eggs>3则为true
        }
    },
    chief:{
        type: String,
        match : /^chief/,   //匹配正则表达式
        maxlength : 55,     //约束字符串长度
        minlength : 10
    },
    phone:{
        type : String,
        // 自定义验证
        validate : {
            validator : function (phone){
                return /\d{3}-\d{3}-\d{4}/.test(phone)      //验证一个电话号是否是XXX-XXX-XXXX，X为数字
            },
            message : value => `${value} is not a valid phone number!`,      //自定义错误信息
            required : [true, 'Phone number is required!']
        }
    }
})
const Breakfast = db.model('Breakfast', breakfastSchema)
const bf = new Breakfast()
bf.save(err => console.log(err.message))    //执行save时验证

// 2.绑定方法： 使用this只能用匿名函数，不可用箭头函数
//  1）给一个Schema绑定Model实例方法.methods：绑定在每个document示例上
studentSchema.methods.findSameGenderStu = function (cb) {     //cd: callback function
    return this.model('Student').find({ gender: this.gender }, cb)   //this指具体的document
}
//  2）给Schema绑定Model静态方法.statics：
studentSchema.statics.findByName = function (name, cb) {
    return this.findOne({ name: new RegExp(name, 'i') }, cb)    //this指Model, RegExp:正则表达式
}
//  3）给Schema绑定虚拟属性virtual property，该属性是直接设置在Schema上的. VR 并不会真正的存放在db中. 他只是一个提取数据的方法，提升查询速度
//      将firstName和lastName合并作为一个虚拟属性fullName
studentSchema.virtual('fullName').get(function () {
    return this.firstName + ' ' + this.lastName
}).set(function (fullName) {
    this.firstName = fullName.substring(0, fullName.indexOf(' '))
    this.lastName = fullName.substring(fullName.indexOf(' ') + 1)
})

// 2.操作集合：使用模型model(),返回值为1个Promise对象
// 创建model类
const Student = db.model('Student', studentSchema)     //第一个参数为model类名，并自动创建一个全小写的复数名的Collection(students),第二个参数为Schema

// 创建document
const leo = new Student({
    name: 'Leo',
    firstName: 'Leon',
    lastName: 'Wang',
    age: 28,
    gender: 'male',
    birth: new Date('1994-8-12'),
    courses: [
        { name: 'math', teacher: 'Tom' },
        { name: 'English', teacher: 'Cindy' },
        { name: 'PE', teacher: 'John' }
    ]
})

// const jack = new Student({
//     name: 'Jack',
//     firstName: 'Jack',
//     lastName: 'Thor',
//     age: 20,
//     gender: 'male',
//     birth: new Date('1998-8-12'),
//     courses: [
//         { name: 'math', teacher: 'Tom' },
//         { name: 'English', teacher: 'Cindy' },
//         { name: 'PE', teacher: 'John' }
//     ]
// })
// console.log(leo);
// Student.create(jack).then((r) => console.log(r))

// 调用实例方法
leo.findSameGenderStu((err, docs) => {
    if (!err) {
        console.log('findSameGenderStu: ')
        docs.forEach(doc => {
            console.log(doc.name)
        });
    }
})
// 调用静态方法：
Student.findByName('Jack', (err, doc) => {
    if (!err) {
        console.log('findByName: ' + doc.name)

        // 调用virtual property：以属性的方式获取虚拟属性
        console.log('vp fullName: ' + doc.fullName);  // 调用vp的get方法 --> Leon Wang 
        // doc.fullName = 'Leon Wang'    //调用vp的set方法
        // console.log('vp firstName: ' + leo.firstName)  //--> Zetian
    }
})

// 插入数据：create()
// Student.create({name:'Leon', age : 18, gender: 'male'}).then(r=>{
//     console.log(r);
// })  
// 查询数据：
// Student.findById('6274009498ce2e376928b30b').then(r=> console.log(r.name))

// 数据修改：
// Student.updateOne({ name: "Leon" }, { age: 20 }).then(r => console.log(r))



// 监听连接事件
db.on('open', () => {
    console.log('Connect successfully...')
})
db.on('error', () => {
    console.log('Failing to connect...')
})
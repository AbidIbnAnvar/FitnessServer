const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const UserSchema = new mongoose.Schema({
    username: {type: String, required: true, min: 4, unique: true}, email: {type: String, required:true} ,
    password: {type: String, required: true}  ,
    location: {type:String},
    weight: {type:Number},
    height: {type:Number}
})

const UserModel = model('User', UserSchema);

module.exports = UserModel;
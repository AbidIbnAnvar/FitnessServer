const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const ForumSchema = new mongoose.Schema({
    no:{type:Number,required:true,unique:true},
    username: {type: String, required: true}, 
    message:{type: String, required: true},
    likes:{type:Number},
    dislikes:{type:Number},
    date:{type:String},
    time:{type:String}
})
ForumSchema.index({ no: 1 }, { unique: true });

const Forum = model('Forum', ForumSchema);

module.exports = Forum;
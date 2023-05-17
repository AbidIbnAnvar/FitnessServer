const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const WorkoutSchema = new mongoose.Schema({
    username: {type: String, required: true, min: 4, unique: true},
    workout_name:{type:String, required:true},
    workout_reps:{type:Number},
    workout_duration:{type:Number},
    workout_calories:{type:Number}
})

const WorkoutModel = model('Workout', WorkoutSchema);

module.exports = WorkoutModel;
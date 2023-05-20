const mongoose = require('mongoose');
const {Schema,model} = mongoose;

const FITSchema = new mongoose.Schema({
    fileIdMesgs:{
        type: Object,
        required:false
    },
    eventMesgs: {
        type: Object,
        required:false
    },
    recordMesgs: {
        type: Object,
        required:false
    },
    sessionMesgs: {
        type: Object,
        required:false
    }
},{timestamps: true})

const FitModel = model('Fit', FITSchema);

module.exports = FitModel;
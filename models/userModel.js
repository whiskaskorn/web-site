const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {type: String,required: true,unique: true},
    email: {type: String,required: true,unique: true},
    password: {type: String,required: true},
    refresh_token: {type: String},
    validation_code: {type: Number},
    confirmed_code: {type: Boolean, default: false},
    roles: {type: [String],default: 'User'}
})

module.exports = mongoose.model('userSchema', userSchema)
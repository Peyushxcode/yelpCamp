const express = require('express');
const { required } = require('joi');
const mongoose = require('mongoose')
const app = express();
const passportLocalMongoose = require('passport-local-mongoose')

const userSchema = new mongoose.Schema({
    email:{
        type:String,
        required:true,
        unique:true
    }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);

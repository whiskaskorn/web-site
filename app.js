const express = require('express')
const PORT = 5000;
const path = require('path')
const mongoose = require('mongoose');
const app = express()
require('dotenv').config()

app.use(express.json())
app.use(express.static(path.join(__dirname + '/public')))
app.use(express.urlencoded({extended: true}))

mongoose.connect('mongodb://localhost:27017/web-site')
.then(()=>{
    console.log('Database connected!')
})
.catch((err)=>{
    console.log(err)
})

app.use(require('./routers/userRouter'))
app.listen(PORT,()=>{
    console.log(`Server working on PORT: ${PORT}`)
})
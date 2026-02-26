const userSchema = require('../models/userModel')
const minCount = 100000;
const maxCount = 999999;
const sgMail = require('@sendgrid/mail')
const bcrypt = require('bcrypt')
const {check,validationResult} = require('express-validator')

async function registration(req,res){
    try {
            const validErrors = validationResult(req)
            if(!validErrors.isEmpty()){
                console.log(validErrors)
                return res.status(400).json({errors: validErrors.array()})
            }
    
            const {username,email,password} = req.body
            const candidate = await userSchema.findOne({$or: [{email},{username}]})
    
            if(candidate){
                return res.status(400).json({message: 'Пользователь с таким именем или эмейлом уже существует!'})
            }
    
            const valideCode = Math.floor(Math.random() * (maxCount - minCount) + minCount)
    
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    
            sgMail.send({
                to: email,
                from: "whiskaskorn@gmail.com",
                subject: `Подтвердите вход. Ваш код: ${valideCode}`,
                html: "<h1>Мы должны убедиться, что указанная почта существует!</h1> <p>Вернитесь на страницу подтверждения и укажите этот код</p>"
            }).then(()=>{
                console.log('Письмо с подтверждением отправлено!')
            }).catch((err)=>{
                console.log(err)
            })
    
            const passHash = await bcrypt.hash(password,10)
            const user = await userSchema.create({username,email,password: passHash, validation_code: valideCode})
            // res.status(201).json({message: 'Пользователь создан!'})
            res.redirect('/html/userVarification.html')
        } catch (error) {
            res.status(500).json({message: "Серверная ошибка!"})
        }
}

module.exports = registration;
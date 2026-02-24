const express = require('express')
const {check,validationResult} = require('express-validator')
const bcrypt = require('bcrypt')
const userSchema = require('../models/userModel')
const router = express.Router()
const minCount = 100000;
const maxCount = 999999;
const sgMail = require('@sendgrid/mail')
const jwt = require('jsonwebtoken')
const authMiddleware = require('../middlewares/authMiddleware')

router.post('/registration', [
    check('username', 'Поле пользователя должно содержать от 5 до 12символов').isLength({min: 5,max: 12}),
    check('email','Ошибка валидации емайла!').isEmail(),
    check('password', 'Поле пароля должно содержать от 5 до 12символов').isLength({min: 5,max: 12})
],async (req,res)=>{
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
})

router.post('/userVarification', async(req,res)=>{
    try {
        const {email,userVarification} = req.body
        const user = await userSchema.findOne({email})
        if(!user){
            return res.status(400).json({message: 'Неверная почта!'})
        }

        if(user.validation_code == userVarification){
            user.confirmed_code = true;
            user.validation_code = undefined;
            user.save()
            return res.status(200).json({message: 'Почта подтверждена! Вы можете залогиниться'})
        }
        return res.status(400).json({message: 'Неверный код!'})
    } catch (error) {
        res.status(500).json({message: "Серверная ошибка!"})
    }
})

router.post('/login', async(req,res)=>{
    try {
        const {email, password} = req.body;
        const user = await userSchema.findOne({email})
        if(!user){
            return res.status(400).json({message: "Неверный эмейл или пароль!"})
        }

        const isValid = await bcrypt.compare(password, user.password)
        if(!isValid){
            return res.status(400).json({message: "Неверный эмейл или пароль!"})
        }
        if(!user.confirmed_code){
            return res.status(400).json({message: "Ваша электронная почта не подтверждена!"})
        }
        
        const jwt_token = jwt.sign({userID: user._id},process.env.JWT_SECRET_KEY,{expiresIn: '1h'})

        res.status(200).json({message: 'Вы успешно залогинены!', jwt_token})
    } catch (error) {
        res.status(500).json({message: "Серверная ошибка!"})
    }
})

router.get('/profile',authMiddleware, async(req,res)=>{
    try {
        const id = req.user.userID
        const user = await userSchema.findById(id).select('-password',).select('-confirmed_code')
        if(!user){
            return res.status(404).json({message: 'Пользователь не найден!'})
        }
        res.json(user)
    } catch (error) {
        res.status(500).json({message: "Серверная ошибка!"})
    }
})

module.exports = router
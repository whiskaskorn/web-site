const userSchema = require('../models/userModel')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function login(req,res){
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
        
        const token = jwt.sign({userID: user._id},process.env.JWT_SECRET_KEY,{expiresIn: '24h'})
        const refresh_token = jwt.sign({userID: user._id},process.env.JWT_REFRESH_SECRET_KEY,{expiresIn: '7d'})

        user.refresh_token = refresh_token;
        await user.save()

        res.cookie('token',token, {
            httpOnly: true,
            maxAge: 60 * 60 * 1000
        })

        res.cookie('refresh_token',refresh_token,{
            httpOnly: true,
            maxAge: 7 * 24 * 60 * 60 * 1000
        })

        res.status(200).json({message: 'Вы успешно залогинены!', token})
    } catch (error) {
        console.log(error)
        res.status(500).json({message: "Серверная ошибка!"})
    }
}

module.exports = login;
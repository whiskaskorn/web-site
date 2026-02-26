const express = require('express')
const {check,validationResult} = require('express-validator')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware')
const logout = require('../controllers/user_logout')
const profile = require('../controllers/user_profile')
const refreshToken = require('../controllers/user_refresh_token')
const login = require('../controllers/user_login')
const userVarification = require('../controllers/user_varification')
const registration = require('../controllers/user_registration')

router.post('/registration', [
    check('username', 'Поле пользователя должно содержать от 5 до 12символов').isLength({min: 5,max: 12}),
    check('email','Ошибка валидации емайла!').isEmail(),
    check('password', 'Поле пароля должно содержать от 5 до 12символов').isLength({min: 5,max: 12})
], registration)

router.post('/userVarification', userVarification)

router.post('/login', login)

router.post('/refresh', refreshToken)

router.get('/profile', authMiddleware, profile)

router.post('/logout', authMiddleware, logout)

module.exports = router
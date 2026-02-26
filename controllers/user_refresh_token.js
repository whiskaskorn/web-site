const userSchema = require('../models/userModel')
const jwt = require('jsonwebtoken')

async function refreshToken(req,res){
    const refresh_token = req.cookies.refresh_token
            if(!refresh_token){
                return res.status(401).json({message: 'Нет рефреш токена!'})
            }
        try {
            const decoded = jwt.verify(refresh_token, process.env.JWT_REFRESH_SECRET_KEY)
            req.user = decoded
            const user = await userSchema.findById(req.user.userID)
            if(!user || refresh_token !== user.refresh_token){
                return res.status(403).json({message: 'Инвалидный рефреш токен'})
            }
    
            const newToken = jwt.sign({userID: user._id},process.env.JWT_SECRET_KEY,{expiresIn: '24h'})
            res.cookie('token',newToken, {
                httpOnly:true,
                maxAge: 24 * 60 * 60 * 1000
            })
            res.json({message: 'Токен был обновлен!'})
        } catch (error) {
            res.status(403).json({message: "Инвалидный рефреш токен"})
        }
}

module.exports = refreshToken;
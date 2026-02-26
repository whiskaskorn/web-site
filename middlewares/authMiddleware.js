const jwt = require('jsonwebtoken')
module.exports = function(req,res,next){
    const token = req.cookies.token
    if(!token){
        return res.status(400).json({message: 'Пользователь не авторизован!'})
    }

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user = decoded
        next()
    } catch (error) {
        res.status(400).json({message: 'Неверный токен'})
    }
}
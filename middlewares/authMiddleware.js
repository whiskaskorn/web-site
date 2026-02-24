const jwt = require('jsonwebtoken')
module.exports = function(req,res,next){
    const authHeader = req.headers.authorization
    if(!authHeader){
        return res.status(400).json({message: 'Невалидный токен'})
    }

    const token  = authHeader.split(' ')[1]

    try {
        const decoded = jwt.verify(token,process.env.JWT_SECRET_KEY)
        req.user = decoded
        next()
    } catch (error) {
        res.status(400).json({message: 'Неверный токен'})
    }
}
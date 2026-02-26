const userSchema = require('../models/userModel')

async function profile(req,res){
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
}

module.exports = profile
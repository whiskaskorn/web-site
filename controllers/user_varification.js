const userSchema = require('../models/userModel')

async function userVarification(req,res){
    try {
            const {email,userVarification} = req.body
            const user = await userSchema.findOne({email})
            if(!user){
                return res.status(400).json({message: 'Неверная почта!'})
            }
    
            if(user.validation_code == userVarification){
                user.confirmed_code = true;
                user.validation_code = undefined;
                await user.save()
                return res.status(200).json({message: 'Почта подтверждена! Вы можете залогиниться'})
            }
            return res.status(400).json({message: 'Неверный код!'})
        } catch (error) {
            res.status(500).json({message: "Серверная ошибка!"})
        }
}

module.exports = userVarification;
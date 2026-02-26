const userSchema = require('../models/userModel')

async function logout(req,res){
try {
        const user = await userSchema.findById(req.user.userID)
        if(!user){
            return res.status(404).json({message: 'Пользователь не найден!'})
        }
        user.refresh_token = undefined;
        await user.save()

        res.clearCookie('token')
        res.clearCookie('refresh_token')
        res.status(200).json({ message: 'Вы успешно вышли из системы' });
    } catch (error) {
        res.status(500).json({message: "Серверная ошибка!"})
    }
}

module.exports = logout;
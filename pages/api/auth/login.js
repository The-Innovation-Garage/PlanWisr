import User from "../../../models/User"
import connectDB from "../../../middlewares/connectDB";
import bcrypt from "bcryptjs";
import { signToken } from '../../../utils/jwt';

const handler = async (req, res) => {
    if (req.method == "POST") {
        const rEmail = req.body.email;
        const rPassword = req.body.password;
        let user = await User.findOne({email: rEmail})
        console.log(user)

        if (user && (await bcrypt.compare(rPassword, user.password))) {
       
            const token = signToken({userId: user._id, email: user.email,  name:user.name}, process.env.NEXT_PUBLIC_JWT_TOKEN, '1d');
            const refreshToken = signToken({userId: user._id, email: user.email,  name:user.name }, process.env.NEXT_PUBLIC_JWT_TOKEN, '7d');

            const sendUser = {
                _id: user._id,
                email: user.email,
                name: user.name
            }

            return res.status(200).json({user: sendUser, message: "Logged In Successfully", type:"success", token: token, refreshToken: refreshToken})

        }
        else {
            return res.status(400).json({message: "Invalid Credientials", type: "error"})
        }

    }
    
    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}


export default connectDB(handler);
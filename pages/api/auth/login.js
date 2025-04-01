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
       
            const token = signToken({userId: user._id, email: user.email,  firstName:user.firstName, lastName:user.lastName}, process.env.NEXT_PUBLIC_JWT_TOKEN, '1d');
            const refreshToken = signToken({userId: user._id, email: user.email,  firstName:user.firstName, lastName:user.lastName }, process.env.NEXT_PUBLIC_JWT_TOKEN, '7d');

            return res.status(200).json({userId: user._id, email: user.email, message: "Logged In Successfully", type:"success", token: token, refreshToken: refreshToken})

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
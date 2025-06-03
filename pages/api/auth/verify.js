import User from "../../../models/User"
import connectDB from "../../../middlewares/connectDB";
import bcrypt from "bcryptjs";
import { verifyToken } from '../../../utils/jwt';

const handler = async (req, res) => {
    try {

        if (!req.body.token) {
            return res.status(200).json({ type: "error", message: "You are not logged in" })
        }
        
        const verification = verifyToken(req.body.token, process.env.NEXT_PUBLIC_JWT_TOKEN);
        if (!verification) {
            return res.status(200).json({ type: "error", message: "Invalid Token" })
        }
        const user = await User.findOne({ email: verification.email }, { password: 0, createdAt: 0, updatedAt: 0, __v: 0 });
      
        res.status(200).json({ type: "success", message: "Token verified", user: user});
      }
      catch(error) {
        console.log(error)
        res.status(500).json({ type: "error", message: "Something went wrong"});

      }
}


export default connectDB(handler);
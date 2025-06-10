

import Entry from "../../../models/Entry"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
import mongoose from 'mongoose';
import User from "../../../models/User";
const handler = async (req, res) => {
    if (req.method == "POST") {
        try {

          if (req.body.API_KEY !== process.env.NEXT_PUBLIC_API_KEY) {
              return res.status(401).json({ message: "Unauthorized", type: "error" });
          }

          const user = await User.findOne({email: req.body.email}, { aiLimit: 1, _id: 0 });

          if (!user) {
              return res.status(404).json({ message: "User not found", type: "error" });
          }

          await User.updateOne(
              { email: req.body.email },
              // reset aiLimit to 10
              { aiLimit: 10 }
          );

          return res.status(200).json({ message: "AI limit reset successfully", type: "success" });
           
        }
        catch (error) {
            console.error("Error", error);
            return res.status(500).json({ message: "Internal Server Error", type: "error" });
        }
    }
    else {
        return res.status(200).json({ error: "Not Allowed" });
    }
}

export default connectDB(handler);
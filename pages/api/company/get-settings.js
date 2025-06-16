// pages/api/company/get-settings.js
import User from "../../../models/User";
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';

const handler = async (req, res) => {
  if (req.method === "GET") {
    try {
      const token = req.headers.authorization?.split(" ")[1];
      
      if (!token) {
        return res.status(401).json({ 
          type: "error", 
          message: "Unauthorized - No token provided" 
        });
      }

      const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
      const userId = decoded.userId;

      // Get user with company details
      const user = await User.findById(userId).select('companyDetails');
      
      if (!user) {
        return res.status(404).json({ 
          type: "error", 
          message: "User not found" 
        });
      }

      // Return company details or empty object if not set
      const companyDetails = user.companyDetails || {
        name: "",
        email: "",
        phone: "",
        address: "",
        website: "",
        logoUrl: ""
      };

      return res.status(200).json({
        type: "success",
        company: companyDetails
      });

    } catch (error) {
      console.error("Get company settings error:", error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          type: "error",
          message: "Invalid token"
        });
      }

      return res.status(500).json({
        type: "error",
        message: "Internal server error",
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  } else {
    return res.status(405).json({
      type: "error",
      message: "Method Not Allowed"
    });
  }
};

export default connectDB(handler);
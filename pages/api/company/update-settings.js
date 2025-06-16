// pages/api/company/update-settings.js
import User from "../../../models/User";
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';

const handler = async (req, res) => {
  if (req.method === "POST") {
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

      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          type: "error", 
          message: "User not found" 
        });
      }

      // Extract company data from request body (FormData)
      const name = req.body.name || "";
      const email = req.body.email || "";
      const phone = req.body.phone || "";
      const address = req.body.address || "";
      const website = req.body.website || "";
      const logoUrl = req.body.logoUrl || "";

      console.log(name, email, phone, address, website, logoUrl);

      // Validate required fields
      if (!name.trim() || !email.trim()) {
        return res.status(400).json({
          type: "error",
          message: "Company name and email are required"
        });
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return res.status(400).json({
          type: "error",
          message: "Please provide a valid email address"
        });
      }

      // Prepare company data
      const companyData = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        address: address.trim(),
        website: website.trim(),
        logoUrl: logoUrl.trim()
      };

      // Update user's company details
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            companyDetails: companyData 
          } 
        },
        { 
          new: true, 
          runValidators: true 
        }
      );

      return res.status(200).json({
        type: "success",
        message: "Company settings updated successfully",
        company: updatedUser.companyDetails
      });

    } catch (error) {
      console.error("Update company settings error:", error);
      
      // Handle specific mongoose errors
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          type: "error",
          message: "Validation failed",
          details: Object.values(error.errors).map(err => err.message)
        });
      }

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
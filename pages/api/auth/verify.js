import User from "../../../models/User";
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from "../../../utils/jwt";

const handler = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(401).json({
        type: "error",
        message: "No token provided. You are not logged in.",
        errorCode: "NO_TOKEN",
      });
    }

    const payload = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);

    if (!payload || !payload.email) {
      return res.status(401).json({
        type: "error",
        message: "Invalid or expired token.",
        errorCode: "INVALID_TOKEN",
      });
    }

    const user = await User.findOne(
      { email: payload.email },
      { password: 0, createdAt: 0, updatedAt: 0, __v: 0 }
    );

    if (!user) {
      return res.status(404).json({
        type: "error",
        message: "User not found.",
        errorCode: "USER_NOT_FOUND",
      });
    }

    return res.status(200).json({
      type: "success",
      message: "Token verified successfully.",
      user,
    });

  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(500).json({
      type: "error",
      message: "Internal server error during token verification.",
      errorCode: "VERIFY_FAILED",
    });
  }
};

export default connectDB(handler);

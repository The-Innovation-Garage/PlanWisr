import User from "../../../models/User";
import connectDB from "../../../middlewares/connectDB";
import bcrypt from "bcryptjs";
import { signToken } from "../../../utils/jwt";

const handler = async (req, res) => {
  if (req.method === "POST") {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          type: "error",
          message: "Email and password are required.",
          errorCode: "MISSING_FIELDS",
        });
      }

      const user = await User.findOne({ email });

      if (!user) {
        return res.status(401).json({
          type: "error",
          message: "No account found with this email.",
          errorCode: "USER_NOT_FOUND",
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        return res.status(401).json({
          type: "error",
          message: "Incorrect password. Please try again.",
          errorCode: "WRONG_PASSWORD",
        });
      }

      const token = signToken(
        { userId: user._id, email: user.email, name: user.name },
        process.env.NEXT_PUBLIC_JWT_TOKEN,
        "1d"
      );

      const refreshToken = signToken(
        { userId: user._id, email: user.email, name: user.name },
        process.env.NEXT_PUBLIC_JWT_TOKEN,
        "7d"
      );

      const sendUser = {
        _id: user._id,
        email: user.email,
        name: user.name,
        aiLimit: user.aiLimit,
        isPro: user.isPro
      };

      return res.status(200).json({
        type: "success",
        message: "Logged in successfully.",
        user: sendUser,
        token,
        refreshToken,
      });

    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({
        type: "error",
        message: "Something went wrong during login.",
        errorCode: "LOGIN_FAILED",
        error: err.message,
      });
    }
  } else {
    return res.status(405).json({
      type: "error",
      message: "Method Not Allowed.",
      errorCode: "METHOD_NOT_ALLOWED",
    });
  }
};

export default connectDB(handler);
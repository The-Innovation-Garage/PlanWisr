
import User from "../../../models/User"
import connectDB from "../../../middlewares/connectDB";
import bcrypt from "bcryptjs";

const handler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ type: "error", message: "Method not allowed" });
  }

  try {
    const { email, name, password } = req.body;

    if (!email || !name || !password) {
      return res.status(400).json({ type: "error", message: "Missing required fields." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      email,
      name,
      password: hashedPassword,
      aiLimit: 10,
    });

    await user.save();

    return res.status(201).json({ type: "success", message: "Account created successfully." });

  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({
        type: "error",
        message: "Email already exists. Please use a different email.",
        errorCode: "EMAIL_EXISTS",
      });
    }

    console.error("Signup error:", err);
    return res.status(500).json({
      type: "error",
      message: "Server error occurred.",
      error: err.message,
    });
  }
};


export default connectDB(handler); 
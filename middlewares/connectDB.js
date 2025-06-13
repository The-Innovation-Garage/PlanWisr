import mongoose from "mongoose";

let isConnected = false;

const connectDB = (handler) => async (req, res) => {
  if (isConnected) {
    return handler(req, res);
  }

  try {
    if (mongoose.connection.readyState < 1) {
      mongoose.set("strictQuery", false);
      await mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });

      isConnected = true;
      console.log("MongoDB connected.");
    }

    return handler(req, res);
  } catch (err) {
    console.error("MongoDB connection error:", err);
    return res.status(500).json({
      type: "error",
      message: "Database connection failed.",
      error: err.message,
    });
  }
};

export default connectDB;

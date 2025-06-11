import Feedback from "@/models/Feedback"
import { NextResponse } from "next/server"
import connectDB from "../../middlewares/connectDB";

const handler = async (req, res) =>  {
  try {
    const { type, message } = req.body

    
    const feedback = new Feedback({
      type,
      name: req.user ? req.user.name : "Anonymous",
      message,
      
    })

    return res.status(200).json({
      type: "success",
      message: "Feedback submitted successfully",
      feedback,
    })
   
  } catch (error) {
    console.error("Feedback submission error:", error)
    return res.status(500).json({
      type: "error",
      message: "Failed to submit feedback",
    })
  }
}

export default connectDB(handler)
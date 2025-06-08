import Task from "../../../models/Task"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';

const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized", type: "error" });
        }
      
        const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
        const userId = decoded.userId;

        // Get today's date range (start and end of day)
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));
        const endOfDay = new Date(today.setHours(23, 59, 59, 999));

        const tasks = await Task.find({ 
          createdBy: userId,
          dueDate: {
            $gte: startOfDay,
            $lte: endOfDay
          }
        }).populate("project", "title description");

        return res.status(200).json({ 
          type: "success", 
          tasks: tasks,
          message: "Today's tasks fetched successfully" 
        });
      }
      catch (error) {
        console.error("Error getting today's tasks:", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error" });
      }
    }
    else {
      return res.status(405).json({ message: "Method not allowed", type: "error" })
    }
}

export default connectDB(handler);
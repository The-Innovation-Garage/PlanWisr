import Task from "../../../models/Task"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const {taskId} = req.body;
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized", type: "error" });
        }
        console.log("Token:", token);
       const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
       const userId = decoded.userId;
       // check if the user is authorized to delete the task
         const task = await Task.findById(taskId);
         if (!task) {
              return res.status(404).json({ message: "Task not found", type: "error" });
            }
        console.log(task.createdBy.toString(), userId);
         if (task.createdBy.toString() !== userId) {
            return res.status(403).json({ message: "Forbidden: You are not allowed to delete this task", type: "error" });
         }
         // delete the task
            await Task.findByIdAndDelete(taskId);
       return res.status(200).json({ message: "Task deleted successfully", type: "success" });
    }
    catch (error) {
        console.error("Error getting tasks:", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error" });
    }
    }
    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}

export default connectDB(handler);
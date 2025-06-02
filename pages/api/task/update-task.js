import Task from "../../../models/Task"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const {project, taskId} = req.body;
        const {title, description, status, priority, dueDate} = project
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized", type: "error" });
        }
        console.log("Token:", token);
       const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
       const userId = decoded.userId;
       const task = await Task.findById(taskId);
         if (!task) {
                return res.status(404).json({ message: "Task not found", type: "error" });
          }
          if (task.createdBy.toString() !== userId) {
                return res.status(403).json({ message: "You are not authorized to update this task", type: "error" });
          }
    
          // Update the task
       await Task.findByIdAndUpdate(taskId, {
            title,
            description,
            status,
            priority,
            dueDate
        });
        return res.status(200).json({ type: "success", message: "Task updated successfully" });
    }
    catch (error) {
        console.error("Error updating task:", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error" });
    }
    }
    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}

export default connectDB(handler);
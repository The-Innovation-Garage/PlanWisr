import Task from "../../../models/Task"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';

const handler = async (req, res) => {
    if (req.method === "POST") {
        try {
            const { taskId, dueDate, title, description, status, priority, project } = req.body;
            
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized", type: "error" });
            }

            const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
            const userId = decoded.userId;

            // Find and update the task
            const updatedTask = await Task.findOneAndUpdate(
                { _id: taskId, createdBy: userId },
                {
                    $set: {
                        ...(dueDate && { dueDate }),
                        ...(title && { title }),
                        ...(description && { description }),
                        ...(status && { status }),
                        ...(priority && { priority }),
                        ...(project && { project })
                    }
                },
                { new: true }
            );

            if (!updatedTask) {
                return res.status(404).json({ message: "Task not found", type: "error" });
            }

            return res.status(200).json({ 
                message: "Task updated successfully", 
                type: "success",
                task: updatedTask
            });

        } catch (error) {
            console.error("Error updating task:", error);
            return res.status(500).json({ message: "Internal Server Error", type: "error" });
        }
    }

    return res.status(405).json({ message: "Method not allowed", type: "error" });
}

export default connectDB(handler);
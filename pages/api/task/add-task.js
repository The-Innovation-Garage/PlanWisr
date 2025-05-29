import Task from "../../../models/Task"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const { title, description, project, dueDate, status, priority } = req.body;
        console.log(req.body)
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized", type: "error" });
        }
       const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
       const userId = decoded.userId;
       const task = new Task({  
           title,
           description,
           dueDate,
           status,
           priority,
           project,
           createdBy: userId
       });
       const savedTask = await task.save();
        return res.status(200).json({ message: "Task Added successfully", type: "success"});
    }
    catch (error) {
        console.error("Error adding task: ", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error" });
      }

    }

    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}


export default connectDB(handler);
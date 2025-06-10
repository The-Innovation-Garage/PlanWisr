import Task from "../../../models/Task"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const {projectId} = req.body;
        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized", type: "error" });
        }
        console.log("Token:", token);
       const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
       const userId = decoded.userId;
       const tasks = await Task.find({ project: projectId, createdBy: userId })
        return res.status(200).json({ type: "success", tasks: tasks });
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
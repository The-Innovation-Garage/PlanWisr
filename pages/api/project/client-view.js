import Task from "../../../models/Task"
import Project from "../../../models/Project"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const {projectId} = req.body;
        
       const tasks = await Task.find({ project: projectId });
       const project = await Project.findOne({ _id: projectId });
        return res.status(200).json({ type: "success", tasks: tasks, project:project });
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
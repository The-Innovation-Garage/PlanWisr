import Project from "../../../models/Project"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
      try {
        const { title, description, dueDate, status, priority, tags, progress } = req.body;

        const token = req.headers.authorization.split(" ")[1];
        if (!token) {
          return res.status(401).json({ message: "Unauthorized", type: "error" });
        }
        console.log("Token:", token);
       const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
       const userId = decoded.userId;
       const project = new Project({  
           title,
           description,
           dueDate,
           status,
           priority,
           tags,
           progress,
           createdBy: userId
       });
       const savedProject = await project.save();
         console.log("Project saved successfully:", savedProject);
        return res.status(200).json({ message: "Project saved successfully", type: "success", project: savedProject });
    }
    catch (error) {
        console.error("Error saving project:", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error" });
      }

    }

    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}


export default connectDB(handler);
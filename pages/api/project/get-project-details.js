import Project from "../../../models/Project"
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
       const project = await Project.findOne({ _id:projectId, createdBy: userId });
        return res.status(200).json({ type: "success", project: project });
    }
    catch (error) {
        console.error("Error getting project:", error);
        return res.status(500).json({ message: "Internal Server Error", type: "error" });
      }

    }

    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}


export default connectDB(handler);
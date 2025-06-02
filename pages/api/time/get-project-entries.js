import Entry from "../../../models/Entry"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
        try {
            const { projectId } = req.body;

            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized", type: "error" });
            }
            const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
            const userId = decoded.userId;
            const entries = await Entry.find({ userId, projectId });
            return res.status(200).json({ message: "Entry fetched successfully", type: "success", entries: entries });
        }
        catch (error) {
            console.error("Error fetching entries:", error);
            return res.status(500).json({ message: "Internal Server Error", type: "error" });
        }

    }

    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}


export default connectDB(handler);
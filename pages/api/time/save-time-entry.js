import Entry from "../../../models/Entry"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    if (req.method == "POST") {
        try {
            const { description,
                duration,
                startTime,
                endTime,
                mode,
                projectId } = req.body;

                console.log("Request Body:", req.body);

            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized", type: "error" });
            }
            console.log("Token:", token);
            const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
            const userId = decoded.userId;
            const entry = new Entry({
                description,
                duration,
                startTime,
                endTime,
                mode,
                projectId,
                userId
            });
            const entryProject = await entry.save();
            return res.status(200).json({ message: "Entry saved successfully", type: "success", entry: entryProject });
        }
        catch (error) {
            console.error("Error saving entry:", error);
            return res.status(500).json({ message: "Internal Server Error", type: "error" });
        }

    }

    else {
        return res.status(200).json({ error: "Not Allowed" })
    }
}


export default connectDB(handler);
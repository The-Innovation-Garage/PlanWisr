import Entry from "../../../models/Entry"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
import mongoose from 'mongoose';
const handler = async (req, res) => {
    if (req.method == "POST") {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized", type: "error" });
            }

            const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
            const userId = decoded.userId;
            let convertedUserId = new mongoose.Types.ObjectId(userId);

            const entries = await Entry.aggregate([
                { $match: { userId: convertedUserId } },
                {
                    $group: {
                        _id: "$projectId",
                        totalMinutes: { 
                            $sum: { 
                                $divide: ["$duration", 60] 
                            } 
                        }
                    }
                },
                {
                    $lookup: {
                        from: "projects",
                        localField: "_id",
                        foreignField: "_id",
                        as: "project"
                    }
                },
                {
                    $unwind: "$project"
                },
                {
                    $project: {
                        _id: 0,
                        projectName: "$project.title",
                        totalMinutes: 1
                    }
                }
            ])

            return res.status(200).json({
                message: "Data fetched successfully",
                type: "success",
                entries: entries
            });
        }
        catch (error) {
            console.error("Error fetching projects data:", error);
            return res.status(500).json({ message: "Internal Server Error", type: "error" });
        }
    }
    else {
        return res.status(200).json({ error: "Not Allowed" });
    }
}

export default connectDB(handler);
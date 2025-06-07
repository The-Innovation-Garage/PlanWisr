

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

            // Get current month's start and end dates
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

            const entries = await Entry.aggregate([
                {
                    $match: {
                        userId: convertedUserId,
                        startTime: {
                            $gte: startOfMonth,
                            $lte: endOfMonth
                        }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$startTime" } },
                        totalMinutes: { 
                            $sum: { 
                                $divide: ["$duration", 60] 
                            } 
                        }
                    }
                },
                { $sort: { _id: 1 } }
            ]);

            return res.status(200).json({ 
                message: "Entry fetched successfully", 
                type: "success", 
                entries: entries 
            });
        }
        catch (error) {
            console.error("Error fetching entries:", error);
            return res.status(500).json({ message: "Internal Server Error", type: "error" });
        }
    }
    else {
        return res.status(200).json({ error: "Not Allowed" });
    }
}

export default connectDB(handler);
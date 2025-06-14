import Project from "../../../models/Project"
import Task from "../../../models/Task"
import connectDB from "../../../middlewares/connectDB";
import { verifyToken } from '../../../utils/jwt';
import mongoose from 'mongoose';
const handler = async (req, res) => {
    if (req.method == "GET") {
        try {
            const token = req.headers.authorization.split(" ")[1];
            if (!token) {
                return res.status(401).json({ message: "Unauthorized", type: "error" });
            }

            const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
            const userId = decoded.userId;

            const convertedUserId = new mongoose.Types.ObjectId(userId);

            // Get projects with progress stats using aggregation
            const projectsWithProgress = await Project.aggregate([
                // Match user's projects
                { $match: { createdBy:convertedUserId } },
                
                // Lookup tasks for each project
                {
                    $lookup: {
                        from: "tasks",
                        localField: "_id",
                        foreignField: "project",
                        as: "tasks"
                    }
                },
                
                // Add progress fields
                {
                    $addFields: {
                        totalTasks: { $size: "$tasks" },
                        completedTasks: {
                            $size: {
                                $filter: {
                                    input: "$tasks",
                                    as: "task",
                                    cond: { $eq: ["$$task.status", "done"] }
                                }
                            }
                        }
                    }
                },
                
                // Calculate progress percentage
                {
                    $addFields: {
                        progress: {
                            $cond: [
                                { $eq: ["$totalTasks", 0] },
                                0,
                                {
                                    $multiply: [
                                        { $divide: ["$completedTasks", "$totalTasks"] },
                                        100
                                    ]
                                }
                            ]
                        }
                    }
                },
                
                // Remove tasks array from final result
                {
                    $project: {
                        tasks: 0
                    }
                }
            ]);

            return res.status(200).json({ 
                type: "success", 
                projects: projectsWithProgress 
            });

        } catch (error) {
            console.error("Error getting projects:", error);
            return res.status(500).json({ 
                message: "Internal Server Error", 
                type: "error" 
            });
        }
    }

    return res.status(405).json({ error: "Method Not Allowed" });
}

export default connectDB(handler);
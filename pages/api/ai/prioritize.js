import { GoogleGenerativeAI } from "@google/generative-ai";
import connectDB from "../../../middlewares/connectDB";
import Task from "../../../models/Task";
import User from "../../../models/User";
import { verifyToken } from '../../../utils/jwt';
const handler = async (req, res) => {
    try {

      const token = req.headers.authorization.split(" ")[1];
      if (!token) {
        return res.status(401).json({ message: "Unauthorized", type: "error" });
      }
      console.log("Token:", token);
     const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
     const userId = decoded.userId;
     const user = await User.findById(userId);
     console.log("User:", user);
      if (!user) {
        return res.status(404).json({ type: "error", message: "User not found" });
      }
      if (user.aiLimit <= 0) {
        return res.status(403).json({ type: "error", message: "AI limit exceeded. Please upgrade your plan." });
      }
        const { tasks } = req.body;
        const gemini_api_key = process.env.API_KEY;
        const googleAI = new GoogleGenerativeAI(gemini_api_key);
        const geminiConfig = {
            temperature: 0.7,
            topP: 1,
            topK: 1,
            maxOutputTokens: 4096,
        };

        const geminiModel = googleAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            geminiConfig,
        });

        // Modified prompt to prevent markdown formatting
        const prompt = `You are a task prioritization system. Analyze these tasks and provide priority rankings.
        Return ONLY valid JSON without any markdown formatting or additional text.
        
        Tasks to analyze:
        ${tasks.map(task => `
            Title: ${task.title}
            Description: ${task.description || 'No description'}
            Due Date: ${task.dueDate || 'No due date'}
            Current Status: ${task.status}
            Current Priority: ${task.priority}
            ID: ${task._id}
        `).join('\n')}

        Consider these factors:
        1. Urgency (due date proximity)
        2. Current status
        3. Task complexity
        4. Dependencies
        5. Business impact

        Respond with this exact JSON structure:
        {
            "taskPriorities": [
                {
                    "taskId": "[actual task ID]",
                    "rank": [number],
                    "suggestedPriority": "[high/medium/low]",
                    "reason": "[explanation]"
                    "projectTitle: "[project title]"
                }
            ]
        }`;

        const result = await geminiModel.generateContent(prompt);
        const response = await result.response.text();
        
        // Clean the response and parse JSON
        let priorityData;
        try {
            // Remove any potential markdown formatting or extra characters
            const cleanResponse = response.replace(/```json|```|\n/g, '').trim();
            priorityData = JSON.parse(cleanResponse);

            // Validate the response structure
            if (!priorityData.taskPriorities || !Array.isArray(priorityData.taskPriorities)) {
                throw new Error('Invalid response structure');
            }
        } catch (parseError) {
            console.error("JSON parsing error:", parseError);
            return res.status(500).json({
                type: "error",
                message: "Failed to parse AI response",
                error: parseError.message
            });
        }

        // Update tasks with new priorities
        const updatePromises = priorityData.taskPriorities.map(async (priority) => {
            return Task.findByIdAndUpdate(
                priority.taskId,
                {
                    $set: {
                        priority: priority.suggestedPriority,
                        rank: priority.rank,
                        lastPrioritized: new Date(),
                        aiReason: priority.reason
                    }
                },
                { new: true }
            );
        });



        const updatedTasks = await Promise.all(updatePromises);

        const updatedLimit = await User.findByIdAndUpdate(
            userId,
            { $inc: { aiLimit: -1 } },
            { new: true }
        );

        const remainingLimit = updatedLimit.aiLimit;

        return res.status(200).json({
            type: "success",
            message: "Tasks prioritized successfully",
            tasks: updatedTasks,
            priorityAnalysis: priorityData,
            remainingLimit: remainingLimit
        });

    } catch (error) {
        console.error("Prioritization error:", error);
        return res.status(500).json({
            type: "error",
            message: "Failed to prioritize tasks",
            error: error.message
        });
    }
};

export default connectDB(handler);
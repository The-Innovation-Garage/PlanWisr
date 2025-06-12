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

        const decoded = verifyToken(token, process.env.NEXT_PUBLIC_JWT_TOKEN);
        const userId = decoded.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ type: "error", message: "User not found" });
        }
        if (user.aiLimit <= 0) {
            return res.status(403).json({ type: "error", message: "AI limit exceeded. Please upgrade your plan." });
        }

        const { projectTitle, projectDescription, dueDate, projectId } = req.body;
        console.log("Request body:", req.body);
        if (!projectTitle || !projectDescription || !dueDate || !projectId) {
            return res.status(400).json({
                type: "error",
                message: "Missing required fields: projectTitle, projectDescription, dueDate, or projectId"
            });
        }
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

        // Updated prompt for task generation
        const prompt = `As a project management AI, analyze this project and generate essential tasks.
        Return ONLY valid JSON without any markdown formatting or additional text.
        
        Project Details:
        Title: ${projectTitle}
        Description: ${projectDescription}
        Start Date: ${new Date().toISOString()}
        Project Due Date: ${dueDate ? new Date(dueDate).toISOString() : "No specific due date provided"}
        
        Generate a comprehensive list of tasks that would be required to complete this project.
        Each task's due date should be before or equal to the project due date.
        Consider:
        1. Project scope and objectives
        2. Common project phases (planning, execution, testing, etc.)
        3. Dependencies between tasks
        4. Typical timelines
        5. Resource requirements
        
        Respond with this exact JSON structure:
        {
            "tasks": [
                {
                    "title": "Task title",
                    "description": "Detailed task description",
                    "priority": "high/medium/low",
                    "status": "not-started",
                    "dueDate": "${new Date(dueDate).toISOString().split('T')[0]}"
                }
            ]
        }
        
        Important:
        - All task due dates must be in YYYY-MM-DD format
        - All task due dates must be before or equal to ${new Date(dueDate).toISOString().split('T')[0]}`
        
        
        const result = await geminiModel.generateContent(prompt);
        const response = await result.response.text();
        
        // Clean and parse the response
        let taskData;
        try {
            const cleanResponse = response.replace(/```json|```|\n/g, '').trim();
            taskData = JSON.parse(cleanResponse);
            // console.log("Parsed task data:", taskData);

            if (!taskData.tasks || !Array.isArray(taskData.tasks)) {
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

        // Create tasks in database
        const createTasks = taskData.tasks.map(async (task) => {
            return Task.create({
                title: task.title,
                description: task.description,
                priority: task.priority || 'medium',
                status: task.status || 'not-started',
                dueDate: new Date(task.dueDate),
                project: projectId,
                createdBy: userId,
                rank: 0,
                lastPrioritized: null
            });
        });

        const createdTasks = await Promise.all(createTasks);

        // Update user's AI limit
        const updatedLimit = await User.findByIdAndUpdate(
            userId,
            { $inc: { aiLimit: -1 } }, // Using 1 credits for task generation
            { new: true }
        );

        return res.status(200).json({
            type: "success",
            message: "Tasks generated successfully",
            tasks: createdTasks,
            remainingLimit: updatedLimit.aiLimit
        });

    } catch (error) {
        console.error("Task generation error:", error);
        return res.status(500).json({
            type: "error",
            message: "Failed to generate tasks",
            error: error.message
        });
    }
};

export default connectDB(handler);
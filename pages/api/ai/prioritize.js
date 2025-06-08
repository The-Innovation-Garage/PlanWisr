import { GoogleGenerativeAI } from "@google/generative-ai";

const handler = async (req, res) => {
    const gemini_api_key = process.env.API_KEY;
    const googleAI = new GoogleGenerativeAI(gemini_api_key);
    const geminiConfig = {
        temperature: 0.9,
        topP: 1,
        topK: 1,
        maxOutputTokens: 4096,
    };

    const geminiModel = googleAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        geminiConfig,
    });

    try {
        const prompt = "Tell me about google.";
        const result = await geminiModel.generateContent(prompt);
        const response = result.response;
        console.log(response.text());
        return res.status(200).json({text: response})
      } catch (error) {
        console.log("response error", error);
        return res.status(500).json({message: "ERROR!"})
      }
}

export default handler;
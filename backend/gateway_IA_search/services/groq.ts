import Groq from "groq-sdk";
import { AIService } from "../types";

export const groqService: AIService = {
    name: "Groq",
    async chat(messages, config) {
        // Inicializamos el cliente AQUÍ ADENTRO
        const groq = new Groq({
            apiKey: process.env.GROQ_API_KEY,
        });

        const response = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: messages as any,
            stream: true,
            max_completion_tokens: config?.maxTokens,
            temperature: config?.temperature
        });

        return (async function* () {
            for await (const chunk of response) {
                yield chunk.choices[0]?.delta?.content || "";
            }
        })();
    }
};
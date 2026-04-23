import OpenAI from "openai";
import { AIService } from "../types";

const client = new OpenAI({
    apiKey: process.env.CEREBRAS_API_KEY,
    baseURL: "https://api.cerebras.ai/v1",
});

export const cerebrasService: AIService = {
    name: "Cerebras",
    async chat(messages, config) {
        const response = await client.chat.completions.create({
            model: "llama3.1-8b", // Modelo actualizado y potente
            messages,
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
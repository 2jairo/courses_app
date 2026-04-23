import OpenAI from "openai";
import { AIService } from "../types";

const client = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: "https://openrouter.ai/api/v1",
});

export const openRouterService: AIService = {
    name: "OpenRouter (Claude)",
    async chat(messages, config) {
        const response = await client.chat.completions.create({
            model: config?.model || "openrouter/auto",
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
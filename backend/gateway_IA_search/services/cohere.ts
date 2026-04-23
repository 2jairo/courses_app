import { CohereClientV2 } from "cohere-ai";
import { AIService } from "../types";

const cohere = new CohereClientV2({ token: process.env.COHERE_API_KEY });

export const cohereService: AIService = {
    name: "Cohere",
    async chat(messages, config) {
        const response = await cohere.chatStream({
            model: "command-a-03-2025", // Versión estable y activa
            messages,
            maxTokens: config?.maxTokens,
            temperature: config?.temperature
        });

        return (async function* () {
            for await (const chunk of response) {
                if (chunk.type === "content-delta") {
                    yield chunk.delta?.message?.content?.text || "";
                }
            }
        })();
    }
};
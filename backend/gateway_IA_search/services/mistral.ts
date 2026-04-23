import { AIService } from "../types";
import { Mistral } from '@mistralai/mistralai'

export const mistralService: AIService = {
    name: "Misrtal AI",
    async chat(messages, config) {
        const client = new Mistral({
            apiKey: process.env.MISTRAL_API_KEY
        });

        const chatResponse = await client.chat.complete({
            model: "mistral-tiny",
            messages,
            maxTokens: config?.maxTokens,
            temperature: config?.temperature
        });

        const rawContent = chatResponse.choices[0]?.message?.content;
        
        return (async function* () {
            yield typeof rawContent === "string"
                ? rawContent
                : Array.isArray(rawContent)
                    ? rawContent
                        .map((chunk: any) => {
                            if (typeof chunk === "string") return chunk;
                            if (chunk && typeof chunk.text === "string") return chunk.text;
                            return "";
                        })
                        .join("")
                    : "";
        })();
    }
};
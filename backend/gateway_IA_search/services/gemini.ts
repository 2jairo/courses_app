import { GoogleGenAI } from '@google/genai';
import { AIService } from '../types';

export const geminiService: AIService = {
    name: "Google Gemini",
    async chat(messages, config) {
        const ai = new GoogleGenAI({
            apiKey: process.env.GEMINI_API_KEY,
        });

        // IMPORTANTE: Mapeamos los mensajes para que Gemini distinga entre 
        // las instrucciones del sistema (model) y el usuario (user).
        const formattedContent = messages.map(m => ({
            role: m.role === 'system' || m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }]
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: formattedContent, // <--- Pasamos todo el array formateado
            config: {
                maxOutputTokens: config?.maxTokens,
                temperature: config?.temperature
            }
        });

        return (async function* () {
            yield response.text || "No pude generar una recomendación.";
        })();
    }
};
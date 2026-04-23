import express, { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';
import { groqService } from './services/groq';
import { cerebrasService } from './services/cerebras';
import { openRouterService } from './services/openrouter';
import { geminiService } from './services/gemini';
import { mistralService } from './services/mistral';
import { cohereService } from './services/cohere';
import { AIService, AIServiceConfig, ChatMessage } from './types';

const app = express();
app.use(cors());
app.use(express.json());


let currentServiceIndex = 0;
const services: AIService[] = [
    groqService, 
    cerebrasService, 
    openRouterService,
    geminiService, 
    mistralService, 
    cohereService
];

async function getAIRecommendation(messages: ChatMessage[], config?: AIServiceConfig, attempts = 0): Promise<{ text: string, provider: string }> {
    if (attempts >= services.length) throw new Error("Todos los proveedores de IA fallaron.");

    const service = services[currentServiceIndex];
    currentServiceIndex = (currentServiceIndex + 1) % services.length;

    try {
        const stream = await service.chat(messages, config);
        let fullText = "";
        for await (const chunk of stream) {
            fullText += chunk;
        }
        if (!fullText.trim()) {
            throw new Error(`Respuesta vacia de ${service.name}`);
        }
        return { text: fullText, provider: service.name };
    } catch (error) {
        console.error(`❌ Fallo en ${service.name}, reintentando...`);
        console.error(error)
        return getAIRecommendation(messages, config, attempts + 1);
    }
}

async function handleNLQuery(req: Request, res: Response): Promise<Response | void> {
    const { max_tokens, messages, model, temperature } = req.body ?? {};

    if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "messages debe ser un array no vacio" });
    }

    try {
        const resp = await getAIRecommendation(messages, { 
            maxTokens: max_tokens,
            temperature: temperature,
        })

        console.log(messages, resp)


        res.status(200).json({
            content: resp.text
        })

        // // Include OpenAI-compatible fields for clients expecting choices[0].message.content.
        // res.status(200).json({
        //     ...resp,
        //     id: `chatcmpl-${Date.now()}`,
        //     object: "chat.completion",
        //     created: Math.floor(Date.now() / 1000),
        //     model: model || resp.provider,
        //     choices: [
        //         {
        //             index: 0,
        //             finish_reason: "stop",
        //             message: {
        //                 role: "assistant",
        //                 content: resp.text
        //             }
        //         }
        //     ]
        // })
        
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }    
}

app.post('/generate', handleNLQuery);

const PORT = Number(process.env.PORT || 3003);
app.listen(PORT, () => {
    console.log(`🚀 Gateway NL Query listo en http://localhost:${PORT}`);
});

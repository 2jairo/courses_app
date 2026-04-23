export type Role = 'system' | 'user' | 'assistant';

export interface ChatMessage {
    role: Role;
    content: string;
}

export interface AIServiceConfig {
    maxTokens?: number
    temperature?: number
    model?: string
}

export interface AIService {
    name: string;
    chat: (messages: ChatMessage[], config?: AIServiceConfig) => Promise<AsyncIterable<string>>;
}
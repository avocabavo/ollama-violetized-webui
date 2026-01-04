export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
    includeInQuery: boolean;
    tokens?: number;
};

export type Conversation = {
    name: string;
    model: string;
    createdAt: string;
    messages: Message[];
};

export interface OllamaModel {
    name: string;
    size?: number;
    digest?: string;
    modified_at?: string;
}

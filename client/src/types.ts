export type Message = {
    role: "system" | "user" | "assistant";
    content: string;
    includeInQuery: boolean;
};

export type Conversation = {
    name: string;
    model: string;
    createdAt: string;
    messages: Message[];
};

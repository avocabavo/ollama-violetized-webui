import { useEffect, useState } from "react";
import "./ModelSelectPage.css";

const BACK_END_URL = "http://localhost:3001/api";

interface OllamaModel {
    name: string;
    size?: number;
    digest?: string;
    modified_at?: string;
}

interface OllamaTagsResponse {
    models: OllamaModel[];
}

interface ConversationSummary {
    file: string;
    name: string;
    model: string;
    createdAt: string;
}

export default function ModelSelectPage() {
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [conversationName, setConversationName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);

    useEffect(() => {
        // async function fetchModels() {
        //     try {
        //         const res = await fetch("http://localhost:3001/api/models");
        //         if (!res.ok) throw new Error("Backend error");
        //         const data: OllamaTagsResponse = await res.json();
        //         setModels(data.models ?? []);
        //     } catch (err) {
        //         setError((err as Error).message);
        //     }
        // }

        // fetchModels();

        fetch(BACK_END_URL + "/models")
            .then((r) => r.json())
            .then((d) => setModels(d.models ?? []))
            .catch(() => setError("Failed to load models"));

        fetch(BACK_END_URL + "/conversations")
            .then((r) => r.json())
            .then((d) => setConversations(d.conversations ?? []))
            .catch(() => setError("Failed to load conversations"));
    }, []);

    async function createConversation() {
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("http://localhost:3001/api/conversations", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: conversationName,
                    model: selectedModel,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error ?? "Failed to create conversation");
            }

            setSuccess(`Conversation created: ${data.name}`);
            setConversationName("");
        } catch (err) {
            setError((err as Error).message);
        }
    }

    return (
        <div className="container">
            <h1>Ollama Prompt Builder</h1>

            {error && <div className="error">{error}</div>}
            {success && <div className="success">{success}</div>}

            <label>
                Model:
                <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                >
                    <option value="">- Select a model -</option>
                    {models.map((m) => (
                        <option key={m.name} value={m.name}>
                            {m.name}
                        </option>
                    ))}
                </select>
            </label>

            <label>
                Conversation Name
                <input
                    type="text"
                    value={conversationName}
                    onChange={((e)=> setConversationName(e.target.value))}
                    placeholder="e.g. sci-fi brainstorming"
                />
            </label>

            <button
                disabled={!selectedModel || !conversationName}
                onClick={createConversation}
            >
                Create
            </button>

            {conversations.length > 0 && (
                <div className="conversations-list">
                    <h2>Existing Conversations</h2>
                    <ul>
                        {conversations.map((c) => (
                            <li key={c.file}>
                                <div className="conv-name">{c.name}</div>
                                <div className="conv-meta">
                                    {c.model} .{" "}
                                    {new Date(c.createdAt).toLocaleString()}1
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

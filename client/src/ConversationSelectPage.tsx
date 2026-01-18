import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import type { OllamaModel } from "./types";
import "./ConversationSelectPage.css";

interface ConversationSummary {
    file: string;
    name: string;
    model: string;
    createdAt: string;
}

export default function ConversationSelectPage({ onLogout }: { onLogout: () => void }) {
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [conversationName, setConversationName] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [conversations, setConversations] = useState<ConversationSummary[]>([]);

    function fetchModels() {
        fetch("/api/models")
            .then((r) => r.json())
            .then((d) => setModels(d.models ?? []))
            .catch(() => setError("Failed to load models"));
    }

    function fetchConversations() {
        fetch("/api/conversations")
            .then((r) => r.json())
            .then((d) => setConversations(d.conversations ?? []))
            .catch(() => setError("Failed to load conversations"));
    }

    useEffect(() => {
        fetchModels();
        fetchConversations();
    }, []);

    async function createConversation() {
        setError(null);
        setSuccess(null);
        try {
            const res = await fetch("/api/conversations", {
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
            fetchConversations();
        } catch (err) {
            setError((err as Error).message);
        }
    }

    return (
        <div className="container">
            <div className="nav">
                <a href="#" onClick={e => { e.preventDefault(); onLogout(); }}>
                    Logout
                </a>
            </div>

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
                className="form-button"
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
                                <Link to={`/conversation/${c.file}`} className="conv-link">
                                    <h3 className="conv-name">{c.name}</h3>
                                    <div className="conv-meta">
                                        {c.model} .{" "}
                                        {new Date(c.createdAt).toLocaleString()}1
                                    </div>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

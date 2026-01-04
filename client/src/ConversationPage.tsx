import { useEffect, useState, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import MessageCard from "./components/MessageCard";
import type { Conversation, Message, OllamaModel } from "./types";
import "./ConversationPage.css"

const BACK_END_URL = "http://localhost:3001/api";
const DEBOUNCE_UPDATE_MS = 500; // Half second debounce

export default function ConversationPage() {
    const { file } = useParams<{ file: string }>();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [running, setRunning] = useState(false);
    const [models, setModels] = useState<OllamaModel[]>([]);

    useEffect(() => {
        fetch(BACK_END_URL + "/models")
            .then((res) => res.json())
            .then((d) => setModels(d.models ?? []))
            .catch((err) => setError(err.message));
    }, []);

    const addMessage = async () => {
        const res = await fetch(
            BACK_END_URL + "/conversations/" + file + "/messages",
            { method: "POST" },
        );

        if (!res.ok) return;

        const newMessage = await res.json();

        setConversation((prev) =>
            prev
                ? { ...prev, messages: [...prev.messages, newMessage] }
                : prev
        );
    };

    const updateMessage = (
        index: number,
        patch: Partial<Message>
    ) => {
        setConversation((prev) => {
            if (!prev) return prev;

            const messages = [...prev.messages];
            messages[index] = { ...messages[index], ...patch };

            return { ...prev, messages };
        });
    };

    const deleteMessage = (index: number) => {
        setConversation((prev) => {
            if (!prev) return prev;
            const messages = prev.messages.filter((_, i) => i !== index);
            return { ...prev, messages };
        });
    };

    const moveMessage = (index: number, direction: "up" | "down") => {
        setConversation((prev) => {
            if (!prev) return prev;

            const messages = [...prev.messages];
            const newIndex = direction === "up" ? index - 1 : index + 1;

            if (newIndex < 0 || newIndex >= messages.length) {
                return prev;
            }

            [messages[index], messages[newIndex]] = [
                messages[newIndex],
                messages[index],
            ];

            return { ...prev, messages };
        });
    };

    useEffect(() => {
        fetch(BACK_END_URL + "/conversations/" + file)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load conversation");
                return res.json();
            })
            .then((data) => setConversation(data))
            .catch((err) => setError(err.message));
    }, [file]);

    const saveTimeout = useRef<number | null>(null);

    useEffect(() => {
        if (!conversation) return;

        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }

        saveTimeout.current = window.setTimeout(async () => {
            await fetch(
                BACK_END_URL + "/conversations/" + file,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(conversation),
                }
            );
        }, DEBOUNCE_UPDATE_MS);
    }, [conversation]);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        bottomRef?.current?.scrollIntoView({ behavior: "smooth" });
    }, [conversation?.messages.length]);

    const runPrompt = async () => {
        if (!conversation) return;

        const includedMessages = conversation.messages.filter(
            (m) => m.includeInQuery
        );

        const assistantIndex = conversation.messages.length;

        setConversation((prev) =>
            prev
                ? {
                    ...prev,
                    messages: [
                        ...prev.messages,
                        {
                            role: "assistant",
                            content: "",
                            includeInQuery: true,
                        },
                        {
                            role: "user",
                            content: "",
                            includeInQuery: true,
                        }
                    ]
                }
                : prev
        );

        setRunning(true);

        const res = await fetch(
            BACK_END_URL + "/run/" + file,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    model: conversation.model,
                    messages: includedMessages.map(({ role, content }) => ({
                        role,
                        content,
                    })),
                }),
            }
        );

        if (!res.body) return;

        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { value, done } = await reader.read();
            if (done) break;

            const text = decoder.decode(value);

            for (const line of text.split("\n")) {
                if (!line.trim()) continue;

                const json = JSON.parse(line);
                if (!json.message?.content) continue;

                setConversation((prev) => {
                    if (!prev) return prev;

                    const messages = [...prev.messages];
                    messages[assistantIndex] = {
                        ...messages[assistantIndex],
                        content:
                            messages[assistantIndex].content + json.message.content,
                    };

                    return { ...prev, messages };
                });
            }
        }

        setRunning(false);
    };

    const requestTokenCount = async (
        index: number,
        content: string
    ) => {
        if (!conversation) return;

        const res = await fetch(BACK_END_URL + "/tokens", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                model: conversation.model,
                text: content,
            }),
        });

        const { tokens } = await res.json();

        setConversation((prev) => {
            if (!prev) return prev;

            const messages = [...prev.messages];
            messages[index] = { ...messages[index], tokens };
            return { ...prev, messages };
        });
    };

    const totalTokens = conversation?.messages
        .filter((m) => m.includeInQuery)
        .reduce((sum, m) => sum + (m.tokens ?? 0), 0)
        ?? 0;

    if (error) {
        return <div className="container error">{error}</div>;
    }

    if (!conversation) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <Link to="/">Home</Link>
            <header className="conversation-header">
                <h1>{conversation.name}</h1>
                <div className="model">Model: {conversation.model}</div>
            </header>

            <label className="model-select">
                Model
                <select
                    value={conversation.model}
                    onChange={(e) =>
                        setConversation((prev) =>
                            prev ? { ...prev, model: e.target.value } : prev
                        )
                    }
                >
                    {models.map((model) => (
                        <option key={model.name} value={model.name}>
                            {model.name}
                        </option>
                    ))}
                </select>
            </label>

            <div className="messages">
                {conversation?.messages.map((msg, idx) => (
                    <MessageCard
                        key={idx}
                        message={msg}
                        index={idx}
                        updateMessage={updateMessage}
                        requestTokenCount={requestTokenCount}
                        deleteMessage={deleteMessage}
                        moveMessage={moveMessage}
                        lastIndex={conversation.messages.length - 1}
                    />
                ))}
            </div>

            <div className="action-row">
                <button className="add-message" onClick={addMessage}>
                    + Add Message
                </button>

                <span className="total-tokens">
                    {totalTokens} tokens
                </span>

                <button
                    className="run-prompt"
                    disabled={running}
                    onClick={runPrompt}
                >
                    ▶ Run Prompt
                </button>
            </div>

            <div ref={bottomRef} />
        </div>
    );
}

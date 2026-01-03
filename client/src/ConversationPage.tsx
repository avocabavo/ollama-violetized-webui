import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import MessageCard from "./components/MessageCard";
import type { Conversation, Message } from "./types";
import "./ConversationPage.css"

const BACK_END_URL = "http://localhost:3001/api";
const DEBOUNCE_MS = 500; // Half second debounce

export default function ConversationPage() {
    const { file } = useParams<{ file: string }>();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [running, setRunning] = useState(false);

    const addMessage = async () => {
        const res = await fetch(
            BACK_END_URL + "/conversations/" + file + "/messages",
            { method: "POST" },
        );

        if (!res.ok) return;

        const newMessage = await res.json();

        setConversation((prev)=>
            prev
                ? { ...prev, messages: [...prev.messages, newMessage] }
                : prev
        );
    };

    const updateMessage = (
        index: number,
        patch: Partial<Message>
    ) => {
        setConversation((prev)=> {
            if (!prev) return prev;

            const messages = [...prev.messages];
            messages[index] = { ...messages[index], ...patch};

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
        }, DEBOUNCE_MS);
    }, [conversation]);

    const bottomRef = useRef<HTMLDivElement | null>(null);

    useEffect(()=> {
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
                    messages: includedMessages.map(({ role, content}) => ({
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

    if (error) {
        return <div className="container error">{error}</div>;
    }

    if (!conversation) {
        return <div className="container">Loading...</div>;
    }

    return (
        <div className="container">
            <header className="conversation-header">
                <h1>{conversation.name}</h1>
                <div className="model">Model: {conversation.model}</div>
            </header>

            <div className="messages">
                {conversation?.messages.map((msg, idx) => (
                    <MessageCard
                        key={idx}
                        message={msg}
                        index={idx}
                        updateMessage={updateMessage}
                    />
                ))}
            </div>

            <button className="add-message" onClick={addMessage}>
                + Add Message
            </button>

            <button
                className="run-prompt"
                disabled={running}
                onClick={runPrompt}
            >
                ▶ Run Prompt
            </button>

            <div ref={bottomRef} />
        </div>
    );
}

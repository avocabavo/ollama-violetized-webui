import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import "./ConversationPage.css"

const BACK_END_URL = "http://localhost:3001/api";

interface Message {
    role?: string;
    content: string;
}

interface Conversation {
    name: string;
    model: string;
    createdAt: string;
    messages: Message[];
}

export default function ConversationPage() {
    const { file } = useParams<{ file: string }>();
    const [conversation, setConversation] = useState<Conversation | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetch(BACK_END_URL + "/conversations/" + file)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load conversation");
                return res.json();
            })
            .then((data) => setConversation(data))
            .catch((err) => setError(err.message));
    }, [file]);

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
                {conversation.messages.map((msg, idx) => (
                    <div key={idx} className="message">
                        <label>
                            Message {idx + 1}
                            <textarea
                                value={msg.content}
                                readOnly
                                rows={Math.max(3, msg.content.split("\n").length)}
                            />
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );
}

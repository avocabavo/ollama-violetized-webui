import { useEffect, useRef } from "react";
import type { Message } from "../types.ts";

const DEBOUNCE_RECOUNT_MS = 2000;

type Props = {
    message: Message;
    index: number;
    updateMessage: (
        index: number,
        patch: Partial<Message>
    ) => void;
    requestTokenCount: (index: number, content: string) => void;
    deleteMessage: (index: number) => void;
    moveMessage: (index: number, direction: "up" | "down") => void;
    lastIndex: number;
};

export default function MessageCard({
    message,
    index,
    updateMessage,
    requestTokenCount,
    deleteMessage,
    moveMessage,
    lastIndex
}: Props) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);

    useEffect(()=> {
        const el = textareaRef.current;
        if (!el) return;

        el.style.height = "auto";
        el.style.height = `${el.scrollHeight}px`;
    }, [message.content]);

    useEffect(() => {
        const timeout = setTimeout(() => {
            requestTokenCount(index, message.content);
        }, DEBOUNCE_RECOUNT_MS);

        return () => clearTimeout(timeout);
    }, [message.content]);

    return (
        <div className={`message-row message-${message.role}`}>
            <div className="message-actions">
                <button
                    onClick={() => moveMessage(index, "up")}
                    title="Move up"
                    disabled={index === 0}
                >▲</button>
                <button
                    onClick={() => {
                        if(confirm("Delete this message?")) deleteMessage(index);
                    }}
                    title="Delete"
                >✕</button>
                <button
                    onClick={() => moveMessage(index, "down")}
                    title="Move down"
                    disabled={index === lastIndex}
                >▼</button>
            </div>

            <div className={`message message-${message.role}`}>
                <div className="message-controls">
                    <select
                        value={message.role}
                        className="role-select"
                        onChange={(e) =>
                            updateMessage(index, {
                                role: e.target.value as Message["role"],
                            })
                        }
                    >
                        <option value="system">system</option>
                        <option value="user">user</option>
                        <option value="assistant">assistant</option>
                    </select>

                    <label>
                        <input
                            className="include-in-query"
                            type="checkbox"
                            checked={message.includeInQuery}
                            onChange={(e) =>
                                updateMessage(index, {
                                    includeInQuery: e.target.checked,
                                })
                            }
                            title="Include in Query"
                        />
                        <span className="message-card-info">{message.tokens ?? 0} tokens</span>
                    </label>
                </div>

                <textarea
                    ref={textareaRef}
                    value={message.content}
                    onChange={(e) =>
                        updateMessage(index, {
                            content: e.target.value,
                        })
                    }
                    rows={Math.max(3, message.content.split("\n").length)}
                />
            </div>
        </div>
    )
}

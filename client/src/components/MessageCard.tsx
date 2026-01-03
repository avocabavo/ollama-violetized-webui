import { useEffect, useRef } from "react";
import type { Message } from "../types.ts";

type Props = {
    message: Message;
    index: number;
    updateMessage: (
        index: number,
        patch: Partial<Message>
    ) => void;
};

export default function MessageCard({
    message,
    index,
    updateMessage,
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
            countTokens(index, message.content);
        }, 4000);

        return () => clearTimeout(timeout);
    }, [message.content]);

    return (
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
    )
}

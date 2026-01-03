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

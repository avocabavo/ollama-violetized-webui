import { useEffect, useState } from "react";
import "./ModelSelectPage.css";

interface OllamaModel {
    name: string;
    size?: number;
    digest?: string;
    modified_at?: string;
}

interface OllamaTagsResponse {
    models: OllamaModel[];
}

export default function ModelSelectPage() {
    const [models, setModels] = useState<OllamaModel[]>([]);
    const [selectedModel, setSelectedModel] = useState<string>("");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchModels() {
            try {
                const res = await fetch("http://localhost:3001/api/models");
                if (!res.ok) throw new Error("Backend error");
                const data: OllamaTagsResponse = await res.json();
                setModels(data.models ?? []);
            } catch (err) {
                setError((err as Error).message);
            }
        }

        fetchModels();
    }, []);

    return (
        <div className="container">
            <h1>Ollama Prompt Builder</h1>

            {error && <div className="error">{error}</div>}

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

            {selectedModel && (
                <p className="selected">
                    Selected model: <strong>{selectedModel}</strong>
                </p>
            )}
        </div>
    );
}

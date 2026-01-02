import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";

const app = express();
const PORT = 3001;
const OLLAMA_HOST = "http://localhost:11434";
const CONVERSATIONS_DIR = path.resolve("./conversations");

app.use(cors({origin: "http://localhost:5173"}));
app.use(express.json());

/**
 * GET /api/models
 */
app.get("/api/models", async (req, res)=> {
    try {
        const response = await fetch(OLLAMA_HOST + "/api/tags");
        const data = await response.json();
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to reach Ollama" });
    }
});

/**
 * POST /api/conversations
 * body: { name: string, model: string }
 */
app.post("/api/conversations", (req, res) => {
    const { name, model } = req.body;

    if (!name || !model) {
        return res.status(400).json({ error: "Missing name or model" });
    }

    const safeName = name.replace(/[^a-z0-9_-]/gi, "_");
    const filePath = path.join(CONVERSATIONS_DIR, `${safeName}.json`);

    if (fs.existsSync(filePath)) {
        return res.status(409).json({ error: "Conversation already exists" });
    }

    const conversation = {
        name,
        model,
        createdAt: new Date().toISOString(),
        messages: [],
        stream: false,
    };

    fs.writeFileSync(filePath, JSON.stringify(conversation, null, 2));

    res.status(201).json({ success: true, name: safeName });
});

/**
 * GET /api/conversations
 * Lists existing conversations
 */
app.get("/api/conversations", (req, res)=> {
    try {
        const files = fs.readdirSync(CONVERSATIONS_DIR);

        const conversations = files
            .filter((f)=> f.endsWith(".json"))
            .map((filename)=> {
                const filePath = path.join(CONVERSATIONS_DIR, filename);
                const data = JSON.parse(fs.readFileSync(filePath, "utf8"));

                return {
                    file: filename,
                    name: data.name,
                    model: data.model,
                    createdAt: data.createdAt,
                };
            });

            res.json({ conversations });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to list conversations" });
    }
});

app.listen(PORT, ()=> {
    console.log(`Backend listening on http://localhost:${PORT}`);
});

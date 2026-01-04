import express from "express";
import cors from "cors";
import fs from "fs";
import path from "path";
import pkg from "@dqbd/tiktoken";
const { encoding_for_model } = pkg;

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

/**
 * GET /api/conversations/:file
 * Loads a single conversation JSON
 */
app.get("/api/conversations/:file", (req, res)=> {
    const { file } = req. params;

    // Prevent path traversal
    if (!/^[a-z0-9_.-]+\.json$/.test(file)) {
        return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(CONVERSATIONS_DIR, file);

    if (!fs.existsSync(filePath)) {
        return res. status(404).json({ error: "Conversation not found" });
    }

    try {
        const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: "Failed to read conversation" });
    }
});

/**
 * POST /api/conversations/:file/messages
 */
app.post("/api/conversations/:file/messages", (req, res) => {
    const { file } = req.params;

    // Prevent path traversal
    if (!/^[a-z0-9_.-]+\.json$/.test(file)) {
        return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(CONVERSATIONS_DIR, file);

    if (!fs.existsSync(filePath)) {
        return res. status(404).json({ error: "Conversation not found" });
    }

    try {
        const convo = JSON.parse(fs.readFileSync(filePath, "utf-8"));

        const newMessage = {
            role: convo.messages.length == 0 ? "system" : "user",
            content: "",
            includeInQuery: true,
        };

        convo.messages.push(newMessage);

        fs.writeFileSync(filePath, JSON.stringify(convo, null, 2));

        res.json(newMessage);
    } catch (err) {
        res.status(500).json({ error: "Failed to append message to conversation" });
    }
});

/**
 * PUT /api/conversations/:file
 * Update a conversation
 */
app.put("/api/conversations/:file", (req, res) => {
    const { file } = req.params;

    // Prevent path traversal
    if (!/^[a-z0-9_.-]+\.json$/.test(file)) {
        return res.status(400).json({ error: "Invalid filename" });
    }

    const filePath = path.join(CONVERSATIONS_DIR, file);

    if (!fs.existsSync(filePath)) {
        return res. status(404).json({ error: "Conversation not found" });
    }

    try {
        fs.writeFileSync(filePath, JSON.stringify(req.body, null, 2));
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ error: "Failed to update conversation" });
    }
});

/**
 * POST /api/run/:file
 * Generate the next message in the conversation
 */
app.post("/api/run/:name", async (req, res) => {
    const { model, messages } = req.body;

    const ollamaRes = await fetch(OLLAMA_HOST + "/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model,
            messages,
            stream: true,
        }),
    });

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = ollamaRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        res.write(chunk);
    }

    res.end();
});

/**
 * POST /api/tokens
 * Counts the tokens in the given model
 */
app.post("/api/tokens", (req, res) => {
  const { text } = req.body;
  const encoding = encoding_for_model("gpt2");
  res.json({ tokens: encoding.encode(text).length });
});

app.listen(PORT, ()=> {
    console.log(`Backend listening on http://localhost:${PORT}`);
});

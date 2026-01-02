import express from "express";
import cors from "cors";

const app = express();
const PORT = 3001;
const OLLAMA_HOST = "http://localhost:11434";

app.use(cors({
    origin: "http://localhost:5173"
}));

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

app.listen(PORT, ()=> {
    console.log(`Backend listening on http://localhost:${PORT}`);
});

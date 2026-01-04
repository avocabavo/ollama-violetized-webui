# ollama-violetized-webui
interface for ollama with choice features

Specifically it is necessary to be able to edit the chat history to keep the model on track and put only moderate the size of the context window.

### How to start

1. Clone this
1. Get Ollama running on 11434 (or ssh tunnel there)
1. in `/server`
   1. `npm i`
   1. `node index.js`
1. in `/client`
   1. `npm i`
   1. `npm run dev`
1. Open http://localhost:5173 in browser

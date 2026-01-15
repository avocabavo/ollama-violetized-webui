# ollama-violetized-webui
interface for ollama with choice features

Specifically it is necessary to be able to edit the chat history to keep the model on track and put only moderate the size of the context window.

### How to start

1. Clone this
1. Get Ollama running on 11434 (or ssh tunnel there)
1. in `/server`
   1. `cp .env.example .env`
      1. Edit `server/.env` setting the session secret
   1. `cp users.json.example users.json`
      1. Edit `server/users.josn` to create users with hashed passwords.
      1. This command can be used to generate the hash `node -e "import bcrypt from 'bcrypt'; console.log(bcrypt.hashSync('yourpassword', 10))"`
   1. `npm i`
   1. `node index.js`
1. in `/client`
   1. `npm i`
   1. `npm run dev`
1. Open http://localhost:5173 in browser

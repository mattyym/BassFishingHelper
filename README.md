# Bass Fishing Recommender (Local AI)

## Run
1. Install Ollama and pull a model:
   - `ollama pull llama3.2:3b-instruct`
   - ensure `curl http://localhost:11434/api/tags` works
2. Start backend:
   - `cd server`
   - `npm install`
   - create `server/.env` (if you use cloud keys; not needed for local Ollama)
   - `npm run dev`
3. Start frontend:
   - open `index.html` with Live Server (or any static server)

## Notes
- Local AI endpoint: `POST http://localhost:3000/ai-recommend`
- Weather: OpenWeather (set key in `app.js`)
- Do NOT commit `.env` or `node_modules/`.

# Agentic Travel Demo

## Run
1. Install Node.js.
2. Install Ollama from https://ollama.com and start it.
3. Open a terminal in this folder.
4. Run `npm install`.
5. Copy `.env.example` to `.env`.
6. Pull the fast, lightweight default model with `ollama pull qwen2.5:0.5b`. If you choose another model, set `OLLAMA_MODEL` in `.env` to its exact name.
7. Run `npm start`.
8. Open http://localhost:3000

This app uses a local Ollama model for faster responses without sending your prompt to a remote API.
The model is configured with `OLLAMA_MODEL` in `.env`, and `OLLAMA_MAX_TOKENS` keeps replies shorter and snappier.
Ollama streams generated text internally, keeps the model loaded for 30 minutes between requests, and allows up to 120 seconds for slow first-time model startup. Replies are kept to five short lines to make them quick while leaving room for each requested day.

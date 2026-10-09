# Agentic Travel Demo

An AI-powered travel-planning demo. Describe a destination, trip length, budget, or preferences, and get a concise itinerary from a language model running locally with Ollama.

## Features

- Simple browser interface for entering a travel-planning request.
- Express API sends requests to a local Ollama server.
- Prompts are processed locally rather than sent to a hosted AI API.
- Model, response length, server port, and request timeout can be configured with environment variables.

> This is a planning demo, not a booking service. It does not verify live prices, availability, or travel information.

## Requirements

- Node.js 18 or newer.
- [Ollama](https://ollama.com) installed and running.
- A model downloaded in Ollama (the default is `qwen2.5:0.5b`).

## Getting started

From the project directory:

```bash
npm install
```

Copy `.env.example` to `.env`, then download the default model and start the app:

```bash
ollama pull qwen2.5:0.5b
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. Enter a request such as:

> Plan a 3-day Goa trip for 2 people under ₹30,000.

If you use a different Ollama model, set `OLLAMA_MODEL` in `.env` to its exact model name.

## Configuration

| Variable | Default | Description |
| --- | --- | --- |
| `PORT` | `3000` | Port used by the web server. |
| `OLLAMA_URL` | `http://localhost:11434` | Base URL of the Ollama server. |
| `OLLAMA_MODEL` | `qwen2.5:0.5b` | Ollama model used to generate itineraries. |
| `OLLAMA_MAX_TOKENS` | `220` | Maximum number of tokens generated for a response. |
| `OLLAMA_TIMEOUT_MS` | `120000` | Request timeout in milliseconds. |

The server asks Ollama to keep the model loaded for 30 minutes between requests. A first request may take longer while the model starts.

## API

`POST /api/agent` accepts a JSON object with a non-empty `task` string:

```json
{
  "task": "Plan a weekend in Kyoto for a first-time visitor"
}
```

On success, the response contains the generated itinerary:

```json
{
  "result": "..."
}
```

## Project structure

```text
.
├── public/       # Browser interface
├── server.js     # Express server and Ollama integration
├── .env.example  # Example local configuration
└── package.json  # Dependencies and npm scripts
```

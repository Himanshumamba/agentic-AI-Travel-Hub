import express from "express";
import "dotenv/config";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434";
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || "qwen2.5:0.5b";
const MAX_RESPONSE_TOKENS = Number(process.env.OLLAMA_MAX_TOKENS || 150);
const OLLAMA_TIMEOUT_MS = Number(process.env.OLLAMA_TIMEOUT_MS || 120000);

app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const buildTravelPrompt = (task) => `
You are a travel guide. Give useful details about the destination in the request:
what to see and do, and practical local advice. If the user gives a trip length,
cover every requested day. Keep it concise. Never repeat these instructions.
Request: ${task}
Travel details:
`.trim();

const cleanTravelResponse = (text) => {
  const instructionEcho = /\n?\s*(?:Match the number of day lines|Do not add lists|Only suggest places in the requested destination|Do not claim that anything was booked)\b[\s\S]*$/i;
  return text.replace(instructionEcho, "").trim();
};

const readOllamaStream = async (body) => {
  if (!body) {
    throw new Error("Ollama returned an empty response stream.");
  }

  const decoder = new TextDecoder();
  let buffer = "";
  let result = "";

  const parseLine = (line) => {
    if (!line.trim()) return;

    const data = JSON.parse(line);
    if (data.error) {
      throw new Error(`Ollama error: ${data.error}`);
    }
    if (typeof data.response === "string") {
      result += data.response;
    }
  };

  for await (const chunk of body) {
    buffer += decoder.decode(chunk, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";
    for (const line of lines) {
      parseLine(line);
    }
  }

  buffer += decoder.decode();
  parseLine(buffer);
  return result.trim();
};

app.post("/api/agent", async (req, res) => {
  const task = typeof req.body?.task === "string" ? req.body.task.trim() : "";

  if (!task) {
    return res.status(400).json({ error: "Task is required." });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    console.log("User task:", task);

    const response = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt: buildTravelPrompt(task),
        stream: true,
        keep_alive: "30m",
        options: {
          temperature: 0.3,
          num_predict: MAX_RESPONSE_TOKENS,
          num_ctx: 2048
        }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Ollama request failed (${response.status}): ${errorText}`);
    }

    const result = cleanTravelResponse(await readOllamaStream(response.body));

    console.log("Ollama response received");

    res.json({
      result: result || "No response generated."
    });
  } catch (error) {
    console.error("Agent error:", error);

    const message = error.name === "AbortError"
      ? `The Ollama request timed out after ${Math.round(OLLAMA_TIMEOUT_MS / 1000)} seconds. Check that Ollama is running and the model is available.`
      : error.cause?.code === "UND_ERR_HEADERS_TIMEOUT"
        ? "Ollama did not start responding in time. Check that Ollama is running and the selected model is available."
        : error.message;

    res.status(500).json({ error: message });
  } finally {
    clearTimeout(timeout);
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Agent running at http://localhost:${PORT}`);
  console.log(`Using Ollama model: ${OLLAMA_MODEL}`);
});
import express from "express";
import cors from "cors";
import "dotenv/config";

const LOCAL_MODEL = process.env.LOCAL_MODEL || "phi3:3.8b";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/chat";

const app = express();
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }));
app.use(express.json());

const WEATHER_TTL_MS = 10 * 60 * 1000;
const weatherCache = new Map();
const RATE_LIMIT = 30;
const rateBucket = new Map();

function ipOf(req) {
  return (req.headers["x-forwarded-for"] || req.socket.remoteAddress || "").toString();
}

app.get("/api/weather", async (req, res) => {
  try {
    if (!process.env.OPEN_WEATHER_KEY) {
      return res.status(500).json({ error: "Server missing OPEN_WEATHER_KEY" });
    }

    const ip = ipOf(req);
    const now = Date.now();
    const bucket = rateBucket.get(ip) || { count: 0, resetAt: now + 60_000 };
    if (now > bucket.resetAt) { bucket.count = 0; bucket.resetAt = now + 60_000; }
    bucket.count += 1; rateBucket.set(ip, bucket);
    if (bucket.count > RATE_LIMIT) {
      return res.status(429).json({ error: "Too many requests, slow down." });
    }

    const lat = Number(req.query.lat);
    const lon = Number(req.query.lon);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return res.status(400).json({ error: "lat and lon must be numbers" });
    }
    if (Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return res.status(400).json({ error: "lat/lon out of range" });
    }

    const key = `${lat.toFixed(3)}|${lon.toFixed(3)}`;
    const cached = weatherCache.get(key);
    if (cached && cached.expiresAt > now) {
      return res.json(cached.data);
    }

    const url = new URL("https://api.openweathermap.org/data/2.5/weather");
    url.searchParams.set("lat", lat.toString());
    url.searchParams.set("lon", lon.toString());
    url.searchParams.set("units", "imperial");
    url.searchParams.set("appid", process.env.OPEN_WEATHER_KEY);

    const r = await fetch(url.toString(), { headers: { Accept: "application/json" } });
    const data = await r.json();
    if (!r.ok) {
      return res.status(r.status).json({ error: data?.message || "Upstream error", upstream: data });
    }

    weatherCache.set(key, { data, expiresAt: now + WEATHER_TTL_MS });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: String(e) });
  }
});

app.post("/ai-recommend", async (req, res) => {
  try {
    const conditions = req.body;

    const example = {
      recommendations: [
        { lure: '3.5" tube', color: "green pumpkin", weight: "3/16 oz", technique: "drag across rock", why: ["matches craws", "cold water friendly"] }
      ],
      notes: ["Clear water → natural colors"]
    };

    const system = [
      "You are a professional bass fishing guide.",
      "Return ONLY valid JSON matching the provided keys: recommendations(array) and notes(array).",
      "No extra text, no markdown, no explanations outside JSON.",
      "2–4 options, short technique lines, no brand names, follow typical US-legal rigs."
    ].join(" ");

    const user = {
      task: "Recommend the best baits/techniques for bass today.",
      schema_example: example,
      conditions
    };

    const body = {
      model: LOCAL_MODEL,
      format: "json",
      stream: false,
      messages: [
        { role: "system", content: system },
        { role: "user", content: JSON.stringify(user) }
      ],
      options: {
        temperature: 0.6,
        num_ctx: 4096
      }
    };

    const r = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    if (!r.ok) {
      const msg = await r.text();
      return res.status(500).json({ error: `Ollama error ${r.status}: ${msg}` });
    }

    const data = await r.json();
    const text = data?.message?.content?.trim() || "{}";
    const json = JSON.parse(text);

    if (!Array.isArray(json.recommendations)) {
      throw new Error("Model JSON missing 'recommendations' array");
    }

    res.json(json);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err?.message || err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Local AI backend on http://localhost:${PORT} using model ${LOCAL_MODEL}`);
});

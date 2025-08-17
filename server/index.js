import express from "express";
import cors from "cors";

const LOCAL_MODEL = process.env.LOCAL_MODEL || "phi3:3.8b";
const OLLAMA_URL = process.env.OLLAMA_URL || "http://localhost:11434/api/chat"

const app = express();
app.use(cors({ origin: [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/] }));
app.use(express.json());

app.post("/ai-recommend", async (req, res) => {
  try {
    const conditions = req.body; 

    
    const example = {
      recommendations: [
        { lure: "3.5\" tube", color: "green pumpkin", weight: "3/16 oz", technique: "drag across rock", why: ["matches craws", "cold water friendly"] }
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
            {role: "system", content: system},
            {role: "user", content: JSON.stringify(user)}
        ],
        options: {
            temperature: 0.6,
            num_ctx: 4096
        }
    };

    const r = await fetch(OLLAMA_URL, {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(body)
    });

    if (!r.ok) {
        const msg = await r.text();
        return res.status(500).json({error: `Ollama error ${r.status}: ${msg}` });
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
    res.status(500).json({error: String(err?.message || err) });
}

});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Local AI backend on http://localhost:${PORT} using model ${LOCAL_MODEL}`);
});

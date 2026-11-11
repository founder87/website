// Gemini API connector for executive briefings, live studio analytics Q&A, and support/press reply drafting.

const DEFAULT_MODEL = "gemini-2.5-flash";

const STUDIO_GROUNDING = `You are the private internal Studio Intelligence assistant inside Solivant Studios HQ (solivantstudios.com).
Facts you must respect strictly:
- Studio name: Solivant Studios. Motto: Mundi sine fine.
- Official email: contact@solivantstudios.com.
- Initial release in development: Byzantium (set circa 1000 AD across Constantinople and the Eastern Roman Empire; raise timber and stone fortifications, engineer siege weapons, and command disciplined battlefield formations; powered by hyperoptimized custom engine technology for physical realism and broad device reach).
- Upcoming codenamed projects (unannounced details): Hexagonal, Cubes, Horizon.
- Style rules: Be direct, concise, analytical, and factual. Never invent unannounced game features, release dates, or numbers not present in the provided telemetry. Never use em dashes.`;

export function hasGeminiConfig(env) {
  return Boolean(String(env.GEMINI_API_KEY || "").trim());
}

async function callGemini(env, { systemInstruction, contents, temperature = 0.25, maxOutputTokens = 900 }) {
  const apiKey = String(env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured yet.");
  }
  const model = String(env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  if (!/^[a-z0-9.-]+$/i.test(model)) {
    throw new Error("Invalid GEMINI_MODEL identifier.");
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "x-goog-api-key": apiKey,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction }] },
        contents,
        generationConfig: {
          temperature,
          maxOutputTokens,
        },
      }),
    },
  );

  if (!res.ok) {
    throw new Error(`Gemini API returned HTTP ${res.status}.`);
  }
  const data = await res.json();
  const text = (data.candidates?.[0]?.content?.parts || [])
    .map(part => part.text || "")
    .join("")
    .trim();
  return text.replace(/\u2014/g, " - ");
}

export async function generateExecutiveBrief(env, snapshot) {
  if (!hasGeminiConfig(env)) {
    return {
      connected: false,
      setupHint: "Set GEMINI_API_KEY to enable the daily executive summary, studio analyst chat, and one-click email reply drafting.",
    };
  }
  try {
    const prompt = `Produce a crisp 3 to 4 bullet executive studio briefing from this live Solivant Studios HQ snapshot.
Highlight: (1) website traffic and Byzantium interest, (2) Steam and App Store sales status, and (3) any unread or notable contact@solivantstudios.com inbox activity. If a data source is not connected yet, note that briefly in one phrase without padding.

LIVE SNAPSHOT JSON:
${JSON.stringify(snapshot)}`;

    const summary = await callGemini(env, {
      systemInstruction: STUDIO_GROUNDING,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.2,
      maxOutputTokens: 450,
    });
    return { connected: true, summary };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Failed to generate Gemini executive brief.",
    };
  }
}

export async function askStudioAnalyst(env, { history = [], question, snapshot }) {
  const cleanQuestion = String(question || "").trim();
  if (!cleanQuestion || cleanQuestion.length > 4000) {
    throw new Error("Question must be between 1 and 4,000 characters.");
  }
  const trimmedHistory = Array.isArray(history)
    ? history
        .slice(-10)
        .filter(item => item && (item.role === "user" || item.role === "model") && typeof item.text === "string")
        .map(item => ({
          role: item.role,
          parts: [{ text: item.text.slice(0, 4000) }],
        }))
    : [];

  const systemInstruction = `${STUDIO_GROUNDING}

LIVE TELEMETRY SNAPSHOT (GA4, Steamworks, Apple App Store Connect, and contact@solivantstudios.com inbox):
${JSON.stringify(snapshot)}`;

  const answer = await callGemini(env, {
    systemInstruction,
    contents: [...trimmedHistory, { role: "user", parts: [{ text: cleanQuestion }] }],
    temperature: 0.25,
    maxOutputTokens: 900,
  });
  return { answer };
}

export async function draftInboxReply(env, { message, guidance = "" }) {
  const cleanGuidance = String(guidance || "").trim().slice(0, 1000);
  const prompt = `Draft a professional, warm, and concise plain-text email reply on behalf of Solivant Studios (contact@solivantstudios.com) to the incoming email below.
- Do not include Subject: headers in the body; write only the email body ready for human review before sending.
- Do not make unannounced promises, release date commitments, or legal admissions.
- Sign off cleanly as "Solivant Studios".
${cleanGuidance ? `\nFounder guidance for this reply: ${cleanGuidance}\n` : ""}
INCOMING EMAIL:
From: ${message.from}
Subject: ${message.subject}
Date: ${message.date}

${String(message.body || "").slice(0, 8000)}`;

  const draft = await callGemini(env, {
    systemInstruction: STUDIO_GROUNDING,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    temperature: 0.3,
    maxOutputTokens: 700,
  });
  return { draft };
}

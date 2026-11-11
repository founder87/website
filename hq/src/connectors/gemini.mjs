// Gemini API connector: Executive Briefing, Batch Inbox Triage & Prep, Reply Composer Presets, and Studio Analyst.

const DEFAULT_MODEL = "gemini-2.5-flash";

const STUDIO_GROUNDING = `You are the private Chief-of-Staff Intelligence inside Solivant Studios HQ (solivantstudios.com).
Facts you must strictly respect:
- Studio name: Solivant Studios. Motto: Mundi sine fine.
- Official email: contact@solivantstudios.com.
- Initial release in development: Byzantium (set circa 1000 AD across Constantinople and the Eastern Roman Empire; raise timber and stone fortifications, engineer siege weapons, and command disciplined battlefield formations; built on hyperoptimized custom engine technology for physical realism and broad device reach).
- Upcoming codenamed projects (unannounced details): Hexagonal, Cubes, Horizon.
- Style rules: Sharp, calm, executive clarity. Never invent unannounced features, release dates, or numbers absent from provided telemetry. Never use em dashes.`;

export function hasGeminiConfig(env) {
  return Boolean(String(env.GEMINI_API_KEY || "").trim());
}

async function callGemini(env, { systemInstruction, contents, temperature = 0.25, maxOutputTokens = 1100, responseMimeType }) {
  const apiKey = String(env.GEMINI_API_KEY || "").trim();
  if (!apiKey) {
    throw new Error("Add your GEMINI_API_KEY in Connections (top right) to activate live Gemini intelligence.");
  }
  const model = String(env.GEMINI_MODEL || DEFAULT_MODEL).trim();
  if (!/^[a-z0-9.-]+$/i.test(model)) {
    throw new Error("Invalid GEMINI_MODEL identifier.");
  }

  const generationConfig = { temperature, maxOutputTokens };
  if (responseMimeType) generationConfig.responseMimeType = responseMimeType;

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
        generationConfig,
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
      setupHint: "Click Connections in the top bar and paste your GEMINI_API_KEY to activate Daily Briefs, Email Prep, and Analyst Chat.",
    };
  }
  try {
    const prompt = `Write a sharp founder's Daily Studio Brief from this Solivant Studios HQ snapshot.
Format into 4 crisp labeled lines:
- PULSE: Website momentum and Byzantium interest
- REVENUE: Steamworks and App Store status
- INBOX: Priority unread correspondence at contact@solivantstudios.com
- NEXT MOVE: One concrete high-leverage focus for today

SNAPSHOT JSON:
${JSON.stringify(snapshot)}`;

    const summary = await callGemini(env, {
      systemInstruction: STUDIO_GROUNDING,
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      temperature: 0.2,
      maxOutputTokens: 550,
    });
    return { connected: true, summary };
  } catch (error) {
    return {
      connected: false,
      error: error instanceof Error ? error.message : "Failed to generate Gemini brief.",
    };
  }
}

export async function askStudioAnalyst(env, { history = [], question, snapshot }) {
  const cleanQuestion = String(question || "").trim();
  if (!cleanQuestion || cleanQuestion.length > 4000) {
    throw new Error("Question must be between 1 and 4,000 characters.");
  }
  if (!hasGeminiConfig(env)) {
    return {
      connected: false,
      setupHint: "Click Connections (top right) and paste your GEMINI_API_KEY to activate live Studio Analyst answers.",
    };
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

LIVE TELEMETRY SNAPSHOT:
${JSON.stringify(snapshot)}`;

  const answer = await callGemini(env, {
    systemInstruction,
    contents: [...trimmedHistory, { role: "user", parts: [{ text: cleanQuestion }] }],
    temperature: 0.25,
    maxOutputTokens: 1000,
  });
  return { connected: true, answer };
}

const TONE_INSTRUCTIONS = {
  warm: "Warm, poised, and concise studio correspondence.",
  press: "Press and media relations tone: appreciative of coverage interest, factual about Byzantium (circa 1000 AD Eastern Roman frontier, fortifications, siegecraft, formations, custom engine), and clear that preview assets/dates will be shared as milestones lock.",
  support: "Helpful, empathetic player support triage: acknowledge the issue clearly, ask for platform/OS details if missing, and reassure them.",
  decline: "Gracious, firm executive decline without over-explaining.",
  exec: "Ultra-brief 2 to 3 sentence founder confirmation.",
};

const REFINE_INSTRUCTIONS = {
  tighten: "Cut length by roughly 30% while keeping warmth and precision.",
  warmer: "Make the tone slightly more personal and welcoming while staying concise.",
  factcheck: "Audit the draft strictly against Solivant Studios announced facts, removing any unannounced dates, specs, or promises.",
};

export async function draftInboxReply(env, { message, guidance = "", tone = "warm", refineAction = "", currentDraft = "" }) {
  if (!hasGeminiConfig(env)) {
    return {
      connected: false,
      setupHint: "Add GEMINI_API_KEY in Connections to activate live Gemini reply drafting and custom rewrites.",
    };
  }
  const toneGuide = TONE_INSTRUCTIONS[tone] || TONE_INSTRUCTIONS.warm;
  const refineGuide = REFINE_INSTRUCTIONS[refineAction] || "";
  const cleanGuidance = String(guidance || "").trim().slice(0, 1000);

  const prompt = `Analyze the incoming email to contact@solivantstudios.com and prepare a reply package as JSON with keys:
- "category": one of "PRESS", "SUPPORT", "PARTNERSHIP", "COMMUNITY", "GENERAL"
- "priority": one of "HIGH", "NORMAL", "LOW"
- "gist": 1 concise sentence summarizing what the sender wants and any key context
- "draft": plain-text email reply body ready for human approval (no Subject line, signed off as "Solivant Studios")

Tone preset: ${toneGuide}
${refineGuide ? `Refinement instruction on existing draft: ${refineGuide}\nExisting draft:\n${String(currentDraft || "").slice(0, 4000)}\n` : ""}
${cleanGuidance ? `Founder direction: ${cleanGuidance}\n` : ""}

INCOMING EMAIL:
From: ${message.from}
Subject: ${message.subject}
Date: ${message.date}

${String(message.body || message.snippet || "").slice(0, 8000)}`;

  const raw = await callGemini(env, {
    systemInstruction: STUDIO_GROUNDING,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    temperature: 0.25,
    maxOutputTokens: 900,
    responseMimeType: "application/json",
  });

  try {
    const parsed = JSON.parse(raw);
    return {
      connected: true,
      category: String(parsed.category || "GENERAL").toUpperCase(),
      priority: String(parsed.priority || "NORMAL").toUpperCase(),
      gist: String(parsed.gist || "").replace(/\u2014/g, " - "),
      draft: String(parsed.draft || "").replace(/\u2014/g, " - "),
    };
  } catch {
    return { connected: true, category: "GENERAL", priority: "NORMAL", gist: "", draft: raw };
  }
}

export async function prepInboxBatch(env, { messages = [] }) {
  const items = messages.slice(0, 8).map(m => ({
    id: m.id,
    from: m.from,
    subject: m.subject,
    snippet: m.snippet,
  }));
  if (!items.length) return { connected: hasGeminiConfig(env), items: [] };
  if (!hasGeminiConfig(env)) {
    return {
      connected: false,
      items: [],
      setupHint: "Add GEMINI_API_KEY in Connections to activate live batch inbox triage.",
    };
  }

  const prompt = `Triage and prep these incoming contact@solivantstudios.com emails for the founder.
Return a JSON object: { "items": [ { "id": "...", "category": "PRESS|SUPPORT|PARTNERSHIP|COMMUNITY|GENERAL", "priority": "HIGH|NORMAL|LOW", "gist": "1-line summary of what they need", "draft": "Concise ready-to-review plain-text reply signed Solivant Studios" } ] }.

EMAILS:
${JSON.stringify(items)}`;

  const raw = await callGemini(env, {
    systemInstruction: STUDIO_GROUNDING,
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    temperature: 0.2,
    maxOutputTokens: 1800,
    responseMimeType: "application/json",
  });

  const parsed = JSON.parse(raw);
  return {
    connected: true,
    items: Array.isArray(parsed.items) ? parsed.items : [],
  };
}

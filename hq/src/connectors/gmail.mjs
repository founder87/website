// Google Workspace Gmail API connector for contact@solivantstudios.com.
import { fromBase64Url, toBase64Url } from "../crypto.mjs";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

let cachedGmailToken = { accessToken: "", expiresAtMs: 0, clientId: "" };

function hasGmailConfig(env) {
  return Boolean(
    String(env.GMAIL_CLIENT_ID || "").trim() &&
      String(env.GMAIL_CLIENT_SECRET || "").trim() &&
      String(env.GMAIL_REFRESH_TOKEN || "").trim(),
  );
}

async function getGmailAccessToken(env) {
  const clientId = String(env.GMAIL_CLIENT_ID || "").trim();
  const clientSecret = String(env.GMAIL_CLIENT_SECRET || "").trim();
  const refreshToken = String(env.GMAIL_REFRESH_TOKEN || "").trim();
  const nowMs = Date.now();

  if (cachedGmailToken.accessToken && cachedGmailToken.clientId === clientId && cachedGmailToken.expiresAtMs - 60_000 > nowMs) {
    return cachedGmailToken.accessToken;
  }

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Gmail OAuth refresh failed (${res.status}).`);
  }
  const data = await res.json();
  cachedGmailToken = {
    accessToken: data.access_token,
    expiresAtMs: nowMs + Number(data.expires_in || 3600) * 1000,
    clientId,
  };
  return cachedGmailToken.accessToken;
}

function getHeader(headers, name) {
  const target = name.toLowerCase();
  const found = (headers || []).find(h => String(h.name || "").toLowerCase() === target);
  return found?.value || "";
}

function stripHtmlTags(html) {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function extractPlainBody(payload) {
  if (!payload) return "";
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    try {
      return decoder.decode(fromBase64Url(payload.body.data));
    } catch {
      return "";
    }
  }
  if (Array.isArray(payload.parts)) {
    for (const part of payload.parts) {
      if (part.mimeType === "text/plain") {
        const text = extractPlainBody(part);
        if (text) return text;
      }
    }
    for (const part of payload.parts) {
      const nested = extractPlainBody(part);
      if (nested) return nested;
    }
  }
  if (payload.mimeType === "text/html" && payload.body?.data) {
    try {
      return stripHtmlTags(decoder.decode(fromBase64Url(payload.body.data)));
    } catch {
      return "";
    }
  }
  return "";
}

export function sanitizeHeaderLine(value) {
  return String(value || "").replace(/[\r\n]+/g, " ").trim();
}

export function buildReplyMime({ fromAddress, toAddress, subject, bodyText, inReplyTo, references }) {
  const cleanTo = sanitizeHeaderLine(toAddress);
  const cleanFrom = sanitizeHeaderLine(fromAddress);
  const rawSubject = sanitizeHeaderLine(subject);
  if (!cleanTo || !/@/.test(cleanTo)) {
    throw new Error("Recipient email address is invalid.");
  }
  const replySubject = /^re:/i.test(rawSubject) ? rawSubject : `Re: ${rawSubject}`;
  const encodedSubject = `=?UTF-8?B?${btoa(String.fromCharCode(...encoder.encode(replySubject)))}?=`;
  const lines = [
    `From: Solivant Studios <${cleanFrom}>`,
    `To: ${cleanTo}`,
    `Subject: ${encodedSubject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
  ];
  if (inReplyTo) lines.push(`In-Reply-To: ${sanitizeHeaderLine(inReplyTo)}`);
  if (references) lines.push(`References: ${sanitizeHeaderLine(references)}`);
  lines.push("", String(bodyText || "").replace(/\r?\n/g, "\r\n"));
  return toBase64Url(encoder.encode(lines.join("\r\n")));
}

export async function fetchInboxSummary(env) {
  const inboxAddress = String(env.HQ_INBOX_ADDRESS || env.HQ_ADMIN_EMAIL || "contact@solivantstudios.com").trim();
  if (!hasGmailConfig(env)) {
    return {
      connected: false,
      provider: "Google Workspace (Gmail)",
      inboxAddress,
      setupHint: "Set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, and GMAIL_REFRESH_TOKEN to read and reply to contact@solivantstudios.com here.",
    };
  }

  try {
    const token = await getGmailAccessToken(env);
    const [inboxLabelRes, listRes] = await Promise.all([
      fetch("https://gmail.googleapis.com/gmail/v1/users/me/labels/INBOX", {
        headers: { authorization: `Bearer ${token}` },
      }),
      fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=12&q=in%3Ainbox", {
        headers: { authorization: `Bearer ${token}` },
      }),
    ]);

    if (!listRes.ok) throw new Error(`Gmail messages.list returned HTTP ${listRes.status}.`);
    const labelJson = inboxLabelRes.ok ? await inboxLabelRes.json() : {};
    const listJson = await listRes.json();
    const stubs = Array.isArray(listJson.messages) ? listJson.messages : [];

    const messages = await Promise.all(
      stubs.map(async stub => {
        const msgRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(stub.id)}?format=metadata&metadataHeaders=From&metadataHeaders=Subject&metadataHeaders=Date`,
          { headers: { authorization: `Bearer ${token}` } },
        );
        if (!msgRes.ok) return null;
        const msg = await msgRes.json();
        const headers = msg.payload?.headers || [];
        return {
          id: msg.id,
          threadId: msg.threadId,
          unread: Array.isArray(msg.labelIds) && msg.labelIds.includes("UNREAD"),
          from: getHeader(headers, "From") || "Unknown sender",
          subject: getHeader(headers, "Subject") || "(No subject)",
          date: getHeader(headers, "Date") || "",
          snippet: msg.snippet || "",
        };
      }),
    );

    return {
      connected: true,
      provider: "Google Workspace (Gmail)",
      inboxAddress,
      unreadCount: Number(labelJson.messagesUnread || 0),
      totalInbox: Number(labelJson.messagesTotal || 0),
      messages: messages.filter(Boolean),
    };
  } catch (error) {
    return {
      connected: false,
      provider: "Google Workspace (Gmail)",
      inboxAddress,
      error: error instanceof Error ? error.message : "Failed to load Gmail inbox.",
    };
  }
}

export async function fetchInboxMessageDetail(env, messageId) {
  if (!hasGmailConfig(env)) {
    throw new Error("Gmail API credentials are not configured yet.");
  }
  if (!/^[a-zA-Z0-9_-]{4,64}$/.test(String(messageId || ""))) {
    throw new Error("Invalid message ID.");
  }
  const token = await getGmailAccessToken(env);
  const res = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages/${encodeURIComponent(messageId)}?format=full`,
    { headers: { authorization: `Bearer ${token}` } },
  );
  if (!res.ok) throw new Error(`Gmail messages.get returned HTTP ${res.status}.`);
  const msg = await res.json();
  const headers = msg.payload?.headers || [];
  const replyTo = getHeader(headers, "Reply-To") || getHeader(headers, "From");
  return {
    id: msg.id,
    threadId: msg.threadId,
    unread: Array.isArray(msg.labelIds) && msg.labelIds.includes("UNREAD"),
    from: getHeader(headers, "From"),
    replyTo,
    to: getHeader(headers, "To"),
    subject: getHeader(headers, "Subject") || "(No subject)",
    date: getHeader(headers, "Date"),
    messageIdHeader: getHeader(headers, "Message-ID"),
    referencesHeader: getHeader(headers, "References"),
    body: extractPlainBody(msg.payload) || msg.snippet || "",
  };
}

export async function sendApprovedReply(env, { messageId, bodyText }) {
  if (!hasGmailConfig(env)) {
    throw new Error("Gmail API credentials are not configured yet.");
  }
  const trimmedBody = String(bodyText || "").trim();
  if (!trimmedBody || trimmedBody.length > 20_000) {
    throw new Error("Reply body must be between 1 and 20,000 characters.");
  }
  const original = await fetchInboxMessageDetail(env, messageId);
  const fromAddress = String(env.HQ_INBOX_ADDRESS || env.HQ_ADMIN_EMAIL || "contact@solivantstudios.com").trim();
  const references = [original.referencesHeader, original.messageIdHeader].filter(Boolean).join(" ").trim();
  const raw = buildReplyMime({
    fromAddress,
    toAddress: original.replyTo || original.from,
    subject: original.subject,
    bodyText: trimmedBody,
    inReplyTo: original.messageIdHeader,
    references,
  });

  const token = await getGmailAccessToken(env);
  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      raw,
      threadId: original.threadId,
    }),
  });
  if (!res.ok) {
    throw new Error(`Gmail messages.send failed with HTTP ${res.status}.`);
  }
  const sent = await res.json();
  return { sent: true, id: sent.id, threadId: sent.threadId };
}

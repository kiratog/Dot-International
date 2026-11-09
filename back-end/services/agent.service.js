
import { randomUUID } from "node:crypto";
import { generateReply } from "./ai.service.js";

const conversations = new Map();

const MAX_HISTORY_MESSAGES = 20;
const MAX_CONVERSATIONS = 1000;
const SESSION_TTL = 30 * 60 * 1000;

function cleanExpiredSessions() {

    const now = Date.now();

    for (const [id, session] of conversations) {

        if (now - session.updatedAt > SESSION_TTL) {
            conversations.delete(id);
        }
    }
}

export async function processMessage(message, sessionId) {

    cleanExpiredSessions();

    let id = sessionId;

    if (!id || typeof id !== "string" || id.length > 100) {
        id = randomUUID();
    }

    let session = conversations.get(id);

    if (!session) {

        if (conversations.size >= MAX_CONVERSATIONS) {
            const oldestId = conversations.keys().next().value;
            conversations.delete(oldestId);
        }

        session = {
            history: [],
            updatedAt: Date.now()
        };
    }
    

    const result = await generateReply(
        message,
        session.history
    );
    

    session.history = result.history.slice(
        -MAX_HISTORY_MESSAGES
    );

    session.updatedAt = Date.now();

    conversations.set(id, session);

    return {
        sessionId: id,
        reply: result.reply
    };
}

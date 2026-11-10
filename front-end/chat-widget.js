(() => {
  "use strict";

  const root = document.querySelector("[data-dot-chat]");
  if (!root) return;

  // Change apiBaseUrl for production. Do not put your Gemini API key here.
  // Add DOT's verified WhatsApp number as digits only (country code + number).
  window.DOT_CHAT_CONFIG = window.DOT_CHAT_CONFIG || {
    apiBaseUrl: "https://dot-international.onrender.com",
    whatsappNumber: ""
  };

  const config = window.DOT_CHAT_CONFIG;
  const apiBaseUrl = String(config.apiBaseUrl || "http://localhost:3000").replace(/\/+$/, "");
  const whatsappNumber = String(config.whatsappNumber || "").replace(/\D/g, "");
  const sessionKey = "dot_international_chat_session";

  const panel = root.querySelector(".dot-chat__panel");
  const toggleButton = root.querySelector("[data-dot-chat-toggle]");
  const closeButtons = root.querySelectorAll("[data-dot-chat-close]");
  const messageList = root.querySelector("[data-dot-chat-messages]");
  const composer = root.querySelector("[data-dot-chat-form]");
  const input = root.querySelector("[data-dot-chat-form] input[name='message']");
  const sendButton = root.querySelector("[data-dot-chat-send]");
  const suggestions = root.querySelector("[data-dot-chat-suggestions]");

  let isSending = false;
  let lastFocusedElement = null;
  const transcript = [];

  function openChat() {
    lastFocusedElement = document.activeElement;
    root.classList.add("is-open");
    toggleButton.setAttribute("aria-expanded", "true");
    toggleButton.setAttribute("aria-label", "Close DOT chat assistant");
    panel.setAttribute("aria-hidden", "false");
    window.setTimeout(() => input.focus(), 120);
  }

  function closeChat() {
    root.classList.remove("is-open");
    toggleButton.setAttribute("aria-expanded", "false");
    toggleButton.setAttribute("aria-label", "Open DOT chat assistant");
    panel.setAttribute("aria-hidden", "true");
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function scrollToLatest() {
    messageList.scrollTop = messageList.scrollHeight;
  }

  function createAssistantAvatar() {
    const avatar = document.createElement("div");
    avatar.className = "dot-chat__avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "D";
    return avatar;
  }

  function addMessage(text, sender) {
    const row = document.createElement("div");
    row.className = sender === "user"
      ? "dot-chat__message-row dot-chat__message-row--user"
      : "dot-chat__message-row";

    const bubble = document.createElement("div");
    bubble.className = sender === "user"
      ? "dot-chat__bubble dot-chat__bubble--user"
      : "dot-chat__bubble dot-chat__bubble--assistant";
    // Use textContent so visitor input is never interpreted as HTML.
    bubble.textContent = text;

    if (sender === "assistant") {
      const content = document.createElement("div");
      content.className = "dot-chat__message-content";
      content.appendChild(bubble);
      row.append(createAssistantAvatar(), content);
    } else {
      row.appendChild(bubble);
    }

    messageList.appendChild(row);
    scrollToLatest();
    return row;
  }

  function addError(text) {
    const error = document.createElement("div");
    error.className = "dot-chat__error";
    error.setAttribute("role", "alert");
    error.textContent = text;
    messageList.appendChild(error);
    scrollToLatest();
  }

  function addTypingIndicator() {
    const row = document.createElement("div");
    row.className = "dot-chat__message-row";
    row.dataset.dotTyping = "true";
    const content = document.createElement("div");
    content.className = "dot-chat__message-content";
    const typing = document.createElement("div");
    typing.className = "dot-chat__typing";
    typing.setAttribute("aria-label", "DOT assistant is typing");
    typing.innerHTML = "<span></span><span></span><span></span>";
    content.appendChild(typing);
    row.append(createAssistantAvatar(), content);
    messageList.appendChild(row);
    scrollToLatest();
    return row;
  }

  function buildEnquirySummary() {
    const lines = transcript.slice(-12).map(({ role, text }) => {
      return `${role === "user" ? "Visitor" : "DOT Assistant"}: ${text}`;
    });
    return [
      "Hello DOT International, I'd like to discuss a project.",
      "",
      "Conversation summary:",
      ...lines
    ].join("\n");
  }

  function sendToContactForm() {
    const formSection = document.querySelector("#contact");
    const messageField = formSection?.querySelector('textarea[name="message"]');
    if (messageField) {
      const existing = messageField.value.trim();
      const summary = buildEnquirySummary();
      messageField.value = existing ? `${existing}\n\n${summary}` : summary;
      messageField.dispatchEvent(new Event("input", { bubbles: true }));
    }
    closeChat();
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => messageField?.focus({ preventScroll: true }), 550);
    } else {
      window.location.hash = "contact";
    }
  }

  function makeWhatsAppUrl() {
    if (!/^\d{10,15}$/.test(whatsappNumber)) return "";
    const url = new URL(`https://wa.me/${whatsappNumber}`);
    url.searchParams.set("text", buildEnquirySummary());
    return url.toString();
  }

  function renderActions(actionList) {
    if (!Array.isArray(actionList) || actionList.length === 0) return;
    const wrapper = document.createElement("div");
    wrapper.className = "dot-chat__actions";

    actionList.forEach((action) => {
      if (!action || typeof action !== "object") return;
      const type = String(action.type || "");
      const label = String(action.label || "").trim();
      if (!label) return;

      if (type === "contact_form") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "dot-chat__action";
        button.textContent = label;
        button.addEventListener("click", sendToContactForm);
        wrapper.appendChild(button);
      } else if (type === "whatsapp") {
        const href = makeWhatsAppUrl();
        if (!href) return; // Hidden until DOT's verified number is configured.
        const link = document.createElement("a");
        link.className = "dot-chat__action dot-chat__action--secondary";
        link.href = href;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = label;
        wrapper.appendChild(link);
      } else if (type === "quick_reply") {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "dot-chat__action dot-chat__action--secondary";
        button.textContent = label;
        button.addEventListener("click", () => sendMessage(String(action.payload || label)));
        wrapper.appendChild(button);
      }
    });

    if (wrapper.childElementCount) {
      messageList.appendChild(wrapper);
      scrollToLatest();
    }
  }

  function inferActions() {
    // Consider the full visitor-side conversation, not only their latest short answer
    // (for example, "Bengaluru" after they already said they are planning an exhibition).
    const text = transcript
      .filter((entry) => entry.role === "user")
      .map((entry) => entry.text)
      .join(" ")
      .toLowerCase();
    const asksForPerson = /\b(human|real person|someone|representative|speak|talk to|call|phone|team member|person from dot)\b/.test(text);
    const asksToContact = /\b(contact|enquir|quote|quotation|price|pricing|cost|budget|hire|work with|start a project|book|proposal|submit|send.*enquir)\b/.test(text);
    const projectContext = /\b(exhibition|event|booth|stall|interior|project|design|venue|space|organis|planning)\b/.test(text);

    const actions = [];
    if (asksForPerson && makeWhatsAppUrl()) {
      actions.push({ type: "whatsapp", label: "Talk to the DOT team on WhatsApp" });
    }
    if (asksToContact || projectContext || asksForPerson) {
      actions.push({
        type: "contact_form",
        label: asksForPerson && !makeWhatsAppUrl() ? "Send a message to the DOT team" : "Share your project details"
      });
    }
    return actions;
  }

  function extractResponse(payload) {
    const data = payload?.data ?? payload;
    const reply = data?.reply ?? data?.message;
    if (typeof reply !== "string" || !reply.trim()) {
      throw new Error("The chat API returned an unexpected response. Check the backend response format.");
    }
    return {
      reply: reply.trim(),
      actions: Array.isArray(data?.actions) ? data.actions : null,
      sessionId: typeof data?.sessionId === "string" ? data.sessionId : null
    };
  }

  async function sendMessage(rawMessage) {
    const message = String(rawMessage || "").trim();
    if (!message || isSending) return;

    isSending = true;
    input.value = "";
    input.disabled = true;
    sendButton.disabled = true;
    if (suggestions) suggestions.hidden = true;

    addMessage(message, "user");
    transcript.push({ role: "user", text: message });
    const typing = addTypingIndicator();

    try {
      const payload = { message };
      const existingSessionId = sessionStorage.getItem(sessionKey);
      if (existingSessionId) payload.sessionId = existingSessionId;

      const response = await fetch(`${apiBaseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      let body;
      try {
        body = await response.json();
      } catch {
        throw new Error("The server returned an invalid response. Please try again.");
      }

      if (!response.ok || body?.success === false) {
        throw new Error(body?.message || body?.error || `Chat request failed (${response.status}).`);
      }

      const result = extractResponse(body);
      if (result.sessionId) sessionStorage.setItem(sessionKey, result.sessionId);

      typing.remove();
      addMessage(result.reply, "assistant");
      transcript.push({ role: "assistant", text: result.reply });

      const actions = result.actions || inferActions();
      renderActions(actions);
    } catch (error) {
      typing.remove();
      addError(error instanceof Error ? error.message : "Something went wrong. Please try again.");
    } finally {
      isSending = false;
      input.disabled = false;
      sendButton.disabled = false;
      input.focus();
    }
  }

  toggleButton.addEventListener("click", () => {
    if (root.classList.contains("is-open")) closeChat();
    else openChat();
  });

  closeButtons.forEach((button) => button.addEventListener("click", closeChat));

  composer.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  root.querySelectorAll("[data-dot-prompt]").forEach((button) => {
    button.addEventListener("click", () => sendMessage(button.dataset.dotPrompt || button.textContent));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && root.classList.contains("is-open")) closeChat();
  });

  // Allow existing site CTAs to open the assistant without changing their normal href behaviour.
  document.querySelectorAll("[data-dot-chat-open]").forEach((trigger) => {
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      openChat();
      const intent = trigger.dataset.dotChatIntent;
      if (intent) input.value = intent;
    });
  });
})();

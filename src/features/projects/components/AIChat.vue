<script setup lang="ts">
export type AIChatProps = Record<string, never>;

import { computed, nextTick, onMounted, ref, watch } from "vue";
import { locale } from "../../../i18n/store";

const renderMessage = (text: string) => {
  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  let html = escapeHtml(text);

  const links: string[] = [];

  // Markdown: [Facebook](https://...)
  html = html.replace(
    /\[([^\]]+)\]\(((?:https?:\/\/|mailto:)[^)]+)\)/g,
    (_match, _label, url) => {
      const index = links.push(url) - 1;
      return `@@LINK_${index}@@`;
    },
  );

  // URL thô: https://...
  html = html.replace(
    /(^|[\s(])((?:https?:\/\/|www\.)[^\s<]+)(?=$|[\s).,!?;:])/g,
    (_match, prefix, rawUrl) => {
      const cleanUrl = rawUrl.replace(/[.,!?;:]+$/, "");

      const href = cleanUrl.startsWith("www.")
        ? `https://${cleanUrl}`
        : cleanUrl;

      const trailing = rawUrl.slice(cleanUrl.length);

      return `${prefix}<a href="${href}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${trailing}`;
    },
  );

  // Email thô
  html = html.replace(
    /(^|[\s(])([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})(?=$|[\s).,!?;:])/gi,
    (_match, prefix, email) =>
      `${prefix}<a href="mailto:${email}">${email}</a>`,
  );

  // Khôi phục Markdown links
  html = html.replace(/@@LINK_(\d+)@@/g, (_match, index) => {
    const url = links[Number(index)];

    return `<a href="${url}" target="_blank" rel="noopener noreferrer">${url}</a>`;
  });

  return html.replace(/\n/g, "<br>");
};

type Message = {
  id: number;
  role: "user" | "bot";
  text: string;
};

const WEBHOOK_URL = "https://n8n.binhduy.xyz/webhook/chatbot";
const LOGO_SRC = "/logo_BD.png";

const messages = ref<Message[]>([]);
const input = ref("");
const isLoading = ref(false);
const messagesRef = ref<HTMLElement | null>(null);
const inputRef = ref<HTMLInputElement | null>(null);

let messageId = 0;

const sessionId = ref("");

const isVietnamese = computed(() => locale.value === "vi");

const labels = computed(() => {
  if (isVietnamese.value) {
    return {
      title: "Trợ lí AI của Bình Duy",
      greeting: "Xin chào!",
      welcome:
        "Tôi là trợ lý AI của Bình Duy. Hãy đặt câu hỏi để tìm hiểu thêm nhé.",
      placeholder: "Nhập tin nhắn...",
      send: "Gửi",
      typing: "Đang suy nghĩ...",
      connectionError: "Không kết nối được chatbot",
      emptyResponse: "Không có phản hồi",
      status: "Đang hoạt động",
    };
  }

  return {
    title: "Bình Duy's AI Assistant",
    greeting: "Hello!",
    welcome:
      "I'm Bình Duy's AI assistant. Ask me anything to learn more about him.",
    placeholder: "Type a message...",
    send: "Send",
    typing: "Thinking...",
    connectionError: "Unable to connect to the chatbot",
    emptyResponse: "No response",
    status: "Online",
  };
});

const getSessionId = () => {
  const saved = window.localStorage.getItem("chat_session");

  if (saved) {
    sessionId.value = saved;
    return;
  }

  const newSessionId = crypto.randomUUID();

  window.localStorage.setItem("chat_session", newSessionId);
  sessionId.value = newSessionId;
};

const scrollToBottom = async () => {
  await nextTick();

  const element = messagesRef.value;

  if (!element) return;

  element.scrollTop = element.scrollHeight;
};

const addMessage = (text: string, role: Message["role"]) => {
  messages.value.push({
    id: ++messageId,
    role,
    text,
  });

  scrollToBottom();
};

const sendMessage = async () => {
  const message = input.value.trim();

  if (!message || isLoading.value) return;

  addMessage(message, "user");
  input.value = "";
  isLoading.value = true;

  try {
    const response = await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message,
        sessionId: sessionId.value,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();

    const reply = data.reply || data.output || labels.value.emptyResponse;

    addMessage(String(reply), "bot");
  } catch (error) {
    console.error("AI chatbot error:", error);

    addMessage(labels.value.connectionError, "bot");
  } finally {
    isLoading.value = false;
    await scrollToBottom();
  }
};

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key !== "Enter") return;

  event.preventDefault();
  sendMessage();
};

onMounted(() => {
  getSessionId();
});

/* ---------- chỉ phục vụ giao diện ---------- */

const hasMessages = computed(() => messages.value.length > 0);

// chatbot trả lời xong thì đưa con trỏ về ô nhập để gõ tiếp
watch(isLoading, (value) => {
  if (!value) nextTick(() => inputRef.value?.focus());
});
</script>

<template>
  <section class="ai-chat">
    <div class="ai-chat-shell">
      <div class="ai-chat-glow" aria-hidden="true"></div>

      <!-- Header -->
      <header class="ai-chat-header">
        <div class="ai-chat-header-info">
          <span class="ai-chat-avatar" aria-hidden="true">
            <img :src="LOGO_SRC" alt="" />
          </span>

          <h2>{{ labels.title }}</h2>
        </div>

        <span class="ai-chat-status">
          <span class="ai-chat-status-dot"></span>
          {{ labels.status }}
        </span>
      </header>

      <!-- Messages -->
      <div
        ref="messagesRef"
        class="ai-chat-messages"
        @wheel.stop
      >
        <div class="ai-chat-welcome" :class="{ compact: hasMessages }">
          <div class="ai-chat-orb" aria-hidden="true">
            <span class="ai-chat-orb-ring"></span>
            <span class="ai-chat-orb-ring ai-chat-orb-ring--2"></span>

            <span class="ai-chat-orb-core">
              <img :src="LOGO_SRC" alt="" class="ai-chat-logo" />
            </span>
          </div>

          <strong>{{ labels.greeting }}</strong>

          <p>{{ labels.welcome }}</p>
        </div>

        <div
          v-for="message in messages"
          :key="message.id"
          class="ai-chat-row"
          :class="`ai-chat-row--${message.role}`"
        >
          <span
            v-if="message.role === 'bot'"
            class="ai-chat-mini"
            aria-hidden="true"
          >
            <img :src="LOGO_SRC" alt="" class="ai-chat-mini-logo" />
          </span>

          <div
            class="ai-chat-message"
            :class="`ai-chat-message--${message.role}`"
            v-html="renderMessage(message.text)"
          ></div>
        </div>

        <div v-if="isLoading" class="ai-chat-row ai-chat-row--bot">
          <span class="ai-chat-mini" aria-hidden="true">
            <img :src="LOGO_SRC" alt="" class="ai-chat-mini-logo" />
          </span>

          <div class="ai-chat-message ai-chat-message--bot ai-chat-typing">
            <span class="ai-chat-typing-dot"></span>
            <span class="ai-chat-typing-dot"></span>
            <span class="ai-chat-typing-dot"></span>
            <span class="ai-chat-typing-label">{{ labels.typing }}</span>
          </div>
        </div>
      </div>

      <!-- Input -->
      <form class="ai-chat-input" @submit.prevent="sendMessage">
        <input
          ref="inputRef"
          v-model="input"
          type="text"
          :placeholder="labels.placeholder"
          :disabled="isLoading"
          autocomplete="off"
          @keydown="handleKeydown"
        />

        <button
          type="submit"
          :aria-label="labels.send"
          :disabled="isLoading || !input.trim()"
        >
          <span class="ai-chat-send-text">{{ labels.send }}</span>

          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.4"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14" />
            <path d="m13 6 6 6-6 6" />
          </svg>
        </button>
      </form>
    </div>
  </section>
</template>

<style scoped lang="scss">
/* Bảng màu "chrome / graphite" lấy từ chính logo */
$bg: #0c0e11;
$accent: #dfe6ee; // bạc sáng
$accent-2: #ffffff;
$steel: #8fa1b8; // xanh thép nhạt cho glow
$text: #f2f5f9;
$text-2: rgba(242, 245, 249, 0.74);
$text-3: rgba(242, 245, 249, 0.5);
$line: rgba(255, 255, 255, 0.09);
$ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);

/* nền kim loại sáng dùng cho mọi ô chứa logo */
$chrome: linear-gradient(145deg, #ffffff 0%, #c7d0dc 55%, #f3f6fa 100%);
$chrome-btn: linear-gradient(135deg, #ffffff 0%, #bcc7d4 100%);

.ai-chat {
  grid-column: 1 / 13;
  width: 100%;
  margin-top: var(--chat-pull, -130px);

  display: flex;
  justify-content: center;
}

.ai-chat-shell {
  position: relative;
  width: min(1080px, 100%);
  height: 620px;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  isolation: isolate;

  background: $bg;
  color: $text;
  border-radius: 28px;

  box-shadow:
    0 30px 80px rgba(10, 12, 16, 0.35),
    0 2px 8px rgba(10, 12, 16, 0.12);

  &::before,
  &::after {
    content: "";
    position: absolute;
    inset: 0;
    z-index: 5;
    padding: 1px;
    border-radius: inherit;
    pointer-events: none;

    -webkit-mask:
      linear-gradient(#000 0 0) content-box,
      linear-gradient(#000 0 0);
    -webkit-mask-composite: xor;
    mask:
      linear-gradient(#000 0 0) content-box exclude,
      linear-gradient(#000 0 0);
  }

  &::before {
    background: rgba(255, 255, 255, 0.09);
  }

  /* viền kim loại tĩnh: sáng ở cạnh trên, tối dần ở giữa */
  &::after {
    background: linear-gradient(
      180deg,
      rgba(255, 255, 255, 0.3),
      rgba(255, 255, 255, 0.04) 30%,
      rgba(255, 255, 255, 0.04) 70%,
      rgba(160, 182, 210, 0.22)
    );
  }
}

/* nền: lưới + ánh sáng thép */
.ai-chat-glow {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;

  background:
    radial-gradient(
      ellipse 60% 45% at 50% 0%,
      rgba(160, 182, 210, 0.18),
      transparent 70%
    ),
    linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px) 0 0 / 44px
      44px,
    linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px) 0 0 /
      44px 44px;

  -webkit-mask-image: radial-gradient(
    ellipse at 50% 30%,
    black 20%,
    transparent 85%
  );
  mask-image: radial-gradient(ellipse at 50% 30%, black 20%, transparent 85%);
}

/* ---------- Header ---------- */
.ai-chat-header {
  position: relative;
  z-index: 1;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  padding: 18px 24px;

  background: rgba(255, 255, 255, 0.025);
  border-bottom: 1px solid $line;
}

.ai-chat-header-info {
  min-width: 0;

  display: flex;
  align-items: center;
  gap: 14px;
}

/* ô logo: nền kim loại sáng để logo (nền trắng) hòa vào tự nhiên */
.ai-chat-avatar {
  position: relative;
  flex-shrink: 0;

  width: 46px;
  height: 46px;
  padding: 6px;

  display: grid;
  place-items: center;

  border-radius: 15px;
  background: $chrome;

  box-shadow:
    0 0 26px rgba(170, 190, 215, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: contain;
    mix-blend-mode: multiply; /* xóa nền trắng của logo */
  }

  &::after {
    content: "";
    position: absolute;
    inset: -3px;
    border-radius: inherit;
    border: 1px solid rgba(200, 215, 235, 0.35);
  }
}

.ai-chat-header h2 {
  margin: 0;

  color: $text;

  font-size: 18px;
  font-weight: 700;
  line-height: 1.25;
}

.ai-chat-status {
  flex-shrink: 0;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 7px 13px;

  border: 1px solid $line;
  border-radius: 999px;

  color: $text-2;

  font-size: 13px;
  font-weight: 500;
}

.ai-chat-status-dot {
  position: relative;

  width: 8px;
  height: 8px;

  border-radius: 50%;
  background: #43d17a;

  &::after {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: #43d17a;
    transform: scale(2.2);
    opacity: 0.22;
  }
}

/* ---------- Messages ---------- */
.ai-chat-messages {
  position: relative;
  z-index: 1;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 14px;

  padding: 26px 28px;

  overflow-y: auto;

  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.16) transparent;
  min-height: 0;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  overscroll-behavior-y: contain;
  touch-action: pan-y;
}

/* Keep mouse-wheel scrolling inside the chat message area. */
.ai-chat-messages {
  overscroll-behavior: contain;
  overflow-y: auto;
  overscroll-behavior-y: contain;
}


.ai-chat-welcome {
  width: min(620px, 100%);

  margin: auto;
  padding: 8px 0;

  text-align: center;

  transition: all 0.4s $ease-out;

  strong {
    display: block;

    /* chữ chrome */
    background: linear-gradient(180deg, #ffffff 20%, #9fb0c4 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;

    font-size: 28px;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  p {
    max-width: 480px;

    margin: 10px auto 0;

    color: $text-2;

    font-size: 15px;
    line-height: 1.6;
  }

  &.compact {
    margin: 0 auto 4px;
    padding: 0 0 10px;

    strong {
      font-size: 13px;
      font-weight: 600;
      background: none;
      color: $text-3;
    }

    p {
      margin-top: 2px;
      font-size: 13px;
      color: $text-3;
    }

    .ai-chat-orb {
      display: none;
    }
  }
}

/* quả cầu logo */
.ai-chat-orb {
  position: relative;

  width: 116px;
  height: 116px;

  margin: 0 auto 20px;
}

.ai-chat-orb-ring {
  position: absolute;
  inset: 0;

  border: 1px dashed rgba(180, 198, 220, 0.4);
  border-radius: 50%;

  animation: ai-chat-spin 18s linear infinite;

  &::before {
    content: "";
    position: absolute;
    top: -4px;
    left: 50%;

    width: 8px;
    height: 8px;

    margin-left: -4px;

    border-radius: 50%;
    background: $accent-2;
    box-shadow: 0 0 14px rgba(200, 220, 245, 0.9);
  }
}

.ai-chat-orb-ring--2 {
  inset: 12px;

  border-style: solid;
  border-color: rgba(255, 255, 255, 0.09);

  animation-direction: reverse;
  animation-duration: 26s;

  &::before {
    display: none;
  }
}

.ai-chat-orb-core {
  position: absolute;
  inset: 20px;
  padding: 11px;

  display: grid;
  place-items: center;

  border-radius: 50%;
  background: radial-gradient(
    circle at 30% 25%,
    #ffffff 0%,
    #dfe5ed 55%,
    #aab6c6 100%
  );

  box-shadow:
    0 0 36px rgba(170, 195, 225, 0.4),
    inset 0 -6px 14px rgba(90, 105, 125, 0.25),
    inset 0 2px 0 rgba(255, 255, 255, 0.9);

}

.ai-chat-logo {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: contain;
  mix-blend-mode: multiply;
}

/* từng tin nhắn */
.ai-chat-row {
  display: flex;
  align-items: flex-end;
  gap: 10px;

  animation: ai-chat-in 380ms $ease-out both;
}

.ai-chat-row--user {
  justify-content: flex-end;
}

.ai-chat-mini {
  flex-shrink: 0;

  width: 32px;
  height: 32px;
  padding: 4px;

  display: grid;
  place-items: center;

  border-radius: 10px;
  background: $chrome;

  box-shadow:
    0 0 14px rgba(170, 190, 215, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
}

.ai-chat-mini-logo {
  width: 100%;
  height: 100%;

  display: block;

  object-fit: contain;
  mix-blend-mode: multiply;
}

.ai-chat-message {
  width: fit-content;
  max-width: min(72%, 640px);

  padding: 12px 17px;

  border-radius: 18px;

  color: $text;

  font-size: 15px;
  line-height: 1.6;

  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.ai-chat-message--user {
  background: $chrome-btn;
  color: #10141a;
  font-weight: 500;

  border-bottom-right-radius: 6px;

  box-shadow:
    0 8px 22px rgba(150, 170, 200, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
}

.ai-chat-message--bot {
  background: rgba(255, 255, 255, 0.065);
  border: 1px solid $line;

  border-bottom-left-radius: 6px;
}

.ai-chat-message :deep(a) {
  color: $accent;
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;

  &:hover {
    color: $accent-2;
  }
}


/* ---------- Typing ---------- */
.ai-chat-typing {
  display: flex;
  align-items: center;
  gap: 5px;
}

.ai-chat-typing-dot {
  width: 7px;
  height: 7px;

  border-radius: 50%;

  background: $accent;

  animation: ai-chat-typing 1.2s infinite ease-in-out;
}

.ai-chat-typing-dot:nth-child(2) {
  animation-delay: 0.15s;
}

.ai-chat-typing-dot:nth-child(3) {
  animation-delay: 0.3s;
}

.ai-chat-typing-label {
  margin-left: 6px;

  color: $text-3;

  font-size: 13px;
}

/* ---------- Input ---------- */
.ai-chat-input {
  position: relative;
  z-index: 1;
  flex-shrink: 0;

  display: flex;
  align-items: center;
  gap: 10px;

  margin: 0 20px 20px;
  padding: 7px 7px 7px 22px;

  border: 1px solid rgba(255, 255, 255, 0.11);
  border-radius: 999px;

  background: rgba(255, 255, 255, 0.05);

  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    background 0.2s ease;

  &:focus-within {
    border-color: rgba(200, 215, 235, 0.7);
    background: rgba(255, 255, 255, 0.07);
    box-shadow: 0 0 0 4px rgba(170, 190, 215, 0.14);
  }
}

.ai-chat-input input {
  flex: 1;
  min-width: 0;

  height: 46px;

  padding: 0;

  border: 0;
  outline: none;

  background: transparent;
  color: $text;

  font: inherit;
  font-size: 15px;

  &::placeholder {
    color: $text-3;
  }

  &:disabled {
    opacity: 0.6;
  }
}

.ai-chat-input button {
  flex-shrink: 0;

  height: 46px;

  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 0 22px;

  border: 0;
  border-radius: 999px;

  background: $chrome-btn;
  color: #10141a;

  font: inherit;
  font-size: 15px;
  font-weight: 700;

  cursor: pointer;

  transition:
    opacity 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  svg {
    transition: transform 0.2s ease;
  }

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 22px rgba(170, 195, 225, 0.35);

    svg {
      transform: translateX(3px);
    }
  }

  &:focus-visible {
    outline: 2px solid $text;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

/* ---------- Keyframes ---------- */
@keyframes ai-chat-in {
  from {
    opacity: 0;
    transform: translateY(12px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes ai-chat-typing {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }

  30% {
    transform: translateY(-4px);
    opacity: 1;
  }
}

@keyframes ai-chat-spin {
  to {
    transform: rotate(360deg);
  }
}

@keyframes ai-chat-float {
  0%,
  100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-5px);
  }
}

@keyframes ai-chat-pulse {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }

  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

@keyframes ai-chat-ping {
  0% {
    transform: scale(1);
    opacity: 0.7;
  }

  100% {
    transform: scale(2.6);
    opacity: 0;
  }
}

/* ---------- Mobile ---------- */
@media (max-width: 768px) {
  .ai-chat {
    margin-top: var(--chat-pull-mobile, -16px);
  }

  .ai-chat-shell {
    height: 72vh;
    min-height: 500px;

    border-radius: 22px;
  }

  .ai-chat-header {
    padding: 14px 18px;
  }

  .ai-chat-messages {
    padding: 18px;
  }

  .ai-chat-message {
    max-width: 85%;
  }

  .ai-chat-input {
    margin: 0 12px 12px;
  }
}

@media (max-width: 480px) {
  .ai-chat-shell {
    border-radius: 18px;
  }

  .ai-chat-avatar {
    width: 40px;
    height: 40px;

    border-radius: 13px;
  }

  .ai-chat-header h2 {
    font-size: 15px;
  }

  .ai-chat-status {
    padding: 6px 10px;

    font-size: 12px;
  }

  .ai-chat-welcome strong {
    font-size: 24px;
  }

  .ai-chat-orb {
    width: 96px;
    height: 96px;
  }

  .ai-chat-orb-core {
    inset: 16px;
    padding: 9px;
  }

  /* chỉ giữ mũi tên, ẩn chữ "Gửi" cho gọn */
  .ai-chat-send-text {
    display: none;
  }

  .ai-chat-input button {
    width: 46px;

    justify-content: center;

    padding: 0;
  }
}

/* ---------- Giảm chuyển động ---------- */
@media (prefers-reduced-motion: reduce) {
  .ai-chat-shell::after,
  .ai-chat-avatar::after,
  .ai-chat-status-dot::after,
  .ai-chat-orb-ring,
  .ai-chat-orb-core,
  .ai-chat-row,
  .ai-chat-typing-dot {
    animation: none !important;
  }
}
</style>
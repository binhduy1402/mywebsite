<script setup lang="ts">

import { computed, nextTick, onBeforeUnmount, onMounted, ref } from "vue";
import { locale as appLocale } from "../../../i18n/store";

export interface Props {

  /** 'en' | 'vi' — nếu không truyền, tự đọc theo <html lang> */

  locale?: string;

}

type Localized = { en: string; vi: string };

type SystemNode = {

  id: string;

  title: Localized;

  category: Localized;

  description: Localized;

  items: string[];

};

const nodes: SystemNode[] = [

  {

    id: "mail",

    title: { en: "Mail", vi: "Mail" },

    category: { en: "Email systems", vi: "Hệ thống email" },

    description: {

      en: "Deploying and running email platforms for businesses.",

      vi: "Triển khai và vận hành các nền tảng email cho doanh nghiệp.",

    },

    items: ["MailEnable", "Mailcow", "Zimbra", "Google Workspace"],

  },

  {

    id: "delivery",

    title: { en: "Mail delivery", vi: "Mail delivery" },

    category: { en: "Sending & routing", vi: "Gửi và định tuyến mail" },

    description: {

      en: "Mail transport, filtering and routing, so messages reach the right inbox and don't get blocked.",

      vi: "Cấu hình vận chuyển, lọc và định tuyến thư để mail đi đúng nơi, không bị chặn.",

    },

    items: ["SMTP", "Relay", "PMG", "Postfix", "Mail Routing"],

  },

  {

    id: "dns",

    title: { en: "DNS & security", vi: "DNS & bảo mật" },

    category: { en: "Authentication & protection", vi: "Xác thực và bảo vệ" },

    description: {

      en: "Managing DNS and email security records to prevent spoofing and spam.",

      vi: "Quản lý DNS và các bản ghi bảo mật email để chống giả mạo, chống spam.",

    },

    items: ["DNS Records", "MX", "SPF", "DKIM", "DMARC", "SSL/TLS"],

  },

  {

    id: "network",

    title: { en: "Network", vi: "Network" },

    category: { en: "Networking & connectivity", vi: "Mạng và kết nối" },

    description: {

      en: "Designing, configuring and troubleshooting internal networks and outside connectivity.",

      vi: "Thiết kế, cấu hình và xử lý sự cố hạ tầng mạng nội bộ và kết nối ra ngoài.",

    },

    items: ["TCP/IP", "Routing", "VLAN", "NAT", "IPv4 / IPv6", "VPN"],

  },

  {

    id: "server",

    title: { en: "Server", vi: "Server" },

    category: { en: "Servers & storage", vi: "Máy chủ và lưu trữ" },

    description: {

      en: "Administering servers, virtualization and storage across multiple platforms.",

      vi: "Quản trị máy chủ, ảo hóa và lưu trữ dữ liệu trên nhiều nền tảng.",

    },

    items: ["Linux", "Windows Server", "Proxmox", "Docker", "VPS", "Storage"],

  },

  {

    id: "support",

    title: { en: "Support", vi: "Support" },

    category: { en: "Technical support", vi: "Hỗ trợ kỹ thuật" },

    description: {

      en: "Day-to-day user support and fast incident troubleshooting.",

      vi: "Hỗ trợ người dùng hằng ngày và xử lý sự cố kỹ thuật nhanh chóng.",

    },

    items: [

      "Windows",

      "Outlook",

      "Email",

      "Hardware",

      "Software",

      "User Support",

      "Incident Troubleshooting",

    ],

  },

];

/* ---------- ngôn ngữ (EN / VI) ---------- */

const props = defineProps<Props>();

const docLang = ref("en");

// Nếu web dùng vue-i18n, thay 3 dòng dưới bằng:

//   const { locale } = useI18n();

//   const lang = computed<"en" | "vi">(() => (locale.value.startsWith("vi") ? "vi" : "en"));

const lang = computed<"en" | "vi">(() => {
  const raw = (appLocale.value ?? props.locale ?? docLang.value ?? "en").toLowerCase();
  return raw.startsWith("vi") ? "vi" : "en";
});

const ui = {

  en: {

    brand: "Infrastructure control room",

    online: "All systems operational",

    systems: "system groups",

    coreLive: "Online",

    coreIdle: "System room",

    hint: "Select a group to see what it covers and the full list of technologies.",

    close: "Close details",

  },

  vi: {

    brand: "Trung tâm hạ tầng",

    online: "Đang hoạt động",

    systems: "nhóm hệ thống",

    coreLive: "Online",

    coreIdle: "Phòng hệ thống",

    hint: "Bấm vào một nhóm để xem mô tả và đầy đủ công nghệ đã làm việc.",

    close: "Đóng chi tiết",

  },

};

const s = computed(() => ui[lang.value]);

const tr = (text: Localized) => text[lang.value];

const PREVIEW_COUNT = 4;

/* ---------- state ---------- */

const activeId = ref<string | null>(null);

const hoveredId = ref<string | null>(null);

const activeNode = computed(() =>

  nodes.find((node) => node.id === activeId.value),

);

const toggleNode = (id: string) => {

  activeId.value = activeId.value === id ? null : id;

};

const isHighlighted = (id: string) =>

  hoveredId.value === id || activeId.value === id;

const previewItems = (node: SystemNode) => node.items.slice(0, PREVIEW_COUNT);

const extraCount = (node: SystemNode) =>

  Math.max(0, node.items.length - PREVIEW_COUNT);

/* ---------- entrance / live sequence ---------- */

const shellEl = ref<HTMLElement | null>(null);

const isVisible = ref(false);

const isLive = ref(false);

const systemCount = ref(0);

const typedChars = ref(0);

const hintText = computed(() => s.value.hint.slice(0, typedChars.value));

const typing = ref(false);

const timers: number[] = [];

let io: IntersectionObserver | null = null;

let langObserver: MutationObserver | null = null;

let ro: ResizeObserver | null = null;

let reduceMotion = false;

let canTilt = false;

const runSequence = () => {
  isVisible.value = true;

  if (reduceMotion) {
    systemCount.value = nodes.length;
    typedChars.value = 999;
    return;
  }

  // đếm số nhóm hệ thống
  timers.push(
    window.setTimeout(() => {
      const t = window.setInterval(() => {
        systemCount.value += 1;
        if (systemCount.value >= nodes.length) window.clearInterval(t);
      }, 160);
      timers.push(t);
    }, 500),
  );

  // bắt đầu cho dữ liệu chạy trên đường nối
  timers.push(window.setTimeout(() => (isLive.value = true), 2200));

  // gõ dòng gợi ý
  timers.push(
    window.setTimeout(() => {
      typing.value = true;
      const t = window.setInterval(() => {
        typedChars.value += 1;
        if (typedChars.value >= s.value.hint.length) {
          window.clearInterval(t);
          typing.value = false;
          typedChars.value = 999; // gõ xong thì luôn hiện đủ, kể cả khi đổi ngôn ngữ
        }
      }, 26);
      timers.push(t);
    }, 1700),
  );
};

/* ---------- connections tính theo vị trí thật của thẻ ---------- */

const dashboardEl = ref<HTMLElement | null>(null);

const coreEl = ref<HTMLElement | null>(null);

const nodeEls: Record<string, HTMLElement> = {};

const size = ref({ w: 0, h: 0 });

const paths = ref<{ id: string; d: string }[]>([]);

const setNodeRef = (id: string, el: unknown) => {

  if (el) nodeEls[id] = el as HTMLElement;

};

const computePaths = () => {

  const dash = dashboardEl.value;

  const core = coreEl.value;

  if (!dash || !core) return;

  size.value = { w: dash.clientWidth, h: dash.clientHeight };

  const cx = core.offsetLeft + core.offsetWidth / 2;

  const cy = core.offsetTop + core.offsetHeight / 2;

  paths.value = nodes.map((n) => {

    const el = nodeEls[n.id];

    if (!el) return { id: n.id, d: "" };

    const isLeft = el.offsetLeft + el.offsetWidth / 2 < cx;

    const sx = isLeft ? el.offsetLeft + el.offsetWidth : el.offsetLeft;

    const sy = el.offsetTop + el.offsetHeight / 2;

    const mx = (sx + cx) / 2;

    return { id: n.id, d: `M${sx} ${sy} C ${mx} ${sy}, ${mx} ${cy}, ${cx} ${cy}` };

  });

};

/* ---------- tilt + spotlight theo con trỏ ---------- */

const onCardMove = (e: MouseEvent) => {

  const el = e.currentTarget as HTMLElement;

  const r = el.getBoundingClientRect();

  const x = e.clientX - r.left;

  const y = e.clientY - r.top;

  el.style.setProperty("--mx", `${x}px`);

  el.style.setProperty("--my", `${y}px`);

  if (!canTilt) return;

  el.style.setProperty("--rx", `${-(y / r.height - 0.5) * 9}deg`);

  el.style.setProperty("--ry", `${(x / r.width - 0.5) * 11}deg`);

};

const onCardLeave = (e: MouseEvent) => {

  const el = e.currentTarget as HTMLElement;

  el.style.setProperty("--rx", "0deg");

  el.style.setProperty("--ry", "0deg");

  hoveredId.value = null;

};

/* ---------- lifecycle ---------- */

onMounted(async () => {

  docLang.value = document.documentElement.lang || "en";

  langObserver = new MutationObserver(() => {

    docLang.value = document.documentElement.lang || "en";

  });

  langObserver.observe(document.documentElement, {

    attributes: true,

    attributeFilter: ["lang"],

  });

  reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  canTilt =

    !reduceMotion && window.matchMedia("(hover: hover)").matches;

  await nextTick();

  computePaths();

  if (dashboardEl.value && "ResizeObserver" in window) {

    ro = new ResizeObserver(computePaths);

    ro.observe(dashboardEl.value);

  }

  (document as any).fonts?.ready?.then(computePaths);

  if (reduceMotion || !("IntersectionObserver" in window)) {

    runSequence();

    return;

  }

  io = new IntersectionObserver(

    (entries) => {

      if (entries.some((e) => e.isIntersecting)) {

        runSequence();

        io?.disconnect();

      }

    },

    { threshold: 0.3 },

  );

  if (shellEl.value) io.observe(shellEl.value);

});

onBeforeUnmount(() => {

  io?.disconnect();

  ro?.disconnect();

  langObserver?.disconnect();

  timers.forEach((t) => {

    window.clearTimeout(t);

    window.clearInterval(t);

  });

});

</script>

<template>

  <section class="control-room">

    <div

      ref="shellEl"

      :class="['control-room-shell', { 'is-visible': isVisible, 'is-live': isLive }]"

    >

      <!-- HEADER -->

      <header class="control-header">

        <div class="control-brand">

          <span class="live-indicator"></span>

          <span>{{ s.brand }}</span>

        </div>

        <div class="control-status">

          <span class="status-online">{{ s.online }}</span>

          <span class="status-divider"></span>

          <span>{{ systemCount }} {{ s.systems }}</span>

        </div>

      </header>

      <!-- DASHBOARD -->

      <div ref="dashboardEl" class="dashboard">

        <div class="dashboard-grid"></div>

        <div class="scan-line"></div>

        <!-- CONNECTIONS -->

        <svg

          class="connections"

          :viewBox="`0 0 ${size.w} ${size.h}`"

          :width="size.w"

          :height="size.h"

          aria-hidden="true"

        >

          <g

            v-for="(p, i) in paths"

            :key="p.id"

            :class="[

              'link',

              { highlighted: isHighlighted(p.id), reverse: i % 2 === 1 },

            ]"

            :style="{ '--i': i }"

          >

            <path class="link-base" :d="p.d" />

            <path class="link-draw" :d="p.d" pathLength="100" />

            <path class="link-flow" :d="p.d" pathLength="100" />

          </g>

        </svg>

        <!-- CORE -->

        <div ref="coreEl" :class="['core', { linked: !!activeNode }]">

          <span class="core-pulse"></span>

          <span class="core-pulse core-pulse-2"></span>

          <span class="core-pulse core-pulse-3"></span>

          <span class="core-sweep"></span>

          <div class="core-ring"></div>

          <div class="core-ring core-ring-2"></div>

          <div class="core-body">

            <span class="core-live"><i></i>{{ s.coreLive }}</span>

            <strong>CORE</strong>

            <Transition name="swap" mode="out-in">

              <small :key="activeNode?.id ?? 'idle'" :class="{ on: !!activeNode }">

                {{ activeNode ? tr(activeNode.title) : s.coreIdle }}

              </small>

            </Transition>

          </div>

        </div>

        <!-- SYSTEM NODES -->

        <button

          v-for="(node, index) in nodes"

          :key="node.id"

          :ref="(el) => setNodeRef(node.id, el)"

          :class="['system-node', `node-${node.id}`, { active: activeId === node.id }]"

          :style="{ '--i': index }"

          type="button"

          :aria-pressed="activeId === node.id"

          @mouseenter="hoveredId = node.id"

          @mousemove="onCardMove"

          @mouseleave="onCardLeave"

          @focus="hoveredId = node.id"

          @blur="hoveredId = null"

          @click="toggleNode(node.id)"

        >

          <span class="node-top">

            <span class="node-status"></span>

            <span class="node-titles">

              <strong>{{ tr(node.title) }}</strong>

              <small>{{ tr(node.category) }}</small>

            </span>

            <span class="node-open" aria-hidden="true">+</span>

          </span>

          <span class="node-chips">

            <span

              v-for="(item, j) in previewItems(node)"

              :key="item"

              :style="{ '--j': j }"

            >

              {{ item }}

            </span>

            <span

              v-if="extraCount(node)"

              class="chip-more"

              :style="{ '--j': PREVIEW_COUNT }"

            >

              +{{ extraCount(node) }}

            </span>

          </span>

        </button>

      </div>

      <!-- DETAIL -->

      <div class="detail" aria-live="polite">

        <Transition name="detail" mode="out-in">

          <div v-if="activeNode" :key="activeNode.id" class="detail-content">

            <div class="detail-text">

              <h3>{{ tr(activeNode.title) }}</h3>

              <p>{{ tr(activeNode.description) }}</p>

            </div>

            <div class="detail-items">

              <span

                v-for="(item, j) in activeNode.items"

                :key="item"

                :style="{ '--j': j }"

              >

                {{ item }}

              </span>

            </div>

            <button

              class="detail-close"

              type="button"

              :aria-label="s.close"

              @click="activeId = null"

            >

              ×

            </button>

          </div>

          <p v-else key="hint" :class="['detail-hint', { typing }]">

            {{ hintText }}

          </p>

        </Transition>

      </div>

    </div>

  </section>

</template>

<style scoped lang="scss">

$accent: #ff8500;

$text: #f6f1e9;

$text-2: rgba(246, 241, 233, 0.74);

$text-3: rgba(246, 241, 233, 0.55);

$ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);

.control-room {

  grid-column: 1 / 13;

  width: 100%;

  /* kéo khối lên sát phần tiêu đề; chỉnh số này nếu muốn sát/xa hơn */

  margin-top: var(--control-room-pull, -96px);

  padding: 0 0 var(--space-xxl);

}

.control-room-shell {

  width: 100%;

  overflow: hidden;

  border-radius: 26px;

  background: #151412;

  color: $text;

  border: 1px solid rgba(20, 18, 16, 0.18);

  box-shadow: 0 30px 80px rgba(20, 18, 16, 0.16);

}

/* ---------- trạng thái ẩn trước khi cuộn tới ---------- */

.control-room-shell:not(.is-visible) {

  .system-node,

  .core,

  .node-chips span,

  .detail,

  .link-base {

    opacity: 0;

  }

}

/* ---------- Header ---------- */

.control-header {

  min-height: 64px;

  padding: 0 28px;

  display: flex;

  align-items: center;

  justify-content: space-between;

  gap: 16px;

  background: #0e0d0c;

  border-bottom: 1px solid rgba(255, 255, 255, 0.08);

  font-size: 14px;

  font-weight: 600;

}

.control-brand,

.control-status {

  display: flex;

  align-items: center;

  gap: 10px;

}

.control-status {

  color: $text-3;

  font-weight: 500;

  font-variant-numeric: tabular-nums;

}

.live-indicator {

  width: 8px;

  height: 8px;

  border-radius: 50%;

  background: $accent;

  box-shadow: 0 0 12px rgba(255, 133, 0, 0.8);

  animation: blink 2s ease-in-out infinite;

}

.status-online {

  color: $accent;

  font-weight: 600;

}

.status-divider {

  width: 1px;

  height: 14px;

  background: rgba(255, 255, 255, 0.16);

}

/* ---------- Dashboard ---------- */

.dashboard {

  position: relative;

  height: 640px;

  padding: 22px 20px;

  display: grid;

  grid-template-columns: 30% 40% 30%;

  grid-template-rows: repeat(3, 1fr);

  overflow: hidden;

  background:

    radial-gradient(circle at 50% 50%, rgba(255, 133, 0, 0.12), transparent 30%),

    #191816;

}

.dashboard-grid {

  position: absolute;

  inset: 0;

  opacity: 0.5;

  background-image:

    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),

    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);

  background-size: 42px 42px;

  mask-image: radial-gradient(circle at center, black, transparent 90%);

  pointer-events: none;

  animation: grid-drift 24s linear infinite;

}

.scan-line {

  position: absolute;

  z-index: 1;

  left: 0;

  right: 0;

  top: -2%;

  height: 1px;

  background: linear-gradient(90deg, transparent, rgba(255, 133, 0, 0.35), transparent);

  box-shadow: 0 0 18px rgba(255, 133, 0, 0.25);

  pointer-events: none;

  animation: scan 9s linear infinite;

}

/* ---------- Connections ---------- */

.connections {

  position: absolute;

  top: 0;

  left: 0;

  z-index: 1;

  pointer-events: none;

  overflow: visible;

}

.link path {

  fill: none;

}

.link-base {

  stroke: rgba(255, 255, 255, 0.16);

  stroke-width: 1.5;

  stroke-dasharray: 6 8;

  transition:

    stroke 250ms ease,

    opacity 700ms ease 500ms;

}

.link.highlighted .link-base {

  stroke: rgba(255, 133, 0, 0.6);

  stroke-dasharray: none;

  stroke-width: 2;

}

/* nét cam "vẽ" đường nối một lần khi xuất hiện */

.link-draw {

  stroke: $accent;

  stroke-width: 2;

  stroke-linecap: round;

  stroke-dasharray: 100;

  stroke-dashoffset: 100;

  opacity: 0;

  filter: drop-shadow(0 0 6px rgba(255, 133, 0, 0.9));

}

.is-visible .link-draw {

  animation: draw 1.3s $ease-out forwards;

  animation-delay: calc(500ms + var(--i) * 120ms);

}

/* gói dữ liệu chạy liên tục giữa node và core */

.link-flow {

  stroke: #ffb45c;

  stroke-width: 3;

  stroke-linecap: round;

  stroke-dasharray: 3 97;

  stroke-dashoffset: 0;

  opacity: 0;

  filter: drop-shadow(0 0 5px rgba(255, 133, 0, 0.95));

}

.is-live .link-flow {

  opacity: 0.95;

  animation: flow 3.6s linear infinite;

  animation-delay: calc(var(--i) * -0.7s);

}

.is-live .link.reverse .link-flow {

  animation-direction: reverse;

}

.is-live .link.highlighted .link-flow {

  stroke-dasharray: 7 93;

  stroke-width: 4;

  animation-duration: 1.5s;

}

/* ---------- Core ---------- */

.core {

  grid-column: 2;

  grid-row: 1 / 4;

  place-self: center;

  position: relative;

  z-index: 2;

  width: 220px;

  height: 220px;

}

.is-visible .core {

  animation: core-in 900ms $ease-out backwards;

}

.core-pulse {

  position: absolute;

  inset: 30px;

  border: 1.5px solid rgba(255, 133, 0, 0.55);

  border-radius: 50%;

  opacity: 0;

  animation: ripple 4.2s ease-out infinite;

}

.core-pulse-2 {

  animation-delay: 1.4s;

}

.core-pulse-3 {

  animation-delay: 2.8s;

}

.core-sweep {

  position: absolute;

  inset: -34px;

  border-radius: 50%;

  background: conic-gradient(

    from 0deg,

    transparent 0deg 285deg,

    rgba(255, 133, 0, 0.26) 360deg

  );

  -webkit-mask-image: radial-gradient(circle, transparent 38%, black 39%, black 70%, transparent 71%);

  mask-image: radial-gradient(circle, transparent 38%, black 39%, black 70%, transparent 71%);

  animation: spin 6s linear infinite;

  pointer-events: none;

}

.core-ring {

  position: absolute;

  inset: 0;

  border: 1px dashed rgba(255, 133, 0, 0.3);

  border-radius: 50%;

  animation: spin 30s linear infinite;

}

.core-ring-2 {

  inset: 16px;

  border-color: rgba(255, 255, 255, 0.1);

  animation-direction: reverse;

  animation-duration: 40s;

}

.core-body {

  position: absolute;

  inset: 40px;

  display: flex;

  flex-direction: column;

  align-items: center;

  justify-content: center;

  gap: 4px;

  border: 1.5px solid rgba(255, 133, 0, 0.7);

  border-radius: 50%;

  background:

    radial-gradient(circle, rgba(255, 133, 0, 0.14), transparent 70%),

    #171513;

  box-shadow: 0 0 40px rgba(255, 133, 0, 0.12);

  transition:

    box-shadow 400ms ease,

    border-color 400ms ease;

  strong {

    font-size: 28px;

    letter-spacing: 0.1em;

    line-height: 1;

  }

  small {

    max-width: 120px;

    text-align: center;

    color: $text-2;

    font-size: 13px;

    line-height: 1.2;

    &.on {

      color: $accent;

      font-weight: 600;

    }

  }

}

.core.linked .core-body {

  border-color: $accent;

  box-shadow:

    0 0 60px rgba(255, 133, 0, 0.35),

    inset 0 0 26px rgba(255, 133, 0, 0.18);

}

.core-live {

  display: flex;

  align-items: center;

  gap: 6px;

  color: $accent;

  font-size: 12px;

  font-weight: 600;

  i {

    width: 6px;

    height: 6px;

    border-radius: 50%;

    background: $accent;

    box-shadow: 0 0 8px $accent;

    animation: blink 1.8s ease-in-out infinite;

  }

}

.swap-enter-active,

.swap-leave-active {

  transition:

    opacity 160ms ease,

    transform 160ms ease;

}

.swap-enter-from {

  opacity: 0;

  transform: translateY(6px);

}

.swap-leave-to {

  opacity: 0;

  transform: translateY(-6px);

}

/* ---------- Nodes ---------- */

.system-node {

  position: relative;

  z-index: 3;

  margin: 10px 14px;

  padding: 18px 20px;

  display: flex;

  flex-direction: column;

  justify-content: space-between;

  gap: 14px;

  text-align: left;

  color: $text;

  border: 1px solid rgba(255, 255, 255, 0.14);

  border-radius: 14px;

  background: #1f1d1a;

  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.28);

  cursor: pointer;

  font: inherit;

  overflow: hidden;

  transform: perspective(800px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));

  transition:

    transform 140ms ease-out,

    translate 260ms $ease-out,

    border-color 260ms ease,

    background 260ms ease,

    box-shadow 260ms ease;

  /* ánh sáng bám theo con trỏ */

  &::before {

    content: "";

    position: absolute;

    inset: 0;

    border-radius: inherit;

    background: radial-gradient(

      220px circle at var(--mx, 50%) var(--my, 0%),

      rgba(255, 133, 0, 0.2),

      transparent 65%

    );

    opacity: 0;

    transition: opacity 250ms ease;

    pointer-events: none;

  }

  > * {

    position: relative;

  }

  &:hover,

  &:focus-visible,

  &.active {

    translate: 0 -4px;

    border-color: rgba(255, 133, 0, 0.75);

    background: #262320;

    box-shadow:

      0 22px 44px rgba(0, 0, 0, 0.4),

      0 0 34px rgba(255, 133, 0, 0.1);

    &::before {

      opacity: 1;

    }

  }

  &:focus-visible {

    outline: 2px solid $accent;

    outline-offset: 3px;

  }

  &.active .node-status {

    background: $accent;

    box-shadow: 0 0 12px rgba(255, 133, 0, 0.9);

  }

  &.active .node-open {

    color: $accent;

    border-color: rgba(255, 133, 0, 0.6);

    rotate: 45deg;

  }

}

.node-mail,

.node-dns,

.node-server {

  --fx: -46px;

}

.node-delivery,

.node-network,

.node-support {

  --fx: 46px;

}

.node-mail {

  grid-column: 1;

  grid-row: 1;

}

.node-dns {

  grid-column: 1;

  grid-row: 2;

}

.node-server {

  grid-column: 1;

  grid-row: 3;

}

.node-delivery {

  grid-column: 3;

  grid-row: 1;

}

.node-network {

  grid-column: 3;

  grid-row: 2;

}

.node-support {

  grid-column: 3;

  grid-row: 3;

}

.is-visible .system-node {

  animation: node-in 800ms $ease-out backwards;

  animation-delay: calc(350ms + var(--i) * 120ms);

}

.node-top {

  display: flex;

  align-items: center;

  gap: 12px;

}

.node-status {

  position: relative;

  width: 10px;

  height: 10px;

  flex: 0 0 10px;

  border-radius: 50%;

  background: rgba(255, 255, 255, 0.3);

  transition: 220ms ease;

  &::after {

    content: "";

    position: absolute;

    inset: -4px;

    border-radius: 50%;

    border: 1px solid rgba(255, 133, 0, 0.6);

    opacity: 0;

    animation: status-ping 2.8s ease-out infinite;

    animation-delay: calc(var(--i, 0) * 0.4s);

  }

}

.node-titles {

  flex: 1;

  min-width: 0;

  display: flex;

  flex-direction: column;

  gap: 3px;

  strong {

    font-size: 20px;

    font-weight: 700;

    line-height: 1.2;

  }

  small {

    color: $text-2;

    font-size: 14px;

    line-height: 1.3;

  }

}

.node-open {

  width: 28px;

  height: 28px;

  flex: 0 0 28px;

  display: grid;

  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.18);

  border-radius: 50%;

  color: $text-2;

  font-size: 18px;

  line-height: 1;

  transition:

    color 220ms ease,

    border-color 220ms ease,

    rotate 300ms $ease-out;

}

.node-chips {

  display: flex;

  flex-wrap: wrap;

  gap: 6px;

  span {

    padding: 4px 10px;

    border: 1px solid rgba(255, 255, 255, 0.12);

    border-radius: 999px;

    background: rgba(255, 255, 255, 0.05);

    color: $text-2;

    font-size: 13px;

    line-height: 1.4;

    transition:

      border-color 200ms ease,

      color 200ms ease;

  }

  .chip-more {

    color: $accent;

    border-color: rgba(255, 133, 0, 0.4);

  }

}

.system-node:hover .node-chips span:not(.chip-more) {

  border-color: rgba(255, 133, 0, 0.35);

  color: $text;

}

.is-visible .node-chips span {

  animation: chip-in 500ms $ease-out backwards;

  animation-delay: calc(800ms + var(--i) * 120ms + var(--j) * 70ms);

}

/* ---------- Detail ---------- */

.detail {

  min-height: 104px;

  padding: 20px 28px;

  display: flex;

  align-items: center;

  background: #100f0d;

  border-top: 1px solid rgba(255, 255, 255, 0.08);

  transition: opacity 700ms ease 1.2s;

}

.detail-hint {

  margin: 0;

  min-height: 1.6em;

  color: $text-3;

  font-size: 15px;

  &.typing::after {

    content: "";

    display: inline-block;

    width: 8px;

    height: 1em;

    margin-left: 3px;

    vertical-align: -2px;

    background: $accent;

    animation: blink 0.8s steps(1) infinite;

  }

}

.detail-content {

  position: relative;

  width: 100%;

  display: flex;

  align-items: center;

  gap: 32px;

  padding-right: 44px;

}

.detail-text {

  flex: 0 1 420px;

  h3 {

    margin: 0 0 6px;

    font-size: 20px;

    color: $accent;

  }

  p {

    margin: 0;

    color: $text-2;

    font-size: 15px;

    line-height: 1.6;

  }

}

.detail-items {

  flex: 1;

  display: flex;

  flex-wrap: wrap;

  gap: 8px;

  span {

    padding: 7px 14px;

    border: 1px solid rgba(255, 255, 255, 0.14);

    border-radius: 999px;

    background: rgba(255, 255, 255, 0.05);

    color: $text;

    font-size: 14px;

    animation: chip-in 420ms $ease-out backwards;

    animation-delay: calc(120ms + var(--j) * 55ms);

  }

}

.detail-close {

  position: absolute;

  top: 50%;

  right: 0;

  width: 32px;

  height: 32px;

  transform: translateY(-50%);

  display: grid;

  place-items: center;

  border: 1px solid rgba(255, 255, 255, 0.16);

  border-radius: 50%;

  background: transparent;

  color: $text;

  font-size: 20px;

  cursor: pointer;

  transition:

    color 200ms ease,

    border-color 200ms ease,

    rotate 300ms $ease-out;

  &:hover {

    color: $accent;

    border-color: rgba(255, 133, 0, 0.6);

    rotate: 90deg;

  }

}

.detail-enter-active,

.detail-leave-active {

  transition:

    opacity 180ms ease,

    transform 180ms ease;

}

.detail-enter-from,

.detail-leave-to {

  opacity: 0;

  transform: translateY(8px);

}

/* ---------- Keyframes ---------- */

@keyframes node-in {

  from {

    opacity: 0;

    translate: var(--fx) 26px;

    scale: 0.93;

  }

  to {

    opacity: 1;

    translate: 0 0;

    scale: 1;

  }

}

@keyframes chip-in {

  from {

    opacity: 0;

    translate: 0 8px;

  }

  to {

    opacity: 1;

    translate: 0 0;

  }

}

@keyframes core-in {

  from {

    opacity: 0;

    scale: 0.55;

    rotate: -50deg;

  }

  to {

    opacity: 1;

    scale: 1;

    rotate: 0deg;

  }

}

@keyframes draw {

  0% {

    stroke-dashoffset: 100;

    opacity: 1;

  }

  70% {

    stroke-dashoffset: 0;

    opacity: 1;

  }

  100% {

    stroke-dashoffset: 0;

    opacity: 0;

  }

}

@keyframes flow {

  from {

    stroke-dashoffset: 0;

  }

  to {

    stroke-dashoffset: -100;

  }

}

@keyframes ripple {

  0% {

    transform: scale(0.65);

    opacity: 0.6;

  }

  100% {

    transform: scale(1.75);

    opacity: 0;

  }

}

@keyframes status-ping {

  0% {

    transform: scale(0.6);

    opacity: 0.8;

  }

  70%,

  100% {

    transform: scale(1.8);

    opacity: 0;

  }

}

@keyframes spin {

  to {

    transform: rotate(360deg);

  }

}

@keyframes scan {

  from {

    top: -2%;

  }

  to {

    top: 102%;

  }

}

@keyframes grid-drift {

  to {

    background-position:

      42px 42px,

      42px 42px;

  }

}

@keyframes blink {

  0%,

  100% {

    opacity: 0.35;

  }

  50% {

    opacity: 1;

  }

}

@media (prefers-reduced-motion: reduce) {

  .dashboard-grid,

  .scan-line,

  .core-pulse,

  .core-sweep,

  .core-ring,

  .core-live i,

  .live-indicator,

  .node-status::after,

  .link-draw,

  .link-flow,

  .core,

  .system-node,

  .node-chips span,

  .detail-items span {

    animation: none !important;

  }

  .system-node {

    transition: none;

    transform: none;

  }

}

/* ---------- Tablet & mobile ---------- */

@media (max-width: 1100px) {

  .dashboard {

    height: auto;

    padding: 24px 20px;

    grid-template-columns: 1fr 1fr;

    grid-template-rows: none;

    gap: 14px;

  }

  .connections {

    display: none;

  }

  .core {

    grid-column: 1 / 3;

    grid-row: auto;

    width: 190px;

    height: 190px;

    margin-bottom: 8px;

  }

  .core-body {

    inset: 34px;

  }

  .system-node {

    grid-column: auto !important;

    grid-row: auto !important;

    margin: 0;

  }

  .detail-content {

    flex-direction: column;

    align-items: flex-start;

    gap: 16px;

  }

  .detail-text {

    flex: none;

  }

}

@media (max-width: 640px) {

  .control-header {

    padding: 0 18px;

    font-size: 13px;

  }

  .dashboard {

    grid-template-columns: 1fr;

    padding: 20px 14px;

  }

  .core {

    grid-column: 1;

  }

  .detail {

    padding: 18px;

  }

}

</style>
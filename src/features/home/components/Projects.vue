<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";
import { previews } from "../../../content/projects/previews";
import { locale } from "../../../i18n/store";
import Link from "../../../components/Link.vue";
import NotchSection from "../../../components/NotchSection.vue";
import { t } from "../../../i18n/utils/translate";

import type { ProjectPreview } from "../../../content/types";

const loadedPreviews = ref<ProjectPreview[] | null>(null);

const emit = defineEmits<{
  (e: "loaded", previews: ProjectPreview[]): void;
}>();

const loadPreviews = async () => {
  if (!locale.value) return;
  const func = previews[locale.value as keyof typeof previews];
  if (!func) return;
  const module = await func();
  loadedPreviews.value = module.default;
  emit("loaded", module.default);
};

watch(locale, loadPreviews);

/* ---------- chữ phụ (vi / en) ---------- */
const isVi = computed(() =>
  String(locale.value ?? "").toLowerCase().startsWith("vi"),
);

const copy = computed(() =>
  isVi.value
    ? {
        // nhãn nhỏ trên từng card (theo thứ tự card)
        roles: ["Kinh nghiệm", "Bất ngờ", "Hỏi đáp"],
        exp: {
          tag: "Kinh nghiệm",
          text: "Mail, DNS, mạng, máy chủ đến hỗ trợ kỹ thuật — những hệ thống mình đã trực tiếp triển khai và vận hành.",
        },
        scope: { tag: "nhóm hệ thống" },
        fun: {
          tag: "Bất ngờ",
          text: "Thư giãn một chút — bấm vào xem trong đó có gì. Chắc là một món quà bất ngờ.",
        },
        ask: {
          tag: "Hỏi đáp",
          text: "Trợ lý AI biết về mình — cứ hỏi mọi thứ về mình mà bạn muốn biết nhé.",
        },
        groups: ["Mail", "Mail delivery", "DNS & bảo mật", "Network", "Server", "Support"],
      }
    : {
        roles: ["Experience", "Surprise", "Ask me"],
        exp: {
          tag: "Experience",
          text: "Mail, DNS, networking, servers and technical support — systems I've deployed and run hands-on.",
        },
        scope: { tag: "system groups" },
        fun: {
          tag: "Surprise",
          text: "Take a break — open it and see what's inside. Probably a little surprise gift.",
        },
        ask: {
          tag: "Ask me",
          text: "An AI assistant that knows me — ask anything about me you'd like to know.",
        },
        groups: ["Mail", "Mail delivery", "DNS & security", "Network", "Server", "Support"],
      },
);

const pad = (n: number) => String(n).padStart(2, "0");

/* card nào đang hover/focus -> ghi chú tương ứng sáng lên */
const active = ref(-1);
let canTilt = false;

const onCardMove = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;

  el.style.setProperty("--mx", `${x}px`);
  el.style.setProperty("--my", `${y}px`);

  if (!canTilt) return;

  el.style.setProperty("--rx", `${-(y / r.height - 0.5) * 6}deg`);
  el.style.setProperty("--ry", `${(x / r.width - 0.5) * 8}deg`);
};

const onCardLeave = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  el.style.setProperty("--rx", "0deg");
  el.style.setProperty("--ry", "0deg");
  active.value = -1;
};

/* lấy từ chính phần System Control Room */
const techChips = [
  "Mailcow",
  "Zimbra",
  "Postfix",
  "SPF · DKIM · DMARC",
  "DNS",
  "VLAN",
  "VPN",
  "Linux",
  "Windows Server",
  "Proxmox",
  "Docker",
  "SSL/TLS",
];

/* dòng chú thích dưới card (chỉ hiện trên mobile/tablet, nơi 2 cột ghi chú bị ẩn) */
const cardNotes = computed(() => [copy.value.exp.text, copy.value.fun.text, copy.value.ask.text]);

/* ---------- hiện dần 1 lần khi cuộn tới (rất nhẹ) ---------- */
const rootRef = ref<HTMLElement | null>(null);
const isIn = ref(false);
const isLive = ref(false); // chỉ true khi section đang nằm trên màn hình -> animation nhàn rỗi mới chạy
let io: IntersectionObserver | null = null;

onMounted(() => {
  loadPreviews();

  canTilt =
    window.matchMedia("(hover: hover)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const el = rootRef.value;

  if (!el || !("IntersectionObserver" in window)) {
    isIn.value = true;
    return;
  }

  io = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.intersectionRatio >= 0.15) isIn.value = true; // hiện ra (1 lần)
        isLive.value = e.isIntersecting; // ra khỏi màn hình thì dừng hết animation nhàn rỗi
      });
    },
    { threshold: [0, 0.15] },
  );

  io.observe(el);
});

onBeforeUnmount(() => io?.disconnect());
</script>

<template>
  <div ref="rootRef" :class="['projects', { 'is-in': isIn, 'is-live': isLive }]">
    <NotchSection class="projects-notch-start" />
    <NotchSection class="projects-notch-end" />

    <div class="grid">
      <div class="projects-title">
        <h2 class="projects-title-copy">
          {{ t("what-i-have") }}
        </h2>
      </div>
    </div>

    <div class="grid projects-stage">
      <!-- 3 card (giữ nguyên kích thước) -->
      <div class="projects-cards">
        <Link
          v-for="(preview, i) in loadedPreviews"
          :key="preview.slug"
          :class="['pcard', `pcard-${i + 1}`]"
          :style="{ '--i': i }"
          :to="`/project/${preview.slug}`"
          :aria-label="t('switch-to-project', { project: preview.title })"
          data-cursor="arrow"
          data-sound="click"
          data-hoversound="hover"
          @focusin="active = i"
          @focusout="active = -1"
        >
          <div
            class="pcard-frame"
            @mouseenter="active = i"
            @mousemove="onCardMove"
            @mouseleave="onCardLeave"
          >
            <div class="pcard-media">
              <img :src="preview.thumbnail" :alt="preview.title" loading="lazy" />

              <span class="pcard-badge">
                {{ pad(i + 1) }}<template v-if="copy.roles[i]"> · {{ copy.roles[i] }}</template>
              </span>

              <span class="pcard-arrow" aria-hidden="true">
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2.4"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="m13 6 6 6-6 6" />
                </svg>
              </span>
            </div>

            <div class="pcard-body">
              <h3 class="pcard-title">{{ preview.title }}</h3>
              <p class="pcard-desc">{{ preview.description }}</p>

              <!-- chỉ hiện dưới lg -->
              <div v-if="i === 0" class="pcard-chips">
                <span v-for="chip in techChips" :key="chip">{{ chip }}</span>
              </div>
              <p v-else-if="cardNotes[i]" class="pcard-note">{{ cardNotes[i] }}</p>
            </div>
          </div>
        </Link>
      </div>

      <!-- Ghi chú hai bên, mỗi cái nối với 1 card (chỉ hiện từ màn lớn) -->
      <aside :class="['note', 'note--l1', { 'is-active': active === 0 }]" style="--n: 0">
        <span class="note-tag"><b>01</b>{{ copy.exp.tag }}</span>
        <p class="note-text">{{ copy.exp.text }}</p>
        <div class="note-chips">
          <span v-for="(chip, k) in techChips" :key="chip" :style="{ '--k': k }">{{ chip }}</span>
        </div>
        <i class="note-link" aria-hidden="true"><span class="note-link-dot"></span></i>
      </aside>

      <aside :class="['note', 'note--r1', { 'is-active': active === 0 }]" style="--n: 1">
        <span class="note-tag"><b>{{ pad(copy.groups.length) }}</b>{{ copy.scope.tag }}</span>
        <ul class="note-groups">
          <li v-for="(group, k) in copy.groups" :key="group" :style="{ '--k': k }">{{ group }}</li>
        </ul>
        <i class="note-link" aria-hidden="true"><span class="note-link-dot"></span></i>
      </aside>

      <aside :class="['note', 'note--l2', { 'is-active': active === 1 }]" style="--n: 2">
        <span class="note-tag"><b>02</b>{{ copy.fun.tag }}</span>
        <p class="note-text">{{ copy.fun.text }}</p>
        <i class="note-link" aria-hidden="true"><span class="note-link-dot"></span></i>
      </aside>

      <aside :class="['note', 'note--r2', { 'is-active': active === 2 }]" style="--n: 3">
        <span class="note-tag"><b>03</b>{{ copy.ask.tag }}</span>
        <p class="note-text">{{ copy.ask.text }}</p>
        <i class="note-link" aria-hidden="true"><span class="note-link-dot"></span></i>
      </aside>
    </div>
  </div>
</template>

<style scoped lang="scss">
$accent: #ff8500;
$line: rgba(20, 18, 16, 0.14);
$ease-out: cubic-bezier(0.2, 0.8, 0.2, 1);

.projects {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  gap: var(--space-xl);
  padding-left: var(--space-outer);
  padding-right: var(--space-outer);
  padding-top: 96px;
  padding-bottom: 96px;
  min-height: calc(var(--lvh) * 100 + var(--radius-xxl));

  /* nền kem + 2 vệt cam rất nhạt + lưới chấm (toàn bộ là gradient tĩnh) */
  background-color: var(--color-beige-400);
  background-image:
    radial-gradient(ellipse 34% 26% at 8% 48%, rgba(255, 133, 0, 0.11), transparent 70%),
    radial-gradient(ellipse 34% 26% at 92% 62%, rgba(255, 133, 0, 0.09), transparent 70%),
    radial-gradient(rgba(20, 18, 16, 0.1) 1px, transparent 1.4px);
  background-size: 100% 100%, 100% 100%, 26px 26px;

  @include mixins.mq("md") {
    padding-top: 144px;
    padding-bottom: 144px;
    gap: var(--space-xxl);
  }

  @include mixins.mq("lg") {
    gap: var(--space-xxxl);
  }

  /* ---------- Title ---------- */
  &-title {
    position: relative;
    padding-top: var(--space-md);
    grid-column: 1 / 13;
    max-width: 100%;

    @include mixins.mq("md") {
      grid-column: 1 / 10;
    }

    @include mixins.mq("lg") {
      grid-column: 3 / 8;
    }

    &-copy {
      color: var(--color-text-400);
      font-weight: 900;
      letter-spacing: 0.01em;
      font-size: clamp(2.5rem, 5vw, 5rem);
      line-height: 0.95;
      white-space: normal;
      text-wrap: balance;

      @include mixins.mq("md") {
        white-space: nowrap;
      }

      @include mixins.mq("sm") {
        font-size: var(--font-size-title-lg);
      }

      @include mixins.mq("xl") {
        font-size: var(--font-size-title-xl);
      }
    }
  }

  /* ---------- Notch ---------- */
  &-notch {
    &-start {
      position: absolute;
      top: 0;
      left: 0;
      transform: translateY(-100%);
      color: var(--color-beige-400);
      --icon-color: var(--color-beige-400);
    }

    &-end {
      position: absolute;
      bottom: 0;
      left: 0;
      color: var(--color-beige-600);
      --icon-color: var(--color-beige-600);
    }
  }

  /* ---------- Cards: dưới lg là 1 cột như cũ ---------- */
  &-cards {
    max-width: 100%;
    grid-column: 1 / span 12;
    display: grid;
    grid-template-columns: minmax(0, 1fr);
    min-width: 0;
    gap: var(--space-lg);

    /* tablet: 1 card lớn + 2 card nhỏ (giống desktop) thay vì 3 card full-width */
    @include mixins.mq("md") {
      grid-column: 2 / span 10;
      grid-template-columns: repeat(2, minmax(0, 1fr));

      .pcard-1 {
        grid-column: 1 / -1;
      }
    }
  }

  /* ---------- Từ lg: card + ghi chú nằm chung 1 lưới 12 cột ---------- */
  @include mixins.mq("lg") {
    &-stage {
      row-gap: var(--space-lg);
    }

    /* các card trở thành ô của lưới chính -> kích thước y hệt bản cũ */
    &-cards {
      display: contents;
    }

    .pcard-1 {
      grid-column: 5 / 9;
      grid-row: 1;
    }

    .pcard-2 {
      grid-column: 5 / 7;
      grid-row: 2;
    }

    .pcard-3 {
      grid-column: 7 / 9;
      grid-row: 2;
    }

    .note--l1 {
      grid-column: 1 / 5;
      grid-row: 1;
    }

    .note--r1 {
      grid-column: 9 / 13;
      grid-row: 1;
    }

    .note--l2 {
      grid-column: 1 / 5;
      grid-row: 2;
    }

    .note--r2 {
      grid-column: 9 / 13;
      grid-row: 2;
    }
  }

  @include mixins.mq("xl") {
    &-stage {
      row-gap: var(--space-xl);
    }
  }
}

.projects-stage {
  width: 100%;
  max-width: 100%;
  min-width: 0;
}

.pcard,
.pcard-frame,
.pcard-body {
  min-width: 0;
  max-width: 100%;
}

/* =========================================================
   GHI CHÚ HAI BÊN
   ========================================================= */
.note {
  display: none;

  @include mixins.mq("lg") {
    position: relative;
    align-self: center;

    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  /* trái: căn phải về phía card */
  &--l1,
  &--l2 {
    align-items: flex-end;
    text-align: right;

    .note-link {
      right: -37px;
    }

    .note-link::after {
      right: -4px;
    }
  }

  /* phải: căn trái về phía card */
  &--r1,
  &--r2 {
    align-items: flex-start;
    text-align: left;

    .note-link {
      left: -37px;
    }

    .note-link::after {
      left: -4px;
    }
  }
}

/* đường nối nét đứt (::before — vẽ ra bằng scaleX) + chấm cam ở đầu (::after) */
.note-link {
  position: absolute;
  top: 50%;
  width: 37px;
  height: 0;

  pointer-events: none;

  &::before {
    content: "";
    position: absolute;
    left: 0;
    right: 0;
    top: 0;

    border-top: 1px dashed rgba(255, 133, 0, 0.65);
    transform-origin: left center;
  }

  &::after {
    content: "";
    position: absolute;
    top: -4.5px;

    width: 8px;
    height: 8px;

    border-radius: 50%;
    background: $accent;
    box-shadow: 0 0 0 4px rgba(255, 133, 0, 0.18);

    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  }
}

.note--r1 .note-link::before,
.note--r2 .note-link::before {
  transform-origin: right center;
}

.note-tag b {
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.note-text {
  transition: color 0.25s ease;
}

/* card đang hover -> ghi chú của nó sáng lên */
.note.is-active {
  .note-text {
    color: var(--color-text-400);
  }

  .note-tag b {
    transform: scale(1.15);
  }

  .note-link::before {
    border-top-style: solid;
    border-top-color: $accent;
  }

  .note-link::after {
    transform: scale(1.5);
  }

  .note-chips span {
    border-color: rgba(255, 133, 0, 0.45);
  }
}

.note-tag {
  display: inline-flex;
  align-items: center;
  gap: 10px;

  color: var(--color-text-300);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;

  b {
    min-width: 30px;
    height: 22px;
    padding: 0 8px;

    display: grid;
    place-items: center;

    border-radius: 999px;
    background: $accent;
    color: #fff;

    font-size: 12px;
    letter-spacing: 0.04em;
  }
}

.note--l1 .note-tag,
.note--l2 .note-tag {
  flex-direction: row-reverse;
}

.note-text {
  max-width: 320px;
  margin: 0;

  color: var(--color-text-300);
  font-size: 16px;
  font-weight: 500;
  line-height: 1.6;
}

.note-chips {
  max-width: 380px;

  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 8px;

  span {
    padding: 6px 13px;

    border: 1px solid $line;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.5);

    color: var(--color-text-400);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.4;

    transition:
      border-color 0.2s ease,
      color 0.2s ease;

    &:hover {
      border-color: rgba(255, 133, 0, 0.6);
      color: $accent;
    }
  }
}

.note-groups {
  width: 100%;
  max-width: 340px;
  margin: 0;
  padding: 0;

  display: grid;
  grid-template-columns: 1fr 1fr;
  column-gap: 24px;

  list-style: none;

  li {
    position: relative;

    padding: 11px 0 11px 16px;
    border-bottom: 1px dashed $line;

    color: var(--color-text-400);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.3;

    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 50%;

      width: 6px;
      height: 6px;

      transform: translateY(-50%);
      border-radius: 50%;
      background: $accent;
    }
  }
}

/* =========================================================
   CARD
   ========================================================= */
.pcard {
  position: relative;
  display: block;
  border-radius: 22px;

  transition: translate 0.25s $ease-out;

  @include mixins.hover {
    &:hover {
      translate: 0 -4px;

      .pcard-frame {
        animation-play-state: paused;
        border-color: rgba(255, 133, 0, 0.6);
        box-shadow:
          inset 0 1px 0 rgba(255, 255, 255, 0.9),
          0 20px 44px rgba(255, 133, 0, 0.16);
      }

      .pcard-media img {
        transform: scale(1.05);
      }

      .pcard-frame::before,
      .pcard-media::after {
        opacity: 1;
      }

      .pcard-arrow svg {
        animation-play-state: paused;
        transform: rotate(-45deg);
      }
    }
  }

  &:focus-visible {
    outline: 2px solid $accent;
    outline-offset: 4px;
  }
}

.pcard-frame {
  position: relative;
  height: 100%;

  display: flex;
  flex-direction: column;

  padding: 8px;

  border: 1px solid rgba(20, 18, 16, 0.09);
  border-radius: 22px;

  background: rgba(255, 255, 255, 0.55);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 10px 28px rgba(70, 45, 20, 0.08);

  /* nghiêng nhẹ theo con trỏ (JS chỉ set --rx / --ry khi đang hover) */
  transform: perspective(900px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));

  transition:
    transform 0.18s ease-out,
    border-color 0.25s ease,
    box-shadow 0.25s ease;

  /* ánh cam ấm bám theo con trỏ */
  &::before {
    content: "";
    position: absolute;
    inset: 0;

    border-radius: inherit;
    background: radial-gradient(
      260px circle at var(--mx, 50%) var(--my, 0%),
      rgba(255, 133, 0, 0.14),
      transparent 65%
    );

    opacity: 0;
    transition: opacity 0.25s ease;
    pointer-events: none;
  }
}

.pcard-media {
  position: relative;

  aspect-ratio: 16 / 9;
  overflow: hidden;

  border-radius: 16px;
  background: var(--color-beige-500);

  img {
    width: 100%;
    height: 100%;
    display: block;
    object-fit: cover;

    transition: transform 0.5s $ease-out;
  }
}

.pcard-media::after {
  content: "";
  position: absolute;
  inset: 0;

  background: radial-gradient(
    220px circle at var(--mx, 50%) var(--my, 30%),
    rgba(255, 255, 255, 0.24),
    transparent 65%
  );

  opacity: 0;
  transition: opacity 0.25s ease;
  pointer-events: none;
}

.pcard-badge {
  position: absolute;
  top: 10px;
  left: 10px;

  padding: 4px 10px;

  border-radius: 999px;
  background: rgba(20, 18, 16, 0.68);
  color: #fff;

  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  white-space: nowrap;
}

.pcard-arrow {
  position: absolute;
  right: 10px;
  bottom: 10px;

  width: 38px;
  height: 38px;

  display: grid;
  place-items: center;

  border-radius: 50%;
  background: $accent;
  color: #fff;

  box-shadow: 0 6px 16px rgba(255, 133, 0, 0.4);

  svg {
    transition: transform 0.25s $ease-out;
  }
}

.pcard-body {
  position: relative;
  flex: 1;

  display: flex;
  flex-direction: column;
  gap: 2px;

  padding: 12px 6px 6px;
}

.pcard-title {
  margin: 0;

  color: var(--color-text-400);
  font-size: var(--font-size-title-xs);
  font-weight: 700;
  line-height: 1.25;
}

.pcard-desc {
  margin: 0;

  color: var(--color-text-300);
  font-size: var(--font-size-md);
  font-weight: 500;
  line-height: 1.4;
}

/* 2 card nhỏ (từ lg) — thu chữ cho vừa, kích thước card giữ nguyên */
@include mixins.mq("lg") {
  .pcard-2,
  .pcard-3 {
    .pcard-title {
      font-size: 17px;
    }

    .pcard-desc {
      font-size: 14px;
    }

    .pcard-arrow {
      right: 8px;
      bottom: 8px;

      width: 32px;
      height: 32px;
    }

    .pcard-badge {
      top: 8px;
      left: 8px;

      padding: 3px 8px;
      font-size: 10px;
    }
  }
}

/* =========================================================
   HIỆN RA KHI CUỘN TỚI — chạy 1 lần, chỉ dùng opacity/transform
   Trình tự: tiêu đề -> 3 card -> ghi chú trượt vào -> chip nảy ra
             -> đường nối vẽ ra -> chấm cam bật lên
   ========================================================= */
.projects.is-in {
  .projects-title {
    animation: projects-in 0.7s $ease-out backwards;
  }

  .pcard-1 {
    animation: card-in 0.8s $ease-out 0.1s backwards;
  }

  .pcard-2 {
    animation: card-in-l 0.8s $ease-out 0.28s backwards;
  }

  .pcard-3 {
    animation: card-in-r 0.8s $ease-out 0.38s backwards;
  }

  .note--l1,
  .note--l2 {
    animation: note-in-l 0.7s $ease-out backwards;
    animation-delay: calc(var(--n, 0) * 90ms + 350ms);
  }

  .note--r1,
  .note--r2 {
    animation: note-in-r 0.7s $ease-out backwards;
    animation-delay: calc(var(--n, 0) * 90ms + 350ms);
  }

  .note-tag b {
    animation: pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    animation-delay: calc(var(--n, 0) * 90ms + 600ms);
  }

  .note-chips span {
    animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    animation-delay: calc(650ms + var(--k, 0) * 45ms);
  }

  .note-groups li {
    animation: item-in 0.5s $ease-out backwards;
    animation-delay: calc(650ms + var(--k, 0) * 70ms);
  }

  .note-link::before {
    animation: line-draw 0.6s $ease-out backwards;
    animation-delay: calc(var(--n, 0) * 90ms + 800ms);
  }

  .note-link::after {
    animation: pop 0.45s cubic-bezier(0.34, 1.56, 0.64, 1) backwards;
    animation-delay: calc(var(--n, 0) * 90ms + 1250ms);
  }
}

@keyframes projects-in {
  from {
    opacity: 0;
    transform: translateY(22px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes card-in {
  from {
    opacity: 0;
    transform: translateY(28px) scale(0.96);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes card-in-l {
  from {
    opacity: 0;
    transform: translateY(30px) rotate(-3deg) scale(0.96);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes card-in-r {
  from {
    opacity: 0;
    transform: translateY(30px) rotate(3deg) scale(0.96);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes note-in-l {
  from {
    opacity: 0;
    transform: translateX(-28px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes note-in-r {
  from {
    opacity: 0;
    transform: translateX(28px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes item-in {
  from {
    opacity: 0;
    transform: translateX(14px);
  }

  to {
    opacity: 1;
    transform: none;
  }
}

@keyframes pop {
  from {
    opacity: 0;
    transform: scale(0.4);
  }

  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes line-draw {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

/* =========================================================
   MOBILE / TABLET: ghi chú nằm ngay trong card
   ========================================================= */
.pcard-note {
  margin: 8px 0 0;
  padding-top: 8px;

  border-top: 1px dashed $line;

  color: var(--color-text-300);
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

/* hàng chip cuộn ngang, không chiếm nhiều chiều cao */
.pcard-chips {
  min-width: 0;
  max-width: 100%;

  margin-top: 10px;
  padding-bottom: 2px;

  display: flex;
  gap: 6px;

  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    display: none;
  }

  span {
    flex: none;

    padding: 5px 11px;

    border: 1px solid $line;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.6);

    color: var(--color-text-400);
    font-size: 12.5px;
    font-weight: 600;
    white-space: nowrap;
  }
}

@include mixins.mq("lg") {
  .pcard-note,
  .pcard-chips {
    display: none;
  }
}

/* =========================================================
   ANIMATION NHÀN RỖI — chỉ chạy khi section đang trong màn hình
   (.is-live), chỉ transform/opacity nên rất nhẹ, tạm dừng khi hover
   ========================================================= */

/* chấm sáng chạy dọc đường nối: ghi chú -> card */
.note-link-dot {
  position: absolute;
  top: -2.5px;
  left: 0;

  width: 5px;
  height: 5px;

  border-radius: 50%;
  background: #ffb45c;

  opacity: 0;
}

.projects.is-live {
  .note--l1 .note-link-dot,
  .note--l2 .note-link-dot {
    animation: flow-r 2.8s ease-in-out infinite;
    animation-delay: calc(var(--n, 0) * 0.45s + 2s);
  }

  .note--r1 .note-link-dot,
  .note--r2 .note-link-dot {
    animation: flow-l 2.8s ease-in-out infinite;
    animation-delay: calc(var(--n, 0) * 0.45s + 2s);
  }

  /* mũi tên gợi ý "bấm vào được" */
  .pcard-arrow svg {
    animation: nudge 2.6s ease-in-out 2s infinite;
  }

  /* 3 card trôi nhẹ lên xuống, lệch nhịp nhau (chỉ desktop) */
  @include mixins.mq("lg") {
    .pcard-1 .pcard-frame {
      animation: float 6s ease-in-out 1.8s infinite;
    }

    .pcard-2 .pcard-frame {
      animation: float 6.8s ease-in-out 2.2s infinite;
    }

    .pcard-3 .pcard-frame {
      animation: float 7.4s ease-in-out 2.6s infinite;
    }
  }
}

@keyframes float {
  0%,
  100% {
    translate: 0 0;
  }

  50% {
    translate: 0 -5px;
  }
}

@keyframes nudge {
  0%,
  60%,
  100% {
    translate: 0 0;
  }

  80% {
    translate: 3px 0;
  }
}

@keyframes flow-r {
  0% {
    opacity: 0;
    translate: 0 0;
  }

  15%,
  85% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    translate: 32px 0;
  }
}

@keyframes flow-l {
  0% {
    opacity: 0;
    translate: 32px 0;
  }

  15%,
  85% {
    opacity: 1;
  }

  100% {
    opacity: 0;
    translate: 0 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .projects.is-in .projects-title,
  .projects.is-in .pcard,
  .projects.is-in .note,
  .projects.is-in .note-tag b,
  .projects.is-in .note-chips span,
  .projects.is-in .note-groups li,
  .projects.is-in .note-link::before,
  .projects.is-in .note-link::after {
    animation: none !important;
  }

  .projects.is-live .pcard-frame,
  .projects.is-live .pcard-arrow svg,
  .projects.is-live .note-link-dot {
    animation: none !important;
  }

  .pcard,
  .pcard-frame,
  .pcard-media img,
  .pcard-arrow svg {
    transition: none;
  }
}
</style>
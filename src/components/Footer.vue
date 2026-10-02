<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import Social from "./Social.vue";
import LangSwitch from "./LangSwitch.vue";
import NotchSection from "./NotchSection.vue";
import { lenis } from "../composables/useScroll";

interface Props {
  withSocial?: boolean;
}

const { withSocial = true } = defineProps<Props>();

const handleBackToTop = () => {
  if (!lenis.value) return;
  lenis.value.scrollTo(0);
};

/* Copyright tách chữ để làm hiệu ứng sóng */
const copyrightChars = [...`© ${new Date().getFullYear()} Bình Duy`].map((c) =>
  c === " " ? "\u00A0" : c
);

/* Sparkles */
const sparkles = [
  { left: "8%", size: 10, delay: 0, duration: 9 },
  { left: "22%", size: 7, delay: 3, duration: 11 },
  { left: "41%", size: 12, delay: 6, duration: 10 },
  { left: "63%", size: 8, delay: 1.5, duration: 12 },
  { left: "79%", size: 11, delay: 4.5, duration: 9.5 },
  { left: "92%", size: 7, delay: 7, duration: 11 },
];

/* Giờ HCMC */
const time = ref("");
let timer: number | undefined;

const updateTime = () => {
  time.value = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  }).format(new Date());
};

/* Spotlight theo chuột */
const footerRef = ref<HTMLElement | null>(null);

const onFooterMove = (e: PointerEvent) => {
  if (e.pointerType !== "mouse" || !footerRef.value) return;
  const r = footerRef.value.getBoundingClientRect();
  footerRef.value.style.setProperty("--sx", `${e.clientX - r.left}px`);
  footerRef.value.style.setProperty("--sy", `${e.clientY - r.top}px`);
};

/* Nút back-to-top "từ tính" */
const bttWrapRef = ref<HTMLElement | null>(null);
const bttRef = ref<HTMLElement | null>(null);

const onBttMove = (e: PointerEvent) => {
  if (e.pointerType !== "mouse" || !bttWrapRef.value || !bttRef.value) return;
  const r = bttWrapRef.value.getBoundingClientRect();
  const x = (e.clientX - (r.left + r.width / 2)) * 0.35;
  const y = (e.clientY - (r.top + r.height / 2)) * 0.35;
  bttRef.value.style.setProperty("--bx", `${x}px`);
  bttRef.value.style.setProperty("--by", `${y}px`);
};

const onBttLeave = () => {
  if (!bttRef.value) return;
  bttRef.value.style.setProperty("--bx", "0px");
  bttRef.value.style.setProperty("--by", "0px");
};

/* Reveal khi cuộn tới */
const contentRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);
let observer: IntersectionObserver | undefined;

onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 20000);

  observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];

      if (!entry) return;

      if (entry.isIntersecting) {
        isVisible.value = true;
        observer?.disconnect();
      }
    },
    { threshold: 0.15 }
  );
  if (contentRef.value) observer.observe(contentRef.value);
});

onBeforeUnmount(() => {
  clearInterval(timer);
  observer?.disconnect();
});
</script>

<template>
  <footer ref="footerRef" class="footer" @pointermove="onFooterMove">
    <NotchSection class="footer-notch" />

    <!-- FX layer: tự cắt, không ảnh hưởng layout / notch -->
    <div class="footer-fx" aria-hidden="true">
      <div class="footer-aurora footer-aurora--a"></div>
      <div class="footer-aurora footer-aurora--b"></div>
      <div class="footer-aurora footer-aurora--c"></div>
      <div class="footer-spot"></div>
      <span
        v-for="(s, i) in sparkles"
        :key="i"
        class="footer-sparkle"
        :style="{
          left: s.left,
          fontSize: s.size + 'px',
          animationDelay: s.delay + 's',
          animationDuration: s.duration + 's',
        }"
        >✦</span
      >
    </div>

    <div
      ref="contentRef"
      class="footer-content"
      :class="{ 'is-visible': isVisible }"
    >
      <!-- Back to top -->
      <div
        ref="bttWrapRef"
        class="footer-back-to-top footer-fade"
        role="button"
        tabindex="0"
        aria-label="Back to top"
        @click="handleBackToTop"
        @keydown.enter="handleBackToTop"
        @pointermove="onBttMove"
        @pointerleave="onBttLeave"
        data-cursor="circle-white"
        data-sound="click"
        data-hoversound="hover"
      >
        <span ref="bttRef" class="footer-btt">
          <span class="footer-btt-ping"></span>
          <span class="footer-btt-arrows">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20V5M5 12l7-7 7 7" />
            </svg>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 20V5M5 12l7-7 7 7" />
            </svg>
          </span>
        </span>
      </div>

      <!-- Top -->
      <div class="footer-top footer-reveal" style="--delay: 0.1s">
        <Social v-if="withSocial" />

        <div class="footer-language">
          <LangSwitch />
        </div>
      </div>

      <!-- Bottom -->
      <div class="footer-bottom footer-reveal" style="--delay: 0.2s">
        <div class="footer-line"></div>

        <p class="footer-copyright">
          <span
            v-for="(c, i) in copyrightChars"
            :key="i"
            class="footer-char"
            :style="{ '--i': i }"
            >{{ c }}</span
          >
        </p>

        <p class="footer-time">
          <span class="footer-time-dot"></span>
          HCMC · {{ time }}
        </p>
      </div>
    </div>
  </footer>
</template>

<style scoped lang="scss">
.footer {
  /* Đổi màu: sửa các biến này là đổi toàn bộ footer */
  --footer-bg: #0b1220;
  --footer-text: #eef2fa;
  --footer-text-muted: rgba(238, 242, 250, 0.6);
  --footer-line: rgba(238, 242, 250, 0.28);
  --footer-accent: #2f5bff;
  --footer-accent-soft: #7f9bff;

  background: var(--footer-bg);
  color: var(--footer-text);
  width: 100%;
  display: flex;
  justify-content: center;
  position: relative;
  overflow-x: clip; /* chốt chặn: không bao giờ sinh thanh cuộn ngang */

  &-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xl);
    width: 100%;
    max-width: calc(var(--breakpoint-xxxl));
    padding: calc(var(--space-outer) + var(--space-sm)) var(--space-outer);
    position: relative;
    z-index: 1;
  }

  /* ================= FX ================= */
  &-fx {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  &-aurora {
    position: absolute;
    border-radius: 50%;
    filter: blur(80px);

    &--a {
      width: 420px;
      height: 420px;
      left: -120px;
      bottom: -260px;
      background: radial-gradient(circle, var(--footer-accent), transparent 70%);
      opacity: 0.4;
      animation: aurora-a 18s ease-in-out infinite alternate;
    }

    &--b {
      width: 360px;
      height: 360px;
      right: -100px;
      top: -220px;
      background: radial-gradient(circle, var(--footer-accent-soft), transparent 70%);
      opacity: 0.22;
      animation: aurora-b 22s ease-in-out infinite alternate;
    }

    &--c {
      width: 300px;
      height: 300px;
      left: 40%;
      bottom: -240px;
      background: radial-gradient(circle, #5b7bff, transparent 70%);
      opacity: 0.2;
      animation: aurora-c 15s ease-in-out infinite alternate;
    }
  }

  /* spotlight đi theo chuột */
  &-spot {
    position: absolute;
    inset: 0;
    background: radial-gradient(
      320px circle at var(--sx, 50%) var(--sy, 130%),
      rgba(47, 91, 255, 0.16),
      transparent 65%
    );
  }

  /* chữ khổng lồ ở đáy, có vệt sáng lướt qua */
  &-watermark {
    position: absolute;
    left: 50%;
    bottom: -0.3em;
    transform: translateX(-50%);
    font-size: clamp(6rem, 19vw, 17rem);
    font-weight: 800;
    line-height: 1;
    letter-spacing: 0.02em;
    white-space: nowrap;
    color: transparent;
    background: linear-gradient(
        100deg,
        rgba(238, 242, 250, 0.05) 35%,
        rgba(127, 155, 255, 0.4) 50%,
        rgba(238, 242, 250, 0.05) 65%
      )
      0 0 / 250% 100%;
    -webkit-background-clip: text;
    background-clip: text;
    animation: shimmer 7s ease-in-out infinite;
  }

  &-sparkle {
    position: absolute;
    bottom: -20px;
    color: var(--footer-accent);
    opacity: 0;
    animation: sparkle-up linear infinite;
  }

  /* ================= Back to top ================= */
  &-back-to-top {
    cursor: pointer;
    color: var(--footer-text);
    outline: none;
    padding: 12px; /* tăng vùng hút từ tính */
    margin: -12px;

    @include mixins.mq("md") {
      position: absolute;
      top: calc(var(--space-outer) + var(--space-sm) - 12px);
      left: 50%;
      transform: translateX(-50%);
    }
  }

  &-btt {
    --bx: 0px;
    --by: 0px;
    position: relative;
    display: grid;
    place-items: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    border: 1px solid var(--footer-line);
    transform: translate(var(--bx), var(--by));
    transition:
      transform 0.3s cubic-bezier(0.22, 1, 0.36, 1),
      background 0.3s,
      border-color 0.3s,
      color 0.3s;

    &-ping {
      position: absolute;
      inset: -1px;
      border-radius: 50%;
      border: 1px solid var(--footer-accent);
      animation: ping 2.4s ease-out infinite;
    }

    &-arrows {
      position: relative;
      width: 18px;
      height: 18px;
      overflow: hidden;

      svg {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        transition: transform 0.4s cubic-bezier(0.22, 1, 0.36, 1);

        &:last-child {
          transform: translateY(150%);
        }
      }
    }
  }

  &-back-to-top:hover &-btt,
  &-back-to-top:focus-visible &-btt {
    background: var(--footer-accent);
    border-color: var(--footer-accent);
    color: #fff;

    .footer-btt-arrows svg:first-child {
      transform: translateY(-150%);
    }
    .footer-btt-arrows svg:last-child {
      transform: translateY(0);
    }
  }

  /* ================= Top ================= */
  &-top {
    display: flex;
    flex-direction: column;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    gap: var(--space-xl);

    @include mixins.mq("md") {
      flex-direction: row;
      gap: var(--space-md);
    }
  }

  &-language {
    margin-left: auto;
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

    &:hover {
      transform: scale(1.06);
    }

    /* ép component con theo màu footer */
    :deep(*) {
      color: var(--footer-text) !important;
      border-color: var(--footer-line) !important;
    }
  }

  /* ================= Bottom ================= */
  &-bottom {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-sm);
    width: 100%;
    padding-top: var(--space-md);

    @include mixins.mq("md") {
      flex-direction: row;
    }
  }

  /* đường kẻ + vệt sáng: animate background-position, KHÔNG tràn ra ngoài */
  &-line {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 1px;
    background:
      linear-gradient(90deg, transparent, var(--footer-accent), transparent) -200px 0 / 200px 100% no-repeat,
      rgba(238, 242, 250, 0.1);
    animation: line-shine 5s ease-in-out infinite;
  }

  &-copyright {
    font-size: var(--font-size-sm);
    color: var(--footer-text-muted);
    cursor: default;
  }

  &-char {
    display: inline-block;
  }

  &-copyright:hover &-char {
    animation: hop 0.5s ease calc(var(--i) * 30ms);
    color: var(--footer-text);
  }

  &-time {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: var(--font-size-sm);
    font-variant-numeric: tabular-nums;
    color: var(--footer-text-muted);

    &-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #3ddc84;
      animation: pulse 2s ease-out infinite;
    }
  }

  /* ================= Reveal ================= */
  &-reveal {
    opacity: 0;
    transform: translateY(24px);
    transition:
      opacity 0.8s ease var(--delay, 0s),
      transform 0.8s cubic-bezier(0.22, 1, 0.36, 1) var(--delay, 0s);
  }

  /* back-to-top chỉ fade (tránh đụng translateX(-50%)) */
  &-fade {
    opacity: 0;
    transition: opacity 0.8s ease;
  }

  &-content.is-visible &-reveal {
    opacity: 1;
    transform: none;
  }

  &-content.is-visible &-fade {
    opacity: 1;
  }

  /* ================= Notch ================= */
  &-notch {
    position: absolute;
    top: 0;
    left: 0;
    transform: translateY(-100%);
    color: var(--footer-bg);
    --icon-color: var(--footer-bg);
  }
}

@keyframes aurora-a {
  to { transform: translate(55vw, -40px) scale(1.25); }
}
@keyframes aurora-b {
  to { transform: translate(-45vw, 60px) scale(1.2); }
}
@keyframes aurora-c {
  to { transform: translate(-30vw, -30px) scale(1.3); }
}
@keyframes shimmer {
  0%   { background-position: 120% 0; }
  100% { background-position: -20% 0; }
}
@keyframes sparkle-up {
  0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
  15%  { opacity: 0.9; }
  85%  { opacity: 0.6; }
  100% { transform: translateY(-240px) rotate(180deg); opacity: 0; }
}
@keyframes ping {
  0%   { transform: scale(1); opacity: 0.8; }
  100% { transform: scale(1.7); opacity: 0; }
}
@keyframes line-shine {
  0%   { background-position: -200px 0, 0 0; }
  100% { background-position: calc(100% + 200px) 0, 0 0; }
}
@keyframes hop {
  0%, 100% { transform: translateY(0); }
  40%      { transform: translateY(-6px); }
}
@keyframes pulse {
  0%   { box-shadow: 0 0 0 0 rgba(61, 220, 132, 0.6); }
  100% { box-shadow: 0 0 0 10px rgba(61, 220, 132, 0); }
}

@media (prefers-reduced-motion: reduce) {
  .footer-aurora,
  .footer-watermark,
  .footer-sparkle,
  .footer-btt-ping,
  .footer-line,
  .footer-time-dot {
    animation: none;
  }
  .footer-reveal,
  .footer-fade {
    opacity: 1;
    transform: none;
    transition: none;
  }
}
</style>
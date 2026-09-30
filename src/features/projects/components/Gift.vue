<script setup lang="ts">
import { computed, ref } from "vue";
import { locale } from "../../../i18n/store";

export interface Props {}

type Gift = {
  icon: string;
  vi: string;
  en: string;
};

const gifts: Gift[] = [
  {
    icon: "🫂",
    vi: "Một cái ôm to bự",
    en: "A Big Warm Hug",
  },
  {
    icon: "🐦",
    vi: "Một con chim",
    en: "A Little Bird",
  },
  {
    icon: "💋🌪️",
    vi: "Một nụ hôn lốc xoáy kiểu Pháp",
    en: "A French Tornado Kiss",
  },
];

const selectedGift = ref(
  gifts[Math.floor(Math.random() * gifts.length)]!,
);

const isOpened = ref(false);

const isVietnamese = computed(() => locale.value === "vi");

const giftName = computed(() =>
  isVietnamese.value
    ? selectedGift.value.vi
    : selectedGift.value.en,
);

const openGift = () => {
  if (isOpened.value) return;

  isOpened.value = true;
};

/* ---------- chỉ phục vụ giao diện ---------- */

const heading = computed(() =>
  isOpened.value
    ? isVietnamese.value
      ? "Quà của bạn."
      : "Your gift."
    : isVietnamese.value
      ? "Có một món quà đang chờ."
      : "There's a gift waiting.",
);

const subtitle = computed(() =>
  isVietnamese.value
    ? "Bấm vào hộp quà để mở nhé."
    : "Click the gift box to open it.",
);

const boxLabel = computed(() => {
  if (isOpened.value) return giftName.value;
  return isVietnamese.value ? "Mở hộp quà" : "Open the gift box";
});

// tên quà tách thành từng chữ để hiện lần lượt
const nameWords = computed(() => {
  let n = 0;
  return giftName.value
    .normalize("NFC")
    .split(" ")
    .map((word) => ({
      chars: Array.from(word).map((ch) => ({ ch, i: n++ })),
    }));
});

// con trỏ: ánh sáng đi theo + hộp nghiêng nhẹ
const onMove = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  const r = el.getBoundingClientRect();
  const x = e.clientX - r.left;
  const y = e.clientY - r.top;
  el.style.setProperty("--px", `${x}px`);
  el.style.setProperty("--py", `${y}px`);
  el.style.setProperty("--nx", `${(x / r.width) * 2 - 1}`);
  el.style.setProperty("--ny", `${(y / r.height) * 2 - 1}`);
};

const onLeave = (e: MouseEvent) => {
  const el = e.currentTarget as HTMLElement;
  el.style.setProperty("--nx", "0");
  el.style.setProperty("--ny", "0");
};

// bụi vàng trôi (giá trị cố định, không random để tránh lệch khi render)
const dust = Array.from({ length: 22 }, (_, i) => ({
  left: `${(i * 53 + 11) % 100}%`,
  size: 2 + (i % 3),
  dur: 11 + ((i * 7) % 9),
  delay: -((i * 5) % 14),
  drift: ((i % 5) - 2) * 16,
}));

// ngôi sao lấp lánh quanh hộp
const twinkles = [
  { l: "18%", t: "26%", s: 14, d: 0 },
  { l: "82%", t: "30%", s: 12, d: 1.2 },
  { l: "26%", t: "62%", s: 10, d: 2.1 },
  { l: "75%", t: "66%", s: 16, d: 0.6 },
  { l: "12%", t: "48%", s: 9, d: 1.7 },
  { l: "88%", t: "52%", s: 11, d: 2.6 },
  { l: "36%", t: "18%", s: 10, d: 0.9 },
  { l: "64%", t: "16%", s: 13, d: 1.9 },
];

// pháo giấy bung ra khi mở
const confettiColors = ["#d2ab59", "#f3dc9a", "#c2364a", "#f5eee3", "#e7a3ad"];

const confetti = Array.from({ length: 40 }, (_, i) => {
  const angle = (i / 40) * Math.PI * 2 + (i % 3) * 0.15;
  const dist = 120 + ((i * 37) % 150);
  return {
    tx: Math.round(Math.cos(angle) * dist),
    ty: Math.round(Math.sin(angle) * dist * 0.8 - 100),
    rot: ((i * 67) % 360) - 180,
    color: confettiColors[i % confettiColors.length],
    w: 6 + (i % 3) * 2,
    h: i % 2 ? 6 : 12,
    delay: (i % 6) * 24,
  };
});
</script>

<template>
  <section
    class="gift"
    :class="{ 'gift-opened': isOpened }"
    @click="openGift"
    @mousemove="onMove"
    @mouseleave="onLeave"
  >
    <!-- Nền -->
    <div class="gift-bg" aria-hidden="true">
      <div class="gift-spot"></div>
      <div class="gift-beams"></div>
      <div class="gift-cursor"></div>
    </div>

    <div class="gift-dust" aria-hidden="true">
      <i
        v-for="(d, i) in dust"
        :key="i"
        :style="{
          '--l': d.left,
          '--s': `${d.size}px`,
          '--dur': `${d.dur}s`,
          '--dl': `${d.delay}s`,
          '--dx': `${d.drift}px`,
        }"
      ></i>
      <span
        v-for="(t, i) in twinkles"
        :key="`t${i}`"
        class="twinkle"
        :style="{
          left: t.l,
          top: t.t,
          fontSize: `${t.s}px`,
          animationDelay: `${t.d}s`,
        }"
      >
        ✦
      </span>
    </div>

    <div class="gift-content">
      <header class="gift-heading">
        <Transition name="swap" mode="out-in">
          <h2 :key="isOpened ? 'opened' : 'closed'" :class="{ done: isOpened }">
            {{ heading }}
          </h2>
        </Transition>

        <p
          class="gift-sub"
          :class="{ hidden: isOpened }"
          :aria-hidden="isOpened"
        >
          {{ subtitle }}
        </p>
      </header>

      <div class="gift-stage">
        <div class="gift-floor"></div>
        <div class="gift-aura"></div>
        <span class="tap-ring" aria-hidden="true"></span>

        <button class="gift-box" type="button" :aria-label="boxLabel">
          <span class="gift-tilt">
            <span class="gift-float">
              <!-- Tia sáng + sóng xung kích -->
              <span class="rays"></span>
              <span class="burst"></span>

              <!-- Lớp sau: bóng đổ và lòng hộp -->
              <svg
                class="layer layer-back"
                viewBox="0 0 320 320"
                aria-hidden="true"
              >
                <defs>
                  <radialGradient id="gb-inside" cx="50%" cy="50%" r="60%">
                    <stop offset="0" stop-color="#fff6c9" />
                    <stop offset="0.5" stop-color="#ffd25a" />
                    <stop offset="1" stop-color="#b8862b" />
                  </radialGradient>
                </defs>

                <g transform="translate(10 0)">
                  <ellipse class="floor-shadow" cx="150" cy="296" rx="124" ry="13" />
                  <polygon points="52,156 192,156 248,130 108,130" fill="#1a0407" />
                  <polygon
                    class="inside-glow"
                    points="66,153 182,153 236,132 120,132"
                    fill="url(#gb-inside)"
                  />
                </g>
              </svg>

              <!-- Cột sáng bốc lên từ miệng hộp -->
              <span class="beam"></span>

              <!-- Vòng sao xoay quanh món quà -->
              <span class="orbit"></span>

              <!-- Món quà trồi lên từ trong hộp -->
              <span class="gift-reveal">
                <span class="gift-icon">{{ selectedGift.icon }}</span>
              </span>

              <!-- Lớp trước: thân hộp, nắp, nơ (khối 3D) -->
              <svg
                class="layer layer-front"
                viewBox="0 0 320 320"
                aria-hidden="true"
              >
                <defs>
                  <linearGradient id="gb-front" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#56101b" />
                    <stop offset="0.3" stop-color="#8d1c2d" />
                    <stop offset="0.6" stop-color="#a92639" />
                    <stop offset="1" stop-color="#851727" />
                  </linearGradient>
                  <linearGradient id="gb-side" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#5f0f1b" />
                    <stop offset="1" stop-color="#3a0811" />
                  </linearGradient>
                  <linearGradient id="gb-lid-front" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#5c0f1b" />
                    <stop offset="0.3" stop-color="#a02134" />
                    <stop offset="0.6" stop-color="#bb2c40" />
                    <stop offset="1" stop-color="#8e1829" />
                  </linearGradient>
                  <linearGradient id="gb-lid-side" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#6a1120" />
                    <stop offset="1" stop-color="#420913" />
                  </linearGradient>
                  <linearGradient id="gb-lid-top" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stop-color="#b52a3e" />
                    <stop offset="1" stop-color="#d94257" />
                  </linearGradient>
                  <linearGradient id="gb-gold" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0" stop-color="#9a7127" />
                    <stop offset="0.45" stop-color="#f0d78e" />
                    <stop offset="0.7" stop-color="#c49c46" />
                    <stop offset="1" stop-color="#8a6628" />
                  </linearGradient>
                  <linearGradient id="gb-gold-top" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stop-color="#d9b25a" />
                    <stop offset="1" stop-color="#f8e8b0" />
                  </linearGradient>
                  <linearGradient id="gb-gold-v" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="#f6e2a4" />
                    <stop offset="1" stop-color="#b58a34" />
                  </linearGradient>
                  <linearGradient id="gb-shade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stop-color="rgba(0,0,0,0.5)" />
                    <stop offset="1" stop-color="rgba(0,0,0,0)" />
                  </linearGradient>
                </defs>

                <g transform="translate(10 0)">
                  <!-- Thân hộp: mặt trước -->
                  <polygon points="52,156 192,156 192,288 52,288" fill="url(#gb-front)" />
                  <rect x="108" y="156" width="28" height="132" fill="url(#gb-gold)" />
                  <rect x="52" y="156" width="140" height="44" fill="url(#gb-shade)" />
                  <path
                    d="M66 178 V274"
                    stroke="rgba(255,255,255,0.11)"
                    stroke-width="5"
                    stroke-linecap="round"
                  />

                  <!-- Thân hộp: mặt bên -->
                  <polygon points="192,156 248,130 248,262 192,288" fill="url(#gb-side)" />
                  <polygon points="192,156 248,130 248,192 192,216" fill="rgba(0,0,0,0.28)" />
                  <path d="M192 156 V288" stroke="rgba(255,255,255,0.16)" stroke-width="1.5" />

                  <!-- Viền miệng hộp (hiện khi nắp bay đi) -->
                  <g class="rim">
                    <path
                      d="M52 156 H192 L248 130"
                      fill="none"
                      stroke="#d04156"
                      stroke-width="2.5"
                      stroke-linejoin="round"
                    />
                    <path
                      d="M52 156 L108 130 H248"
                      fill="none"
                      stroke="#6e1322"
                      stroke-width="2"
                      stroke-linejoin="round"
                    />
                  </g>

                  <!-- Nắp hộp + nơ -->
                  <g class="lid">
                    <polygon points="46,118 198,118 254,92 102,92" fill="url(#gb-lid-top)" />
                    <polygon points="108,118 136,118 192,92 164,92" fill="url(#gb-gold-top)" />
                    <polygon points="198,118 254,92 254,134 198,160" fill="url(#gb-lid-side)" />
                    <polygon points="46,118 198,118 198,160 46,160" fill="url(#gb-lid-front)" />
                    <rect x="108" y="118" width="28" height="42" fill="url(#gb-gold)" />
                    <rect x="46" y="118" width="152" height="6" fill="rgba(255,255,255,0.16)" />
                    <rect x="46" y="152" width="152" height="8" fill="rgba(0,0,0,0.25)" />
                    <path
                      d="M46 118 H198 L254 92"
                      fill="none"
                      stroke="rgba(255,255,255,0.3)"
                      stroke-width="1.2"
                    />

                    <ellipse cx="150" cy="110" rx="34" ry="6" fill="rgba(0,0,0,0.25)" />

                    <g transform="translate(150 104)">
                      <g>
                        <path
                          d="M-2 -2 C-24 -54 -76 -44 -60 -6 C-52 14 -16 12 -2 2 Z"
                          fill="url(#gb-gold-v)"
                          stroke="#8a6628"
                          stroke-width="1.5"
                        />
                        <path
                          d="M-12 -2 C-28 -30 -52 -26 -48 -8"
                          fill="none"
                          stroke="rgba(90,60,15,0.55)"
                          stroke-width="3"
                          stroke-linecap="round"
                        />
                      </g>
                      <g transform="scale(-1 1)">
                        <path
                          d="M-2 -2 C-24 -54 -76 -44 -60 -6 C-52 14 -16 12 -2 2 Z"
                          fill="url(#gb-gold-v)"
                          stroke="#8a6628"
                          stroke-width="1.5"
                        />
                        <path
                          d="M-12 -2 C-28 -30 -52 -26 -48 -8"
                          fill="none"
                          stroke="rgba(90,60,15,0.55)"
                          stroke-width="3"
                          stroke-linecap="round"
                        />
                      </g>
                      <rect x="-14" y="-8" width="28" height="24" rx="9" fill="url(#gb-gold-v)" stroke="#8a6628" stroke-width="1.2" />
                    </g>
                  </g>
                </g>
              </svg>

              <!-- Pháo giấy -->
              <span class="confetti" aria-hidden="true">
                <i
                  v-for="(c, i) in confetti"
                  :key="i"
                  :style="{
                    '--tx': `${c.tx}px`,
                    '--ty': `${c.ty}px`,
                    '--rot': `${c.rot}deg`,
                    '--c': c.color,
                    '--w': `${c.w}px`,
                    '--h': `${c.h}px`,
                    '--d': c.delay,
                  }"
                ></i>
              </span>
            </span>
          </span>
        </button>
      </div>

      <div class="gift-foot" aria-live="polite">
        <div v-if="isOpened" class="gift-result">
          <span class="result-mark" aria-hidden="true">
            <i></i>
            <b>✦</b>
            <i></i>
          </span>

          <h3 :aria-label="giftName">
            <template v-for="(w, wi) in nameWords" :key="wi">
              <span class="word" aria-hidden="true">
                <span
                  v-for="c in w.chars"
                  :key="c.i"
                  class="char"
                  :style="{ '--i': c.i }"
                >{{ c.ch }}</span>
              </span>
              <span v-if="wi < nameWords.length - 1" aria-hidden="true">{{ " " }}</span>
            </template>
          </h3>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped lang="scss">
$gold: #d2ab59;
$gold-light: #f0d78e;
$cream: #f5eee3;
$ease-out: cubic-bezier(0.16, 1, 0.3, 1);
$ease-spring: cubic-bezier(0.34, 1.56, 0.5, 1);

/* miệng hộp tính theo % chiều cao hộp (143 / 320) */
$rim: 44.7%;

.gift {
  grid-column: 1 / 13;
  position: relative;
  width: 100%;
  min-height: 720px;
  /* kéo khối lên sát phần trên; chỉnh số này nếu muốn sát/xa hơn */
  margin-top: var(--gift-pull, -120px);
  overflow: hidden;
  border-radius: var(--radius-xxl, 32px);
  background:
    radial-gradient(circle at 50% 46%, rgba(124, 20, 43, 0.3), transparent 36%),
    radial-gradient(circle at 50% 80%, rgba(212, 175, 55, 0.09), transparent 40%),
    #11100f;
  color: $cream;
  isolation: isolate;

  &:not(.gift-opened) {
    cursor: pointer;
  }

  /* khung viền mảnh bên trong */
  &::after {
    content: "";
    position: absolute;
    inset: 14px;
    border: 1px solid rgba(210, 171, 89, 0.14);
    border-radius: calc(var(--radius-xxl, 32px) - 12px);
    pointer-events: none;
    z-index: 3;
  }
}

/* ---------- Nền ---------- */
.gift-bg {
  position: absolute;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.gift-spot {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    ellipse 55% 60% at 50% 0%,
    rgba(255, 226, 160, 0.12),
    transparent 70%
  );
}

/* chùm sáng từ trên chiếu xuống khi mở quà */
.gift-beams {
  position: absolute;
  inset: 0;
  background: conic-gradient(
    from 0deg at 50% -6%,
    transparent 0 150deg,
    rgba(255, 226, 160, 0.13) 163deg,
    transparent 172deg,
    rgba(255, 226, 160, 0.09) 179deg 181deg,
    transparent 190deg,
    rgba(255, 226, 160, 0.13) 197deg,
    transparent 210deg 360deg
  );
  -webkit-mask-image: linear-gradient(to bottom, black, transparent 75%);
  mask-image: linear-gradient(to bottom, black, transparent 75%);
  opacity: 0;
  transition: opacity 1400ms ease 500ms;

  .gift-opened & {
    opacity: 1;
  }
}

.gift-cursor {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    380px circle at var(--px, 50%) var(--py, 40%),
    rgba(210, 171, 89, 0.09),
    transparent 60%
  );
  opacity: 0;
  transition: opacity 400ms ease;

  .gift:hover & {
    opacity: 1;
  }
}

.gift-dust {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;

  i {
    position: absolute;
    bottom: -10px;
    left: var(--l);
    width: var(--s);
    height: var(--s);
    border-radius: 50%;
    background: rgba(230, 195, 115, 0.75);
    box-shadow: 0 0 8px rgba(230, 195, 115, 0.6);
    opacity: 0;
    animation: dust var(--dur) linear infinite;
    animation-delay: var(--dl);
  }
}

.twinkle {
  position: absolute;
  color: $gold-light;
  text-shadow: 0 0 10px rgba(240, 215, 142, 0.8);
  opacity: 0;
  animation: twinkle 4s ease-in-out infinite;
}

/* ---------- Bố cục ---------- */
.gift-content {
  position: relative;
  z-index: 2;
  width: 100%;
  min-height: 720px;
  padding: 56px 20px 48px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.gift-heading {
  position: relative;
  z-index: 20;
  max-width: 640px;

  h2 {
    margin: 0;
    font-size: clamp(34px, 5.4vw, 60px);
    line-height: 1.05;
    letter-spacing: -0.035em;
    font-weight: 800;
    text-wrap: balance;

    &.done {
      background: linear-gradient(
        90deg,
        $cream 0%,
        $gold-light 30%,
        $cream 55%,
        $gold-light 80%,
        $cream 100%
      );
      background-size: 220% 100%;
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
      animation: shimmer 5s linear infinite;
    }
  }
}

.gift-sub {
  margin: 16px 0 0;
  min-height: 1.6em;
  font-size: 16px;
  line-height: 1.6;
  color: rgba(245, 238, 227, 0.62);
  transition: opacity 400ms ease;

  &.hidden {
    opacity: 0;
  }
}

.swap-enter-active,
.swap-leave-active {
  transition:
    opacity 260ms ease,
    transform 260ms ease;
}

.swap-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.swap-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}

/* ---------- Sân khấu ---------- */
.gift-stage {
  position: relative;
  width: min(320px, 80vw);
  margin-top: 40px;
}

/* bục sân khấu: các vòng elip dưới chân hộp */
.gift-floor {
  position: absolute;
  left: 50%;
  bottom: -9%;
  width: 190%;
  aspect-ratio: 5;
  translate: -50% 0;
  border-radius: 50%;
  background:
    radial-gradient(ellipse, rgba(210, 171, 89, 0.22), transparent 62%),
    repeating-radial-gradient(
      ellipse,
      rgba(210, 171, 89, 0.2) 0 1px,
      transparent 1px 16px
    );
  -webkit-mask-image: radial-gradient(ellipse, black 25%, transparent 68%);
  mask-image: radial-gradient(ellipse, black 25%, transparent 68%);
  opacity: 0.55;
  pointer-events: none;
  transition: opacity 900ms ease 420ms;

  .gift-opened & {
    opacity: 1;
  }
}

.gift-aura {
  position: absolute;
  left: 50%;
  top: 28%;
  width: 150%;
  aspect-ratio: 1.3;
  translate: -50% 0;
  border-radius: 50%;
  background: radial-gradient(
    ellipse,
    rgba(212, 175, 55, 0.26),
    rgba(124, 20, 43, 0.14) 42%,
    transparent 72%
  );
  filter: blur(26px);
  opacity: 0.4;
  animation: aura-breathe 4.5s ease-in-out infinite;
  transition:
    opacity 900ms ease 420ms,
    scale 1200ms $ease-out 420ms;
  pointer-events: none;

  .gift-opened & {
    opacity: 1;
    scale: 1.25;
    animation: none;
  }
}

/* vòng gợi ý bấm */
.tap-ring {
  position: absolute;
  left: 50%;
  top: 62%;
  width: 78%;
  aspect-ratio: 1;
  translate: -50% -50%;
  border: 1px solid rgba(210, 171, 89, 0.4);
  border-radius: 50%;
  pointer-events: none;
  opacity: 0;
  animation: tap-ring 3s ease-out infinite;

  .gift-opened & {
    display: none;
  }
}

/* ---------- Hộp quà ---------- */
.gift-box {
  appearance: none;
  position: relative;
  display: block;
  width: 100%;
  aspect-ratio: 1;
  margin: 0;
  padding: 0;
  border: 0;
  background: none;
  color: inherit;
  font: inherit;
  cursor: inherit;
  container-type: inline-size;
  -webkit-tap-highlight-color: transparent;
  transition:
    translate 320ms $ease-out,
    scale 320ms $ease-out;

  &:focus-visible {
    outline: 2px solid $gold;
    outline-offset: 10px;
    border-radius: 24px;
  }

  .gift:not(.gift-opened) &:hover {
    translate: 0 -6px;
    scale: 1.025;
  }
}

/* nghiêng theo con trỏ */
.gift-tilt {
  position: absolute;
  inset: 0;
  display: block;
  transform: perspective(900px)
    rotateX(calc(var(--ny, 0) * -7deg))
    rotateY(calc(var(--nx, 0) * 9deg));
  transition: transform 260ms ease-out;
}

.gift-float {
  position: absolute;
  inset: 0;
  display: block;
  transform-origin: 50% 92%;
  animation: idle 5.5s ease-in-out infinite;

  .gift-opened & {
    animation: shake 520ms ease-in-out both;
  }
}

.layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.layer-back {
  z-index: 1;
}

.layer-front {
  z-index: 3;
  filter: drop-shadow(0 18px 22px rgba(0, 0, 0, 0.3));
}

.floor-shadow {
  fill: rgba(0, 0, 0, 0.62);
  filter: blur(9px);
}

/* lòng hộp */
.inside-glow {
  opacity: 0.1;
  transition: opacity 500ms ease 420ms;

  .gift-opened & {
    opacity: 1;
    animation: flicker 2.6s ease-in-out 1.2s infinite;
  }
}

.rim {
  opacity: 0;
  transition: opacity 400ms ease 700ms;

  .gift-opened & {
    opacity: 1;
  }
}

/* nắp hộp bật lên rồi bay đi */
.lid {
  transform-box: fill-box;
  transform-origin: 50% 100%;

  .gift-opened & {
    animation: lid-pop 1100ms $ease-out 420ms forwards;
  }
}

/* ---------- Tia sáng, cột sáng, xung kích ---------- */
.rays {
  position: absolute;
  z-index: 0;
  left: 50%;
  top: $rim;
  width: 210cqw;
  aspect-ratio: 1;
  translate: -50% -50%;
  scale: 0.4;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    rgba(255, 218, 130, 0.22) 0 5deg,
    transparent 5deg 15deg
  );
  -webkit-mask-image: radial-gradient(circle, black 0 12%, transparent 58%);
  mask-image: radial-gradient(circle, black 0 12%, transparent 58%);
  opacity: 0;
  pointer-events: none;
  animation: spin 40s linear infinite;
  transition:
    opacity 1000ms ease 520ms,
    scale 1400ms $ease-out 520ms;

  .gift-opened & {
    opacity: 1;
    scale: 1;
  }
}

.beam {
  position: absolute;
  z-index: 1;
  left: 50%;
  top: $rim;
  width: 64cqw;
  height: 130cqw;
  translate: -50% -100%;
  transform-origin: 50% 100%;
  scale: 1 0.2;
  background: linear-gradient(
    to top,
    rgba(255, 236, 170, 0.6),
    rgba(255, 220, 130, 0.18) 55%,
    transparent
  );
  clip-path: polygon(18% 100%, 82% 100%, 100% 0, 0 0);
  filter: blur(8px);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 700ms ease 480ms,
    scale 1100ms $ease-out 480ms;

  .gift-opened & {
    opacity: 0.85;
    scale: 1 1;
  }
}

.burst {
  position: absolute;
  z-index: 0;
  left: 50%;
  top: $rim;
  width: 34cqw;
  aspect-ratio: 1;
  translate: -50% -50%;
  border: 2px solid rgba(255, 225, 150, 0.9);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;

  .gift-opened & {
    animation: burst 1200ms $ease-out 460ms forwards;
  }
}

/* vòng sao xoay quanh món quà */
.orbit {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: calc(#{$rim} - 36cqw);
  width: 66cqw;
  aspect-ratio: 1;
  translate: -50% -50%;
  border: 1px dashed rgba(210, 171, 89, 0.3);
  border-radius: 50%;
  opacity: 0;
  pointer-events: none;
  animation: spin 16s linear infinite;
  transition: opacity 900ms ease 1300ms;

  &::before,
  &::after {
    content: "✦";
    position: absolute;
    left: 50%;
    translate: -50% 0;
    color: $gold-light;
    font-size: 15px;
    line-height: 1;
    text-shadow: 0 0 10px rgba(240, 215, 142, 0.9);
  }

  &::before {
    top: -8px;
  }

  &::after {
    bottom: -8px;
  }

  .gift-opened & {
    opacity: 1;
  }
}

/* ---------- Món quà trồi lên ---------- */
.gift-reveal {
  position: absolute;
  z-index: 2;
  left: 50%;
  top: $rim;
  display: block;
  translate: -50% calc(-50% + 24cqw);
  rotate: -14deg;
  scale: 0.4;
  opacity: 0;
  pointer-events: none;
  transition:
    translate 1000ms $ease-spring 560ms,
    rotate 1000ms $ease-out 560ms,
    scale 1000ms $ease-spring 560ms,
    opacity 250ms ease 560ms;

  /* vầng sáng sau món quà */
  &::before {
    content: "";
    position: absolute;
    inset: -34%;
    z-index: -1;
    border-radius: 50%;
    background: radial-gradient(
      circle,
      rgba(255, 226, 150, 0.5),
      rgba(255, 200, 100, 0.15) 45%,
      transparent 68%
    );
  }

  .gift-opened & {
    translate: -50% calc(-50% - 36cqw);
    rotate: 0deg;
    scale: 1;
    opacity: 1;
  }
}

.gift-icon {
  display: block;
  white-space: nowrap;
  font-size: 28cqw;
  line-height: 1;
  filter: drop-shadow(0 10px 12px rgba(0, 0, 0, 0.3))
    drop-shadow(0 0 22px rgba(255, 220, 120, 0.45));

  .gift-opened & {
    animation: bob 3.2s ease-in-out 1.7s infinite;
  }
}

/* ---------- Pháo giấy ---------- */
.confetti {
  position: absolute;
  z-index: 4;
  left: 50%;
  top: $rim;
  width: 0;
  height: 0;
  pointer-events: none;

  i {
    position: absolute;
    left: 0;
    top: 0;
    display: block;
    width: var(--w);
    height: var(--h);
    border-radius: 2px;
    background: var(--c);
    opacity: 0;

    .gift-opened & {
      animation: confetti 1900ms cubic-bezier(0.2, 0.7, 0.3, 1) forwards;
      animation-delay: calc(460ms + var(--d) * 1ms);
    }
  }
}

/* ---------- Kết quả ---------- */
.gift-foot {
  position: relative;
  z-index: 20;
  width: min(680px, 92%);
  min-height: 120px;
  margin-top: 16px;
}

.gift-result {
  animation: fade-in 500ms ease 900ms both;
}

.result-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin-bottom: 14px;
  color: $gold;
  font-size: 16px;

  i {
    width: 56px;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(210, 171, 89, 0.7));

    &:last-child {
      transform: scaleX(-1);
    }
  }
}

.gift-result h3 {
  margin: 0;
  font-size: clamp(26px, 4.4vw, 44px);
  line-height: 1.12;
  font-weight: 800;
  letter-spacing: -0.03em;
  text-wrap: balance;
  text-shadow: 0 0 30px rgba(210, 171, 89, 0.28);
}

.word {
  display: inline-block;
  white-space: nowrap;
}

.char {
  display: inline-block;
  animation: char-in 700ms $ease-out backwards;
  animation-delay: calc(1000ms + var(--i) * 30ms);
}

/* ---------- Keyframes ---------- */
@keyframes idle {
  0% {
    transform: translateY(0) rotate(0);
  }
  35% {
    transform: translateY(-8px) rotate(0);
  }
  70% {
    transform: translateY(0) rotate(0);
  }
  74% {
    transform: rotate(-2.5deg);
  }
  78% {
    transform: rotate(2.5deg);
  }
  82% {
    transform: rotate(-1.8deg);
  }
  86% {
    transform: rotate(1.2deg);
  }
  90%,
  100% {
    transform: translateY(0) rotate(0);
  }
}

@keyframes shake {
  0% {
    transform: translateX(0) rotate(0) scale(1);
  }
  15% {
    transform: translateX(-7px) rotate(-3deg);
  }
  30% {
    transform: translateX(7px) rotate(3deg);
  }
  45% {
    transform: translateX(-5px) rotate(-2deg);
  }
  60% {
    transform: translateX(4px) rotate(1.5deg) scale(0.98, 1.03);
  }
  80% {
    transform: translateX(0) rotate(0) scale(1.03, 0.97);
  }
  100% {
    transform: translateX(0) rotate(0) scale(1);
  }
}

@keyframes lid-pop {
  0% {
    transform: translate(0, 0) rotate(0);
    opacity: 1;
  }
  18% {
    transform: translate(0, -16px) rotate(-3deg);
    opacity: 1;
  }
  70% {
    opacity: 1;
  }
  100% {
    transform: translate(150px, -120px) rotate(34deg);
    opacity: 0;
  }
}

@keyframes burst {
  0% {
    scale: 0.2;
    opacity: 0.9;
  }
  100% {
    scale: 4.2;
    opacity: 0;
  }
}

@keyframes confetti {
  0% {
    translate: 0 0;
    rotate: 0deg;
    scale: 0.4;
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  55% {
    translate: var(--tx) var(--ty);
    rotate: var(--rot);
    scale: 1;
    opacity: 1;
  }
  100% {
    translate: calc(var(--tx) * 1.12) calc(var(--ty) + 150px);
    rotate: calc(var(--rot) * 2);
    scale: 1;
    opacity: 0;
  }
}

@keyframes bob {
  0%,
  100% {
    transform: translateY(0) rotate(-2deg);
  }
  50% {
    transform: translateY(-9px) rotate(2deg);
  }
}

@keyframes flicker {
  0%,
  100% {
    opacity: 0.75;
  }
  50% {
    opacity: 1;
  }
}

@keyframes aura-breathe {
  0%,
  100% {
    opacity: 0.32;
    scale: 1;
  }
  50% {
    opacity: 0.55;
    scale: 1.06;
  }
}

@keyframes tap-ring {
  0% {
    scale: 0.7;
    opacity: 0.6;
  }
  100% {
    scale: 1.35;
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes char-in {
  from {
    opacity: 0;
    transform: translateY(0.6em) rotate(6deg);
    filter: blur(6px);
  }
  to {
    opacity: 1;
    transform: translateY(0) rotate(0);
    filter: blur(0);
  }
}

@keyframes shimmer {
  to {
    background-position: -220% 0;
  }
}

@keyframes spin {
  to {
    rotate: 360deg;
  }
}

@keyframes twinkle {
  0%,
  100% {
    opacity: 0;
    scale: 0.4;
  }
  50% {
    opacity: 0.9;
    scale: 1;
  }
}

@keyframes dust {
  0% {
    translate: 0 0;
    opacity: 0;
  }
  10% {
    opacity: 0.85;
  }
  90% {
    opacity: 0.4;
  }
  100% {
    translate: var(--dx) -760px;
    opacity: 0;
  }
}

/* ---------- Màn hình lớn ---------- */
@media (min-width: 768px) {
  .gift,
  .gift-content {
    min-height: 780px;
  }

  .gift-content {
    padding: 72px 24px 56px;
  }
}

/* ---------- Giảm chuyển động ---------- */
@media (prefers-reduced-motion: reduce) {
  .gift-dust,
  .confetti,
  .burst,
  .tap-ring,
  .orbit {
    display: none;
  }

  .gift-float,
  .gift-aura,
  .rays,
  .gift-icon,
  .inside-glow,
  .char,
  .gift-heading h2.done {
    animation: none !important;
  }

  .gift-tilt {
    transform: none;
  }

  .gift-opened .lid {
    animation: none;
    opacity: 0;
  }

  .gift-reveal,
  .rays,
  .beam,
  .gift-beams,
  .gift-floor,
  .gift-aura,
  .inside-glow,
  .rim {
    transition-delay: 0s;
    transition-duration: 1ms;
  }

  .gift-result {
    animation-delay: 0s;
  }
}
</style>
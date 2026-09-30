<script setup>
import Banner from "../../../components/Banner.vue";
import LangSwitch from "../../../components/LangSwitch.vue";
import { preloaderVisible } from "../../../composables/usePreloader";
import { t } from "../../../i18n/utils/translate";
</script>

<template>
  <div class="hero">
    <div class="hero-lang-switch">
      <LangSwitch />
    </div>

    <div class="hero-content grid">
      <div class="hero-content-inner" id="hero-content-inner">
        <div class="hero-content-copys">
          <div class="hero-intro">
            <span class="hero-intro-line"></span>
            <span class="hero-intro-text">HELLO, I'M</span>
          </div>

          <h1 class="hero-title">Bình Duy</h1>

          <Banner
            class="hero-banner"
            :copy="t('job-title')"
            v-if="!preloaderVisible"
            animated
          />

          <div class="hero-specialties">
            <span>IT INFRASTRUCTURE</span>
            <span class="hero-specialties-dot">•</span>
            <span>NETWORKING</span>
            <span class="hero-specialties-dot">•</span>
            <span>SYSTEMS</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.hero {
  max-height: calc(var(--lvh) * 100);
  height: calc(var(--lvh) * 100);
  width: 100%;
  display: flex;
  position: relative;
  overflow: hidden;

  &-lang-switch {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 100;

    @include mixins.mq("md") {
      top: 28px;
      left: 28px;
    }
  }

  &-content {
    align-items: center;
    justify-content: center;
    height: 46%;

    @include mixins.landscape {
      height: 100%;

      @include mixins.mq("md") {
        padding-bottom: 30%;
      }

      @include mixins.mq("lg") {
        padding-bottom: 5%;
      }
    }

    &-inner {
      transform-origin: center center;
      grid-column: 1 / 13;
      gap: var(--space-xxl);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: fit-content;
      position: relative;
      left: 50%;
      transform: translateX(-50%);

      @include mixins.landscape {
        left: 0;
        transform: translateX(0);
        grid-column: 2 / 13;
        width: fit-content;
      }
    }

    &-copys {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: var(--space-sm);

      @include mixins.mq("md") {
        gap: var(--space-md);
      }
    }
  }

  &-intro {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: -2px;
    opacity: 0;
    animation: hero-intro-in 1s cubic-bezier(0.22, 1, 0.36, 1) 0.15s forwards;

    &-line {
      width: 34px;
      height: 2px;
      background: currentColor;
      opacity: 0.45;
      transform-origin: left center;
      animation: hero-line-in 0.7s ease-out 0.2s both;
    }

    &-text {
      font-size: 0.9rem;
      font-weight: 700;
      letter-spacing: 0.18em;
      line-height: 1;
    }
  }

  &-title {
    font-weight: 900;
    letter-spacing: 0.02em;
    font-size: var(--font-size-title-lg);
    white-space: nowrap;
    opacity: 0;
    animation: hero-title-in 0.9s cubic-bezier(0.22, 1, 0.36, 1) 0.35s forwards;

    @include mixins.landscape {
      font-size: var(--font-size-title-lg);
    }

    @include mixins.landscape-large {
      @include mixins.mq("sm") {
        font-size: var(--font-size-title-xl);
      }

      @include mixins.mq("xl") {
        font-size: var(--font-size-title-xxl);
      }
    }
  }

  &-banner {
    position: relative;
    align-self: flex-start;
    right: auto;
    bottom: auto;
    z-index: 10;

    margin-top: calc(var(--space-sm) * -0.25);
    margin-left: var(--space-md);

    transform: rotate(-5deg);
    transform-origin: left center;

    opacity: 0;
    animation: hero-banner-in 0.8s cubic-bezier(0.22, 1, 0.36, 1) 0.65s forwards;

    @include mixins.mq("sm") {
      margin-top: calc(var(--space-sm) * -0.35);
      margin-left: var(--space-lg);
    }

    @include mixins.mq("lg") {
      margin-top: calc(var(--space-md) * -0.35);
      margin-left: var(--space-lg);
    }
  }

  &-specialties {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 9px;
    margin-top: 4px;
    margin-left: 2px;

    font-size: 0.82rem;
    font-weight: 700;
    letter-spacing: 0.13em;
    line-height: 1.5;

    opacity: 0;
    animation: hero-specialties-in 1s cubic-bezier(0.22, 1, 0.36, 1) 1.05s forwards;

    &-dot {
      opacity: 0.45;
    }
  }
}

@keyframes hero-intro-in {
  from {
    opacity: 0;
    transform: translateY(12px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-line-in {
  from {
    transform: scaleX(0);
  }

  to {
    transform: scaleX(1);
  }
}

@keyframes hero-title-in {
  from {
    opacity: 0;
    transform: translateY(28px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes hero-banner-in {
  from {
    opacity: 0;
    transform: rotate(-5deg) translateY(16px);
  }

  to {
    opacity: 1;
    transform: rotate(-5deg) translateY(0);
  }
}

@keyframes hero-specialties-in {
  from {
    opacity: 0;
    transform: translateY(18px);
    filter: blur(4px);
  }

  to {
    opacity: 0.78;
    transform: translateY(0);
    filter: blur(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .hero-intro,
  .hero-intro-line,
  .hero-title,
  .hero-banner,
  .hero-specialties {
    animation: none;
    opacity: 1;
    transform: none;
  }
}
</style>
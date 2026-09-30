<script setup lang="ts">
import { computed } from "vue";
import Header from "./components/Header.vue";
import { useTranslations } from "./i18n/composables/useTranslations";
import { translations } from "./i18n/store";
import { usePreloader } from "./composables/usePreloader";
import Cursor from "./components/Cursor.vue";
import { useAgent } from "./composables/useAgent";
import { useMusic } from "./features/sounds/composables/useMusic";
import { useHowler } from "./features/sounds/composables/useHowler";
import { useRouteObserver } from "./composables/useRouteObserver";
import Home from "./features/home/components/Home.vue";
import Project from "./features/projects/components/Project.vue";
import { useProjectTransition } from "./composables/useProjectTransition";
import { useScroll } from "./composables/useScroll";
import { projectVisible } from "./composables/useRouteObserver";
import ProjectBackground from "./features/projects/components/ProjectBackground.vue";
import { useClickSound } from "./features/sounds/composables/useClickSounds";
//import { useHoverSound } from "./features/sounds/composables/useHoverSounds";

const { isTransitioning } = useProjectTransition();

useTranslations();
usePreloader();
useMusic();
useHowler();
useScroll();
useRouteObserver();
useClickSound();
//useHoverSound();

const { isTouch } = useAgent();

const translationsReady = computed(
  () => Object.keys(translations.value).length > 0,
);
</script>

<template>
  <template v-if="translationsReady">
    <Header />

    <!-- main page -->
    <div :class="{ 'home-wrapper-projectIsReady': projectVisible }">
      <Home />
    </div>

    <!-- overlay page -->
    <ProjectBackground />

    <div
      class="project-wrapper"
      :class="{
        'project-wrapper-visible': projectVisible,
        'project-wrapper-transitioning': isTransitioning,
      }"
    >
      <div class="project-content">
        <Project />
      </div>
    </div>

    <Cursor v-if="!isTouch" />
  </template>
</template>

<style lang="scss">
.home-wrapper-projectIsReady {
  visibility: hidden;
  position: fixed;
  inset: 0;
}

.project-wrapper {
  position: fixed;
  inset: 0;
  overflow: hidden;
  z-index: var(--z-index-layout-project);
  visibility: hidden;
  pointer-events: none;

  &-visible {
    visibility: visible;
    pointer-events: auto;
    position: static;
  }
}

.project-content {
  width: 100%;
  height: 100%;
  overflow: hidden;
}
</style>
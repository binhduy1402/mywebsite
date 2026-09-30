<script setup lang="ts">
import Tag from "../../../components/Tag.vue";
import Button from "../../../components/Button.vue";
import { t } from "../../../i18n/utils/translate";
import Link from "../../../components/Link.vue";
import { projectId } from "../../../composables/useRouteObserver";
import { ref, watch } from "vue";

import type { ProjectContent } from "../../../content/types";

const { content } = defineProps<{
  content: ProjectContent;
}>();

const animationKey = ref(0);

// Force animation restart when projectId changes
watch(projectId, () => {
  animationKey.value++;
});
</script>

<template>
  <div class="project-hero grid">
    <div class="project-hero-main">
      <div class="project-hero-title-wrapper">
        <h1 class="project-hero-title" :key="animationKey">
          {{ content.title }}
        </h1>
      </div>

      <p
        v-if="content.description"
        class="project-hero-description"
        v-html="content.description"
      ></p>

      <div v-if="content.tags.length" class="project-hero-tags">
        <Tag v-for="tag in content.tags" :key="tag" :variant="tag" />
      </div>
    </div>

    <div class="project-hero-buttons">
      <Link
        v-if="content.live"
        :href="content.live"
        external
        class="project-hero-button"
        data-cursor="arrow-external"
      >
        <Button
          renderAs="div"
          variant="accent"
          class="children-unclickable"
          data-hoversound="hover"
        >
          {{ t("live-view") }}
        </Button>
      </Link>

      <Link
        v-if="content.source"
        :href="content.source"
        external
        class="project-hero-button"
        data-cursor="arrow-external"
      >
        <Button
          renderAs="div"
          variant="border"
          class="children-unclickable"
          data-hoversound="hover"
        >
          {{ t("source-code") }}
        </Button>
      </Link>
    </div>
  </div>
</template>

<style scoped lang="scss">
.project-hero {
  padding: 0 var(--space-outer);
  padding-bottom: 48px;
  padding-top: calc(var(--height-header) + 24px);

  @include mixins.mq("md") {
    padding-bottom: 64px;
  }

  &-main {
    grid-column: 1 / 13;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-md);

    @include mixins.mq("md") {
      grid-column: 2 / 10;
    }

    @include mixins.mq("lg") {
      grid-column: 2 / 9;
    }

    @include mixins.mq("xl") {
      grid-column: 2 / 9;
    }
  }

  &-title {
    font-size: var(--font-size-title-lg);
    color: var(--color-text-400);
    line-height: var(--line-height-title);
    transform: translateY(0%);
    animation: project-hero-title-visible 0.5s var(--ease-smooth);

    @include mixins.mq("md") {
      font-size: var(--font-size-title-xl);
    }

    @keyframes project-hero-title-visible {
      from {
        transform: translateY(100%);
      }

      to {
        transform: translateY(0);
      }
    }

    &-wrapper {
      overflow: hidden;
    }
  }

  &-description {
    max-width: 680px;
    margin: 0;
    color: var(--color-text-400);
    line-height: var(--line-height-copy);
  }

  &-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-sm);
  }

  &-buttons {
    grid-column: 1 / 13;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: var(--space-sm);
    margin-top: var(--space-lg);
    width: 100%;

    @include mixins.mq("md") {
      grid-column: 2 / 9;
      gap: var(--space-md);
      width: fit-content;
    }

    @include mixins.mq("lg") {
      grid-column: 2 / 9;
    }
  }

  &-button {
    flex: 0.5;

    @include mixins.mq("md") {
      width: fit-content;
    }
  }
}
</style>
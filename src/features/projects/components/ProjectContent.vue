<script setup lang="ts">
import Layout from "../../../components/Layout.vue";
import ProjectHero from "./ProjectHero.vue";
import ProjectComponent from "./ProjectComponent.vue";
import Link from "../../../components/Link.vue";
import NextProject from "./NextProject.vue";
import { locale } from "../../../i18n/store";
import { previews } from "../../../content/projects/previews";
import { ref, computed, watch, onMounted } from "vue";

import type { ProjectContent, ProjectPreview } from "../../../content/types";

const { content, projectId } = defineProps<{
  content: ProjectContent;
  projectId: string;
}>();

const loadedPreviews = ref<ProjectPreview[] | null>(null);

const loadPreviews = async () => {
  const module = await previews[locale.value as keyof typeof previews]();
  loadedPreviews.value = module.default;
};

const nextProject = computed(() => {
  const previews = loadedPreviews.value;
  if (!previews) return null;

  const currentIndex = previews.findIndex((p) => p.slug === projectId);
  if (currentIndex === -1) return null;

  const nextIndex = (currentIndex + 1) % previews.length;

  return previews[nextIndex];
});

watch(locale, loadPreviews);

onMounted(loadPreviews);
</script>

<template>
<Layout class="project-content">
  <div
    :class="[
      'project-content-main',
      {
        'project-content-main--ai': projectId === 'ai-assistant',
        'project-content-main--control': projectId === 'system-control-room',
        'project-content-main--gift': projectId === 'gift',
      },
    ]"
  >
    <ProjectHero :content="content" :projectId="projectId" />

    <div class="project-content-components">
      <div
        v-for="(component, index) in content.components"
        :key="`${component.type}-${index}`"
        class="grid project-content-grid"
      >
        <ProjectComponent
          :type="component.type"
          :props="component.props"
          :index="index"
        />
      </div>
    </div>
  </div>

    <div
      v-if="
        projectId !== 'system-control-room' &&
        projectId !== 'gift' &&
        projectId !== 'ai-assistant'
      "
      class="grid project-content-next-project-grid"
    >
      <Link
        v-if="nextProject"
        :to="`/project/${nextProject.slug}`"
        replace
        class="project-content-next-project"
        data-cursor="arrow"
        data-sound="click"
      >
        <NextProject :project="nextProject" />
      </Link>
    </div>
  </Layout>
</template>

<style scoped lang="scss">
.project-content {
  color: var(--color-text-400);

  &-grid {
    row-gap: var(--space-sm);

    @include mixins.mq("md") {
      row-gap: var(--space-xxl);
    }
  }

  &-next-project {
    grid-column: 1 / 13;

    @include mixins.mq("md") {
      grid-column: 3 / 11;
    }

    @include mixins.mq("lg") {
      grid-column: 4 / 10;
    }

    @include mixins.mq("xl") {
      grid-column: 5 / 9;
    }

    &-grid {
      padding: 0 var(--space-outer);
      padding-top: var(--space-xl);
      padding-bottom: var(--space-xxxl);
    }
  }

  &-components {
    padding: 20px var(--space-outer);
    background-color: var(--color-background-400);
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-xxl);
    gap: var(--space-xxl);

    @include mixins.mq("md") {
      padding: 64px var(--space-outer);
    }
  }
}

.project-content-main {
  width: 100%;
}

/* =========================================================
   MÀU NỀN RIÊNG CHO TỪNG TRANG DỰ ÁN
   Mỗi trang = 1 dòng @include. Muốn đổi tone chỉ cần đổi 6 màu:
   ($nền, $glow giữa, $glow đỉnh, $tiêu đề: sáng -> giữa -> tối)
   Chỉ dùng background gradient tĩnh -> rất nhẹ.
   ========================================================= */

@mixin themed-page($base, $glow, $glow-top, $t1, $t2, $t3) {
  position: relative;
  width: 100%;
  overflow: hidden;

  background:
    /* glow phía sau nội dung chính */
    radial-gradient(
      ellipse 52% 40% at 50% 64%,
      rgba($glow, 0.2) 0%,
      rgba($glow, 0.07) 45%,
      transparent 78%
    ),
    /* ánh sáng ở đỉnh trang */
    radial-gradient(
      ellipse 60% 38% at 50% 0%,
      rgba($glow-top, 0.16),
      transparent 72%
    ),
    /* tối dần hai bên cho có chiều sâu */
    linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.35),
      transparent 22%,
      transparent 78%,
      rgba(0, 0, 0, 0.35)
    ),
    $base;

  /* vuông góc để nền tối chạm sát đáy trang, không lộ nền kem ở 2 góc */
  border-radius: 0;
  color: #f2f5f9;

  :deep(.project-hero-title) {
    background: linear-gradient(180deg, $t1 0%, $t2 42%, $t3 100%);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }

  :deep(.project-hero-description) {
    color: rgba(242, 245, 249, 0.62);
  }

  :deep(.project-hero-tags) {
    color: rgba(242, 245, 249, 0.7);
  }

  .project-content-components {
    background: transparent;
  }
}

/* ---------- AI Assistant: graphite + bạc ---------- */
.project-content-main--ai {
  @include themed-page(#08090c, #a0b6d2, #96afcd, #ffffff, #dce4ed, #9fb0c4);

  /* kéo khung chat sát tiêu đề hơn (chỉnh số này nếu muốn) */
  --chat-pull: -100px;

  :deep(.project-hero) {
    padding-top: calc(var(--height-header) + 64px);
    padding-bottom: 72px;

    animation: ai-fade 0.6s ease-out backwards;
  }

  .project-content-components {
    padding-top: 0;

    > .project-content-grid {
      animation: ai-fade 0.7s ease-out 0.1s backwards;
    }
  }
}

/* ---------- System Control Room: đen ấm + cam ---------- */
.project-content-main--control {
  @include themed-page(#0d0c0b, #ff8500, #ff9a3c, #ffffff, #fbe6cf, #f0b880);

  /* khung dashboard đang có viền/bóng cho nền sáng -> chỉnh lại cho nền tối */
  :deep(.control-room-shell) {
    border-color: rgba(255, 255, 255, 0.1);
    box-shadow:
      0 30px 80px rgba(0, 0, 0, 0.55),
      inset 0 1px 0 rgba(255, 255, 255, 0.08);
  }
}

/* ---------- Gift: tạm dùng tone hồng-vàng ấm (chỉnh sau khi xem Gift) ---------- */
.project-content-main--gift {
  @include themed-page(#110c0e, #e8a598, #f0b8a4, #ffffff, #f8e1d8, #e8b4a4);
}

/* hiện dần 1 lần khi vào trang; "backwards" để xong là gỡ hẳn transform */
@keyframes ai-fade {
  from {
    opacity: 0;
    transform: translateY(14px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (prefers-reduced-motion: reduce) {
  .project-content-main--ai :deep(.project-hero),
  .project-content-main--ai .project-content-components > .project-content-grid {
    animation: none !important;
  }
}
</style>
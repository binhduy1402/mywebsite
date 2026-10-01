<script setup lang="ts">
import Linkedin from "./icons/Linkedin.vue";
import Instagram from "./icons/Instagram.vue";
import Mail from "./icons/Mail.vue";
import Facebook from "./icons/Facebook.vue";
import Zalo from "./icons/Zalo.vue";
import Telegram from "./icons/Telegram.vue";
import Discord from "./icons/Discord.vue";
import Link from "./Link.vue";
import { t } from "../i18n/utils/translate";
import ButtonRound from "./ButtonRound.vue";

import { social } from "../content/social";

const props = defineProps<{
  variant?: "theme" | "background";
}>();

const icons = {
  mail: Mail,
  facebook: Facebook,
  zalo: Zalo,
  linkedin: Linkedin,
  telegram: Telegram,
  instagram: Instagram,
  discord: Discord,
} as const;

const getAriaLabel = (name: string) =>
  `${t("go-to")} ${name.charAt(0).toUpperCase() + name.slice(1)}`;
</script>

<template>
  <div class="social">
    <Link
      v-for="item in social"
      :key="item.name"
      external
      :href="item.url"
      :aria-label="getAriaLabel(item.name)"
      class="social-link"
      data-cursor="circle-white"
    >
      <ButtonRound
        renderAs="div"
        :variant="props.variant ?? 'theme'"
        class="children-unclickable"
        data-hoversound="hover"
      >
        <component
          :is="icons[item.name]"
          :aria-label="getAriaLabel(item.name)"
          external
        />
      </ButtonRound>
    </Link>
  </div>
</template>

<style scoped lang="scss">
.social {
  display: flex;
  gap: var(--space-md);
}
</style>
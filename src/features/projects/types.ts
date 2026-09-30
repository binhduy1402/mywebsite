import type { Props as ImageTextProps } from "./components/ImageText.vue";
import type { Props as TextProps } from "./components/Text.vue";
import type { Props as ListProps } from "./components/List.vue";
import type { Props as MediaProps } from "./components/Media.vue";
import type { Props as SystemControlRoomProps } from "./components/SystemControlRoom.vue";
import type { Props as GiftProps } from "./components/Gift.vue";
import type { AIChatProps } from "../../features/projects/components/AIChat.vue";

export interface ProjectComponents {
  imageText: ImageTextProps;
  text: TextProps;
  list: ListProps;
  media: Omit<MediaProps, "index">;
  systemControlRoom: SystemControlRoomProps;
  gift: GiftProps;
  aiAssistant: AIChatProps;
}

export type ProjectComponent = {
  [K in keyof ProjectComponents]: {
    type: K;
    props: ProjectComponents[K];
  };
}[keyof ProjectComponents];

type ProjectComponentMap<K extends keyof ProjectComponents> = {
  type: K;
  props: ProjectComponents[K];
};

export type ProjectComponentProps = ProjectComponentMap<keyof ProjectComponents>;
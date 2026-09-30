import type { ProjectContent } from "../../types";

export default {
  title: "Chat with My AI Assistant",
  theme: "dark",
  tags: [],
  description: "Want to know more about me? Just ask.",
  components: [
    {
      type: "aiAssistant",
      props: {},
    },
  ],
} as const satisfies ProjectContent;
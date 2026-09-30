import type { ProjectContent } from "../../types";

export default {
  title: "Chat với trợ lí AI của tôi",
  theme: "dark",
  tags: [],
  description: "Muốn biết thêm về tôi? Cứ hỏi.",
  components: [
    {
      type: "aiAssistant",
      props: {},
    },
  ],
} as const satisfies ProjectContent;
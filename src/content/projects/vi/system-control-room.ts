import type { ProjectContent } from "../../types";

export default {
  title: "System Control Room",
  theme: "dark",
  tags: [],
  videoBorder: false,
  description: "Khám phá những hệ thống và công nghệ tôi làm việc cùng.",
  components: [
    {
      type: "systemControlRoom",
      props: {},
    },
  ],
} as const satisfies ProjectContent;
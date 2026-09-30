import type { ProjectContent } from "../../types";

export default {
  title: "System Control Room",
  theme: "dark",
  tags: [],
  videoBorder: false,
  description: "Explore the systems and technologies I work with.",
  components: [
    {
      type: "systemControlRoom",
      props: {},
    },
  ],
} as const satisfies ProjectContent;
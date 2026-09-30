import type { ProjectContent } from "../../types";

export default {
  title: "A Little Surprise",
  theme: "dark",
  tags: [],
  videoBorder: false,
  description: "There's a little something waiting for you.",
  components: [
    {
      type: "gift",
      props: {},
    },
  ],
} as const satisfies ProjectContent;
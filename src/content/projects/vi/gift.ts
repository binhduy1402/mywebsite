import type { ProjectContent } from "../../types";

export default {
  title: "Một chút bất ngờ",
  theme: "dark",
  tags: [],
  videoBorder: false,
  description: "Có một món quà nhỏ dành cho bạn.",
  components: [
    {
      type: "gift",
      props: {},
    },
  ],
} as const satisfies ProjectContent;
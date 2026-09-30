import thumbnailSystemControlRoom from "../../../assets/thumbnails/cubewar.webp";
import thumbnailGift from "../../../assets/thumbnails/quibbo.webp";
import thumbnailAI from "../../../assets/thumbnails/particles.webp";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "System Control Room",
    slug: "system-control-room",
    thumbnail: thumbnailSystemControlRoom,
    description: "Explore the systems and technologies I work with.",
  },
  {
    title: "A Little Surprise",
    slug: "gift",
    thumbnail: thumbnailGift,
    description: "There's a little something waiting for you.",
  },
  {
    title: "Chat with My AI Assistant",
    slug: "ai-assistant",
    thumbnail: thumbnailAI,
    description: "Want to know more about me? Just ask.",
  },
] as const satisfies ProjectPreview[];
import thumbnailSystemControlRoom from "../../../assets/thumbnails/system-control-room.png";
import thumbnailGift from "../../../assets/thumbnails/gift.png";
import thumbnailAI from "../../../assets/thumbnails/chat-AI.png";

import type { ProjectPreview } from "../../types";

export default [
  {
    title: "System Control Room",
    slug: "system-control-room",
    thumbnail: thumbnailSystemControlRoom,
    description: "Khám phá những hệ thống và công nghệ tôi làm việc cùng.",
  },
  {
    title: "Một chút bất ngờ",
    slug: "gift",
    thumbnail: thumbnailGift,
    description: "Có một món quà nhỏ dành cho bạn.",
  },
  {
    title: "Chat với trợ lí AI của tôi",
    slug: "ai-assistant",
    thumbnail: thumbnailAI,
    description: "Muốn biết thêm về tôi? Cứ hỏi.",
  },
] as const satisfies ProjectPreview[];
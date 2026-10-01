export const social = [
  { url: "mailto:duynguyen03.work@gmail.com", name: "mail" },
  { url: "https://www.facebook.com/binhduy.nguyenpham.92", name: "facebook" },
  { url: "https://zalo.me/0355563406", name: "zalo" },
  { url: "https://www.linkedin.com/in/duy-nguyen-pham-binh-ba647b372/", name: "linkedin" },
  { url: "https://t.me/binhduy1402", name: "telegram" },
  { url: "https://www.instagram.com/_npbduy.14/", name: "instagram" },
  { url: "https://discord.com/users/897041921665564682", name: "discord" },
] as const satisfies {
  url: string;
  name: "mail" | "facebook" | "zalo" | "linkedin" | "telegram" | "instagram" | "discord";
}[];
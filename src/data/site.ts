export const site = {
  name: "Kassa På Plats",
  product: "Kassa På Plats",
  place: "Varberg",
  description:
    "Butikskassa med lager, inköp och dagsavslut. Programmet körs på en dator i butiken, tillsammans med kvittoskrivare, kundskärm och kontrollenhet.",
  contactName: "Claes Karlsson",
  contactEmail: "claes.ma.karlsson@telia.com",
  contactPhone: "0734-020017",
  contactPhoneHref: "+46734020017",
  demoUrl: "",
  prices: {
    programMonthly: null as number | null,
    kassapaket: null as number | null,
    kontrollenhet: null as number | null,
  },
};

export const nav = [
  { href: "/kassan", label: "Kassan" },
  { href: "/kraven", label: "Kraven 2027" },
  { href: "/lager", label: "Lager" },
  { href: "/utrustning", label: "Utrustning" },
  { href: "/pris", label: "Pris" },
  { href: "/support", label: "Support" },
];

export function kronor(amount: number | null, suffix: string): string {
  if (amount == null) return "Pris vid visning";
  const formatted = new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
  return `${formatted} ${suffix}`;
}

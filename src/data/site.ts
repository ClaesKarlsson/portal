import content from "./content.json";

const navHrefs = ["/kassan", "/kraven", "/lager", "/utrustning", "/pris", "/support"] as const;

export const priceKeys = ["programMonthly", "kassapaket", "kontrollenhet", "betalterminal"] as const;

export type PriceKey = (typeof priceKeys)[number];

function phoneHref(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) return `+${digits.slice(2)}`;
  if (digits.startsWith("46")) return `+${digits}`;
  if (digits.startsWith("0")) return `+46${digits.slice(1)}`;
  return digits ? `+${digits}` : "";
}

function priceAmount(key: PriceKey): number | null {
  const value = content.prices[key];
  return typeof value === "number" ? value : null;
}

const tokens: Record<string, string> = {
  foretag: content.contact.name,
  produkt: content.contact.product,
  namn: content.contact.contactName,
  epost: content.contact.contactEmail,
  telefon: content.contact.contactPhone,
  ort: content.contact.place,
};

export function fyll(value: string): string {
  return value.replace(/\{(foretag|produkt|namn|epost|telefon|ort)\}/g, (match, key: string) => tokens[key] ?? match);
}

export { content };

export const site = {
  name: content.contact.name,
  product: content.contact.product,
  place: content.contact.place,
  description: content.contact.description,
  contactName: content.contact.contactName,
  contactEmail: content.contact.contactEmail,
  contactPhone: content.contact.contactPhone,
  contactPhoneHref: phoneHref(content.contact.contactPhone),
  demoUrl: content.contact.demoUrl,
  prices: {
    programMonthly: priceAmount("programMonthly"),
    kassapaket: priceAmount("kassapaket"),
    kontrollenhet: priceAmount("kontrollenhet"),
    betalterminal: priceAmount("betalterminal"),
  },
};

export const nav = content.chrome.nav.map((item, index) => ({
  href: navHrefs[index],
  label: item.label,
}));

export function kronor(amount: number | null, suffix: string): string {
  if (amount == null) return fyll(content.prices.missing);
  const formatted = new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    maximumFractionDigits: 0,
  }).format(amount);
  const tail = suffix.trim();
  return tail ? `${formatted} ${tail}` : formatted;
}

import { readdirSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const editorDir = dirname(fileURLToPath(import.meta.url));
const contentPath = join(editorDir, "../data/content.json");
const publicDir = join(editorDir, "../../public");

const sections = [
  ["contact", "Kontakt"],
  ["prices", "Priser"],
  ["chrome", "Meny och sidfot"],
  ["home", "Startsidan"],
  ["kassan", "Kassan"],
  ["lager", "Lager"],
  ["kraven", "Kraven 2027"],
  ["utrustning", "Utrustning"],
  ["pris", "Pris"],
  ["support", "Support"],
  ["boka", "Boka visning"],
  ["integritet", "Integritet"],
  ["notFound", "Sidan finns inte"],
];

const priceKeys = new Set(["programMonthly", "kassapaket", "kontrollenhet", "betalterminal"]);

const fieldLabels = {
  name: "Företagsnamn",
  product: "Produktnamn",
  place: "Ort",
  description: "Beskrivning",
  contactName: "Kontaktperson",
  contactEmail: "E-post",
  contactPhone: "Telefon",
  demoUrl: "Adress till demokassan",
  missing: "Text när belopp saknas",
  programMonthly: "Program, kronor per månad",
  kassapaket: "Kassapaket, kronor",
  kontrollenhet: "Kontrollenhet, kronor",
  betalterminal: "Betalterminal, kronor",
  tagline: "Liten text under namnet",
  menuLabel: "Knapp för menyn på liten skärm",
  bookLabel: "Knapptext",
  navLabel: "Namn på menyn för hjälpmedel",
  skipLabel: "Hoppa till innehåll",
  label: "Menytext",
  footerLead: "Text i sidfoten",
  privacyLabel: "Länk till integritet",
  eyebrow: "Liten text över rubriken",
  heading: "Rubrik",
  lead: "Ingress",
  text: "Text",
  suffix: "Text efter priset",
  flowsHeading: "Rubrik över de tre momenten",
  flowsMore: "Länk under varje moment",
  localHeading: "Rubrik",
  localLead: "Text",
  rulesEyebrow: "Liten text",
  rulesHeading: "Rubrik",
  rulesText: "Text",
  rulesLink: "Länk",
  buyHeading: "Rubrik",
  buyLink: "Länk",
  buyNote: "Notis under priserna",
  ctaHeading: "Rubrik",
  ctaText: "Text",
  ctaLabel: "Knapptext",
  demoLabel: "Knapp till demokassan",
  equipmentLabel: "Knapp till utrustning",
  kicker: "Liten text",
  badge: "Märke",
  dueLabel: "Text vid summan",
  dueAmount: "Summa",
  screenLabel: "Rubrik på kundskärmen",
  screenAmount: "Belopp på kundskärmen",
  screenNote: "Text under beloppet",
  caption: "Bildtext",
  note: "Liten text bredvid namnet",
  amount: "Belopp",
  moreHeading: "Rubrik",
  closing: "Avslutande text",
  countHeading: "Rubrik",
  countText: "Text",
  codeHeading: "Rubrik",
  codeText: "Text",
  codeLink: "Länk",
  programEyebrow: "Liten text",
  programHeading: "Rubrik",
  programText: "Text",
  unitEyebrow: "Liten text",
  unitHeading: "Rubrik",
  unitText: "Text",
  shopHeading: "Rubrik",
  shopText: "Text",
  packHeading: "Rubrik",
  labelEyebrow: "Liten text",
  labelHeading: "Rubrik",
  labelText: "Text",
  terminalHeading: "Rubrik",
  terminalText: "Text",
  priceLink: "Länk",
  when: "När det betalas",
  contactHeading: "Rubrik",
  contactText: "Text",
  shopLabel: "Fält: butik",
  placeLabel: "Fält: ort",
  phoneLabel: "Fält: telefon",
  emailLabel: "Fält: e-post",
  messageLabel: "Fält: meddelande",
  messagePlaceholder: "Exempeltext i meddelanderutan",
  submitLabel: "Knapptext",
  status: "Text som visas när förfrågan öppnas",
  mailSubject: "Ämnesrad i mejlet",
  deleteLead: "Text före e-postadressen",
  deleteTail: "Text efter e-postadressen",
  homeLabel: "Knapp till startsidan",
};

const arrayNouns = {
  nav: "Menyval",
  flows: "Moment",
  localCards: "Ruta",
  offer: "Prispost",
  lines: "Rad",
  payments: "Betalsätt",
  steps: "Steg",
  more: "Funktion",
  movements: "Händelse",
  points: "Krav",
  pack: "Del",
  rows: "Prisrad",
  notes: "Notis",
  items: "Punkt",
  paragraphs: "Stycke",
};

const sectionGroups = {
  chrome: [
    ["Meny", ["tagline", "menuLabel", "bookLabel", "navLabel", "skipLabel", "nav"]],
    ["Sidfot", ["footerLead", "privacyLabel"]],
  ],
  home: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead", "bookLabel", "demoLabel", "equipmentLabel"]],
    ["Tre saker personalen gör", ["flowsHeading", "flowsMore", "flows"]],
    ["Det stannar i butiken", ["localHeading", "localLead", "localCards"]],
    ["Kraven", ["rulesEyebrow", "rulesHeading", "rulesText", "rulesLink"]],
    ["Det du köper", ["buyHeading", "buyLink", "offer", "buyNote"]],
    ["Avslut", ["ctaHeading", "ctaText", "ctaLabel"]],
    ["Skissen", ["sketch"]],
  ],
  kassan: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead", "rulesLink"]],
    ["Från skanning till kvitto", ["steps"]],
    ["Runt köpet", ["moreHeading", "more", "closing", "bookLabel"]],
  ],
  lager: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead"]],
    ["Händelser", ["movements"]],
    ["Inventering och streckkoder", ["countHeading", "countText", "codeHeading", "codeText", "codeLink"]],
  ],
  kraven: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead"]],
    ["De tre kraven", ["points"]],
    ["Program och kontrollenhet", ["programEyebrow", "programHeading", "programText", "unitEyebrow", "unitHeading", "unitText"]],
    ["Butiken", ["shopHeading", "shopText", "bookLabel"]],
  ],
  utrustning: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead"]],
    ["Kassapaketet", ["packHeading", "pack"]],
    ["Kontrollenhet och tillval", ["unitEyebrow", "unitHeading", "unitText", "labelEyebrow", "labelHeading", "labelText", "terminalHeading", "terminalText", "priceLink"]],
  ],
  pris: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead"]],
    ["Prisraderna", ["rows", "notes", "bookLabel"]],
  ],
  support: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead"]],
    ["Vad som ingår", ["items"]],
    ["Kontakt", ["contactHeading", "contactText", "bookLabel"]],
  ],
  boka: [
    ["Inledning", ["title", "description", "eyebrow", "heading", "lead", "note"]],
    ["Formuläret", ["nameLabel", "shopLabel", "placeLabel", "phoneLabel", "emailLabel", "messageLabel", "messagePlaceholder", "submitLabel", "status", "mailSubject"]],
  ],
};

const areaKeys = new Set([
  "description",
  "lead",
  "text",
  "footerLead",
  "localLead",
  "rulesText",
  "buyNote",
  "ctaText",
  "caption",
  "closing",
  "countText",
  "codeText",
  "programText",
  "unitText",
  "shopText",
  "labelText",
  "terminalText",
  "note",
  "contactText",
  "messagePlaceholder",
  "status",
]);

function readContent() {
  return JSON.parse(readFileSync(contentPath, "utf8"));
}

function isLocal(req) {
  const address = req.socket?.remoteAddress ?? "";
  return address === "127.0.0.1" || address === "::1" || address === "::ffff:127.0.0.1";
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
  });
}

function labelFor(path, key) {
  const depth = path.split(".").length;
  if (key === "title" && depth === 2) return "Sidtitel";
  if (key === "title") return "Rubrik";
  if (key === "description" && depth === 2 && path !== "contact.description") return "Beskrivning för sökmotorer";
  if (key === "name" && path.startsWith("home.sketch")) return "Namn på raden";
  if (key === "nameLabel") return "Fält: namn";
  return fieldLabels[key] ?? key;
}

function renderField(path, key, parentKey, value) {
  const label = /^\d+$/.test(key) ? "Text" : labelFor(path, key);
  const id = `f-${path.replaceAll(".", "-")}`;
  if (priceKeys.has(key) && (value === null || typeof value === "number")) {
    const shown = value == null ? "" : String(value);
    return `<label class="field" for="${id}"><span>${escapeHtml(label)}</span><input id="${id}" data-path="${escapeHtml(path)}" data-kind="price" inputmode="numeric" value="${escapeHtml(shown)}" /></label>`;
  }
  const area = areaKeys.has(key) || parentKey === "paragraphs" || parentKey === "notes" || (typeof value === "string" && value.length > 140);
  if (area) {
    return `<label class="field" for="${id}"><span>${escapeHtml(label)}</span><textarea id="${id}" data-path="${escapeHtml(path)}" data-kind="text" rows="4">${escapeHtml(value)}</textarea></label>`;
  }
  return `<label class="field" for="${id}"><span>${escapeHtml(label)}</span><input id="${id}" data-path="${escapeHtml(path)}" data-kind="text" value="${escapeHtml(value)}" /></label>`;
}

function itemLegend(item, noun, index) {
  if (item && typeof item === "object") {
    const title = typeof item.title === "string" ? item.title.trim() : "";
    const name = typeof item.name === "string" ? item.name.trim() : "";
    if (title) return title;
    if (name) return name;
  }
  if (typeof item === "string" && item.trim()) {
    const text = item.trim().replace(/\s+/g, " ");
    return text.length > 52 ? `${text.slice(0, 52)}…` : text;
  }
  return `${noun} ${index + 1}`;
}

function renderSketch(sketch) {
  const src = typeof sketch.src === "string" ? sketch.src : "";
  const alt = typeof sketch.alt === "string" ? sketch.alt : "";
  const preview = src
    ? `<img class="sketch-preview" data-sketch-preview src="${escapeHtml(src)}" alt="" />`
    : `<img class="sketch-preview" data-sketch-preview alt="" hidden />`;
  return `<div class="sketch">
    ${preview}
    <p class="hint" data-sketch-note>${src ? "Byt bilden genom att välja en ny fil. Den sparas direkt." : "Ingen bild ännu. Välj en jpg, png, webp eller gif. Den sparas direkt."}</p>
    <label class="field" for="f-home-sketch-file"><span>Bild</span><input id="f-home-sketch-file" data-sketch-file type="file" accept="image/jpeg,image/png,image/webp,image/gif" /></label>
    <label class="field" for="f-home-sketch-alt"><span>Beskrivning av bilden</span><input id="f-home-sketch-alt" data-path="home.sketch.alt" data-kind="text" value="${escapeHtml(alt)}" /></label>
    <input data-path="home.sketch.src" data-kind="text" type="hidden" value="${escapeHtml(src)}" />
  </div>`;
}

function renderValue(value, path, key, parentKey) {
  if (path === "home.sketch" && value && typeof value === "object" && !Array.isArray(value)) {
    return renderSketch(value);
  }
  if (Array.isArray(value)) {
    const noun = arrayNouns[key] ?? "Post";
    return value
      .map((item, index) => {
        const child = `${path}.${index}`;
        return `<fieldset><legend>${escapeHtml(itemLegend(item, noun, index))}</legend>${renderValue(item, child, String(index), key)}</fieldset>`;
      })
      .join("");
  }
  if (value && typeof value === "object") {
    const inner = Object.entries(value)
      .map(([childKey, child]) => renderValue(child, path ? `${path}.${childKey}` : childKey, childKey, key))
      .join("");
    return inner;
  }
  return renderField(path, key, parentKey, value);
}

function renderGrouped(key, value) {
  const groups = sectionGroups[key];
  if (!groups) return renderValue(value, key, key, "");
  const used = new Set();
  const blocks = groups.map(([label, keys], index) => {
    for (const childKey of keys) used.add(childKey);
    const inner = keys
      .filter((childKey) => Object.prototype.hasOwnProperty.call(value, childKey))
      .map((childKey) => renderValue(value[childKey], `${key}.${childKey}`, childKey, key))
      .join("");
    return `<details${index === 0 ? " open" : ""}><summary>${escapeHtml(label)}</summary>${inner}</details>`;
  });
  const rest = Object.keys(value).filter((childKey) => !used.has(childKey));
  if (rest.length > 0) {
    const inner = rest.map((childKey) => renderValue(value[childKey], `${key}.${childKey}`, childKey, key)).join("");
    blocks.push(`<details open><summary>Övrigt</summary>${inner}</details>`);
  }
  return blocks.join("");
}

function renderPage(content) {
  const sectionKeys = sections.map(([key]) => key);
  const contentKeys = Object.keys(content);
  if (sectionKeys.join("\n") !== contentKeys.join("\n")) {
    return `<!doctype html><html lang="sv"><body><p>Innehållsfilen och formuläret har inte samma avsnitt.</p></body></html>`;
  }
  const shared = new Set(["contact", "prices", "chrome"]);
  const nav = [
    `<p class="nav-label">Gemensamt</p>`,
    ...sections.filter(([key]) => shared.has(key)).map(([key, title]) => `<button type="button" data-nav="${escapeHtml(key)}">${escapeHtml(title)}</button>`),
    `<p class="nav-label">Sidor</p>`,
    ...sections.filter(([key]) => !shared.has(key)).map(([key, title]) => `<button type="button" data-nav="${escapeHtml(key)}">${escapeHtml(title)}</button>`),
  ].join("");
  const blocks = sections
    .map(([key, title]) => {
      return `<section id="del-${escapeHtml(key)}" data-section="${escapeHtml(key)}" hidden><h2>${escapeHtml(title)}</h2>${renderGrouped(key, content[key])}</section>`;
    })
    .join("");

  return `<!doctype html>
<html lang="sv">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Redigera texter</title>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #efeae2; color: #1a1814; font: 16px/1.5 "Segoe UI", sans-serif; }
    main { max-width: 68rem; margin: 0 auto; padding: 1.5rem 1.25rem 6rem; }
    h1 { font-size: 2rem; line-height: 1.15; margin: 0 0 0.75rem; }
    h2 { font-size: 1.5rem; margin: 0 0 1rem; }
    p.intro { color: #4f493f; margin: 0 0 1.25rem; max-width: 46rem; }
    a { color: #1f4d3a; }
    .shell { display: grid; grid-template-columns: 15rem minmax(0, 1fr); gap: 1.5rem; align-items: start; }
    nav.sections { position: sticky; top: 1rem; display: flex; flex-direction: column; gap: 0.2rem; max-height: calc(100dvh - 8rem); overflow: auto; }
    .nav-label { margin: 0.85rem 0 0.15rem; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #4f493f; }
    .nav-label:first-child { margin-top: 0; }
    nav.sections button { border: 0; border-radius: 0.7rem; background: transparent; color: #1a1814; font: inherit; font-weight: 650; text-align: left; padding: 0.45rem 0.7rem; cursor: pointer; }
    nav.sections button[aria-current="true"] { background: #1f4d3a; color: #efeae2; }
    nav.sections button:hover { background: #e4ddd3; }
    nav.sections button[aria-current="true"]:hover { background: #2a6850; }
    section { margin: 0; }
    details, fieldset { border: 1px solid #d8d0c4; background: #f7f4ef; border-radius: 1rem; padding: 0.35rem 1rem 0.15rem; margin: 0 0 0.75rem; }
    fieldset { background: #fff; }
    summary { cursor: pointer; font-weight: 700; padding: 0.55rem 0; }
    legend { font-weight: 650; padding: 0 0.3rem; }
    label.field { display: block; margin: 0 0 0.9rem; font-size: 0.92rem; font-weight: 650; }
    input, textarea { display: block; width: 100%; margin-top: 0.35rem; border: 1px solid #d8d0c4; border-radius: 0.75rem; padding: 0.65rem 0.75rem; font: inherit; font-weight: 450; color: #1a1814; background: #fff; }
    textarea { min-height: 6rem; resize: vertical; }
    .bar { position: sticky; bottom: 0; display: flex; gap: 0.75rem; align-items: center; justify-content: space-between; margin: 1rem -1.25rem 0; padding: 0.8rem 1.25rem; background: #efeae2; border-top: 1px solid #d8d0c4; }
    button.save { border: 0; border-radius: 999px; background: #1f4d3a; color: #efeae2; font: inherit; font-weight: 650; padding: 0.7rem 1.15rem; cursor: pointer; }
    button.save:hover { background: #2a6850; }
    #status { min-height: 1.5rem; font-weight: 650; }
    #status.error { color: #8f3d1b; }
    code { font-family: ui-monospace, monospace; font-size: 0.9em; }
    .sketch-preview { display: block; width: 100%; max-height: 22rem; object-fit: contain; background: #fff; border: 1px solid #d8d0c4; border-radius: 0.75rem; margin: 0 0 0.9rem; }
    .hint { margin: 0 0 0.9rem; color: #4f493f; font-size: 0.92rem; font-weight: 450; }
    @media (max-width: 800px) {
      .shell { grid-template-columns: 1fr; }
      nav.sections { position: static; flex-direction: row; flex-wrap: wrap; }
      .nav-label { width: 100%; }
    }
  </style>
</head>
<body>
  <main>
    <h1>Redigera texter</h1>
    <p class="intro">Välj en del till vänster. Spara gäller alla delar, även de som inte visas. Ändringarna sparas på den här datorn. Den publika sajten ändras när du publicerar den. Skriv <code>{foretag}</code>, <code>{produkt}</code>, <code>{namn}</code>, <code>{epost}</code>, <code>{telefon}</code> eller <code>{ort}</code> där de uppgifterna ska stå. Lämna ett pris tomt om det ska visas som texten när belopp saknas.</p>
    <form id="editor">
      <div class="shell">
        <nav class="sections" aria-label="Delar">${nav}</nav>
        <div>${blocks}</div>
      </div>
      <div class="bar">
        <p id="status" role="status"></p>
        <button class="save" type="submit">Spara</button>
      </div>
    </form>
  </main>
  <script>
    const form = document.querySelector("#editor");
    const status = document.querySelector("#status");
    const sections = [...form.querySelectorAll("[data-section]")];
    const navButtons = [...form.querySelectorAll("[data-nav]")];

    function showSection(id) {
      for (const section of sections) section.hidden = section.dataset.section !== id;
      for (const button of navButtons) {
        if (button.dataset.nav === id) button.setAttribute("aria-current", "true");
        else button.removeAttribute("aria-current");
      }
      if (location.hash !== "#" + id) history.replaceState(null, "", "#" + id);
    }

    function reveal(field) {
      const section = field.closest("[data-section]");
      if (section) showSection(section.dataset.section);
      let details = field.closest("details");
      while (details) {
        details.open = true;
        details = details.parentElement?.closest("details") ?? null;
      }
      field.focus();
    }

    const initial = location.hash.replace("#", "");
    showSection(sections.some((section) => section.dataset.section === initial) ? initial : "contact");
    for (const button of navButtons) {
      button.addEventListener("click", () => showSection(button.dataset.nav));
    }

    const sketchFile = form.querySelector("[data-sketch-file]");
    const sketchNote = form.querySelector("[data-sketch-note]");
    const sketchPreview = form.querySelector("[data-sketch-preview]");
    const sketchSrc = form.querySelector('[data-path="home.sketch.src"]');
    sketchFile?.addEventListener("change", async () => {
      const file = sketchFile.files?.[0];
      if (!file) return;
      sketchNote.textContent = "Laddar upp bilden…";
      try {
        const response = await fetch("/redigera/skiss", {
          method: "POST",
          headers: { "content-type": file.type || "application/octet-stream" },
          body: file,
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          sketchNote.textContent = payload.error || "Det gick inte att ladda upp bilden.";
          return;
        }
        if (sketchSrc) sketchSrc.value = payload.src;
        if (sketchPreview) {
          sketchPreview.src = payload.src;
          sketchPreview.hidden = false;
        }
        sketchNote.textContent = "Bilden är sparad. Beskrivningen sparas med Spara.";
        sketchFile.value = "";
      } catch {
        sketchNote.textContent = "Det gick inte att ladda upp bilden.";
      }
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      status.className = "";
      status.textContent = "Sparar…";
      const values = {};
      for (const field of form.querySelectorAll("[data-path]")) {
        if (field.dataset.kind === "price") {
          const raw = field.value.trim().replace(/\\s/g, "").replace(",", ".");
          if (raw === "") {
            values[field.dataset.path] = null;
            continue;
          }
          if (!/^\\d+$/.test(raw)) {
            status.className = "error";
            status.textContent = "Belopp ska vara ett helt antal kronor, eller tomt.";
            reveal(field);
            return;
          }
          values[field.dataset.path] = Number(raw);
        } else {
          values[field.dataset.path] = field.value;
        }
      }
      try {
        const response = await fetch("/redigera", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ values }),
        });
        const payload = await response.json().catch(() => ({}));
        if (!response.ok) {
          status.className = "error";
          status.textContent = payload.error || "Det gick inte att spara.";
          return;
        }
        status.textContent = "Sparat. Ladda om sajten om den inte uppdateras själv.";
      } catch {
        status.className = "error";
        status.textContent = "Det gick inte att spara.";
      }
    });
  </script>
</body>
</html>`;
}

function leaves(value, path, parentKey, out) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => leaves(item, `${path}.${index}`, path.split(".").pop(), out));
    return;
  }
  if (value && typeof value === "object") {
    for (const [key, child] of Object.entries(value)) {
      leaves(child, path ? `${path}.${key}` : key, key, out);
    }
    return;
  }
  out.push({ path, key: parentKey, value });
}

function setPath(root, path, value) {
  const parts = path.split(".");
  let cursor = root;
  for (let index = 0; index < parts.length - 1; index += 1) {
    const key = /^\d+$/.test(parts[index]) ? Number(parts[index]) : parts[index];
    cursor = cursor[key];
  }
  const last = parts[parts.length - 1];
  const key = /^\d+$/.test(last) ? Number(last) : last;
  cursor[key] = value;
}

function applyValues(current, values) {
  if (!values || typeof values !== "object" || Array.isArray(values)) {
    return "Skickat innehåll saknar fält.";
  }
  const expected = [];
  leaves(current, "", "", expected);
  const next = structuredClone(current);
  for (const leaf of expected) {
    if (!Object.prototype.hasOwnProperty.call(values, leaf.path)) {
      return `Fältet ${leaf.path} saknas.`;
    }
    const incoming = values[leaf.path];
    if (priceKeys.has(leaf.key) && (leaf.value === null || typeof leaf.value === "number")) {
      if (incoming !== null && (!Number.isInteger(incoming) || incoming < 0)) {
        return "Belopp ska vara ett helt antal kronor, eller tomt.";
      }
      setPath(next, leaf.path, incoming);
      continue;
    }
    if (typeof leaf.value === "string") {
      if (typeof incoming !== "string") return `Fältet ${leaf.path} ska vara text.`;
      setPath(next, leaf.path, incoming);
      continue;
    }
    return `Fältet ${leaf.path} har en typ som inte går att spara.`;
  }
  const allowed = new Set(expected.map((leaf) => leaf.path));
  for (const key of Object.keys(values)) {
    if (!allowed.has(key)) return "Formuläret innehåller ett okänt fält.";
  }
  return next;
}

function readBuffer(req, limit) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error("big"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

function imageExtension(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return "jpg";
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length >= png.length && buffer.subarray(0, png.length).equals(png)) return "png";
  const gif = buffer.length >= 6 ? buffer.subarray(0, 6).toString("ascii") : "";
  if (gif === "GIF87a" || gif === "GIF89a") return "gif";
  if (
    buffer.length >= 12 &&
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  ) {
    return "webp";
  }
  return "";
}

function saveSketch(buffer) {
  const extension = imageExtension(buffer);
  if (!extension) return "Bilden ska vara jpg, png, webp eller gif.";
  for (const name of readdirSync(publicDir)) {
    if (/^skiss\.(jpg|png|webp|gif)$/.test(name)) unlinkSync(join(publicDir, name));
  }
  const filename = `skiss.${extension}`;
  writeFileSync(join(publicDir, filename), buffer);
  const content = readContent();
  const alt = typeof content.home?.sketch?.alt === "string" ? content.home.sketch.alt : "";
  content.home.sketch = { src: `/${filename}?${Date.now()}`, alt };
  const temporary = `${contentPath}.tmp`;
  writeFileSync(temporary, `${JSON.stringify(content, null, 2)}\n`);
  renameSync(temporary, contentPath);
  return content.home.sketch.src;
}

function send(res, status, body, type) {
  res.statusCode = status;
  res.setHeader("content-type", type);
  res.end(body);
}

export function redigera() {
  return {
    name: "redigera",
    enforce: "post",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        const address = server.httpServer?.address();
        const port = address && typeof address === "object" ? address.port : 4321;
        server.config.logger.info(`Redigera texter på http://localhost:${port}/redigera`);
      });

      const handle = async (req, res, next) => {
        const url = req.url?.split("?")[0];
        const isForm = url === "/redigera" || url === "/redigera/";
        const isSketch = url === "/redigera/skiss";
        if (!isForm && !isSketch) return next();
        if (!isLocal(req)) {
          send(res, 403, "Redigering går bara från den här datorn.\n", "text/plain; charset=utf-8");
          return;
        }
        try {
          if (isSketch) {
            if (req.method !== "POST") {
              res.setHeader("allow", "POST");
              send(res, 405, "Metoden stöds inte.\n", "text/plain; charset=utf-8");
              return;
            }
            const buffer = await readBuffer(req, 8_000_000);
            const saved = saveSketch(buffer);
            if (!saved.startsWith("/")) {
              send(res, 400, JSON.stringify({ error: saved }), "application/json; charset=utf-8");
              return;
            }
            send(res, 200, JSON.stringify({ src: saved }), "application/json; charset=utf-8");
            return;
          }
          if (req.method === "GET") {
            send(res, 200, renderPage(readContent()), "text/html; charset=utf-8");
            return;
          }
          if (req.method === "POST") {
            const raw = (await readBuffer(req, 1_000_000)).toString("utf8");
            const payload = JSON.parse(raw);
            const result = applyValues(readContent(), payload.values);
            if (typeof result === "string") {
              send(res, 400, JSON.stringify({ error: result }), "application/json; charset=utf-8");
              return;
            }
            const temporary = `${contentPath}.tmp`;
            writeFileSync(temporary, `${JSON.stringify(result, null, 2)}\n`);
            renameSync(temporary, contentPath);
            send(res, 200, JSON.stringify({ ok: true }), "application/json; charset=utf-8");
            return;
          }
          res.setHeader("allow", "GET, POST");
          send(res, 405, "Metoden stöds inte.\n", "text/plain; charset=utf-8");
        } catch (error) {
          const tooBig = error instanceof Error && error.message === "big";
          const message = tooBig ? "Det som skickades är för stort." : "Det gick inte att läsa det som skickades.";
          send(res, 400, JSON.stringify({ error: message }), "application/json; charset=utf-8");
        }
      };

      return () => {
        server.middlewares.stack.unshift({ route: "", handle });
      };
    },
  };
}

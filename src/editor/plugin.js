import { readFileSync, renameSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const contentPath = join(dirname(fileURLToPath(import.meta.url)), "../data/content.json");

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

const groupTitles = {
  "home.sketch": "Skissen på startsidan",
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

function renderValue(value, path, key, parentKey) {
  if (Array.isArray(value)) {
    const noun = arrayNouns[key] ?? "Post";
    return value
      .map((item, index) => {
        const child = `${path}.${index}`;
        return `<fieldset><legend>${escapeHtml(noun)} ${index + 1}</legend>${renderValue(item, child, String(index), key)}</fieldset>`;
      })
      .join("");
  }
  if (value && typeof value === "object") {
    const inner = Object.entries(value)
      .map(([childKey, child]) => renderValue(child, path ? `${path}.${childKey}` : childKey, childKey, key))
      .join("");
    if (groupTitles[path]) {
      return `<fieldset><legend>${escapeHtml(groupTitles[path])}</legend>${inner}</fieldset>`;
    }
    return inner;
  }
  return renderField(path, key, parentKey, value);
}

function renderPage(content) {
  const sectionKeys = sections.map(([key]) => key);
  const contentKeys = Object.keys(content);
  if (sectionKeys.join("\n") !== contentKeys.join("\n")) {
    return `<!doctype html><html lang="sv"><body><p>Innehållsfilen och formuläret har inte samma avsnitt.</p></body></html>`;
  }
  const blocks = sections
    .map(([key, title]) => {
      return `<section><h2>${escapeHtml(title)}</h2>${renderValue(content[key], key, key, "")}</section>`;
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
    main { max-width: 46rem; margin: 0 auto; padding: 2rem 1.25rem 6rem; }
    h1 { font-size: 2rem; line-height: 1.15; margin: 0 0 0.75rem; }
    h2 { font-size: 1.35rem; margin: 0 0 1rem; }
    p.intro { color: #4f493f; margin: 0 0 1.5rem; }
    a { color: #1f4d3a; }
    section, fieldset { border: 1px solid #d8d0c4; background: #f7f4ef; border-radius: 1.1rem; padding: 1rem 1rem 0.25rem; margin: 0 0 1rem; }
    fieldset { background: #fff; }
    legend { font-weight: 650; padding: 0 0.3rem; }
    label.field { display: block; margin: 0 0 0.9rem; font-size: 0.92rem; font-weight: 650; }
    input, textarea { display: block; width: 100%; margin-top: 0.35rem; border: 1px solid #d8d0c4; border-radius: 0.75rem; padding: 0.65rem 0.75rem; font: inherit; font-weight: 450; color: #1a1814; background: #fff; }
    textarea { min-height: 6rem; resize: vertical; }
    .bar { position: sticky; bottom: 0; display: flex; gap: 0.75rem; align-items: center; justify-content: space-between; margin: 0 -1.25rem; padding: 0.8rem 1.25rem; background: #efeae2; border-top: 1px solid #d8d0c4; }
    button { border: 0; border-radius: 999px; background: #1f4d3a; color: #efeae2; font: inherit; font-weight: 650; padding: 0.7rem 1.15rem; cursor: pointer; }
    button:hover { background: #2a6850; }
    #status { min-height: 1.5rem; font-weight: 650; }
    #status.error { color: #8f3d1b; }
    code { font-family: ui-monospace, monospace; font-size: 0.9em; }
  </style>
</head>
<body>
  <main>
    <h1>Redigera texter</h1>
    <p class="intro">Ändringarna sparas i projektet på den här datorn. Den publika sajten ändras när du publicerar den, som vanligt. Antalet kort och sidornas adresser går inte att ändra här. Skriv <code>{foretag}</code>, <code>{produkt}</code>, <code>{namn}</code>, <code>{epost}</code>, <code>{telefon}</code> eller <code>{ort}</code> där de uppgifterna ska stå. Lämna ett pris tomt om det ska visas som texten när belopp saknas.</p>
    <form id="editor">
      ${blocks}
      <div class="bar">
        <p id="status" role="status"></p>
        <button type="submit">Spara</button>
      </div>
    </form>
  </main>
  <script>
    const form = document.querySelector("#editor");
    const status = document.querySelector("#status");
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
            field.focus();
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

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on("data", (chunk) => {
      size += chunk.length;
      if (size > 1_000_000) {
        reject(new Error("big"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function send(res, status, body, type) {
  res.statusCode = status;
  res.setHeader("content-type", type);
  res.end(body);
}

export function redigera() {
  return {
    name: "redigera",
    configureServer(server) {
      server.httpServer?.once("listening", () => {
        const address = server.httpServer?.address();
        const port = address && typeof address === "object" ? address.port : 4321;
        server.config.logger.info(`Redigera texter på http://localhost:${port}/redigera`);
      });

      server.middlewares.use(async (req, res, next) => {
        const url = req.url?.split("?")[0];
        if (url !== "/redigera" && url !== "/redigera/") return next();
        if (!isLocal(req)) {
          send(res, 403, "Redigering går bara från den här datorn.\n", "text/plain; charset=utf-8");
          return;
        }
        try {
          if (req.method === "GET") {
            send(res, 200, renderPage(readContent()), "text/html; charset=utf-8");
            return;
          }
          if (req.method === "POST") {
            const raw = await readBody(req);
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
        } catch {
          send(res, 400, JSON.stringify({ error: "Det gick inte att läsa det som skickades." }), "application/json; charset=utf-8");
        }
      });
    },
  };
}

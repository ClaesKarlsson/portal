# Affärssystem — marknadswebb

Statisk sajt för butikskassan och utrustningen runt den. Ingen databas och ingen koppling till kassans kod.

## Köra lokalt

```bash
cd ~/projects/portal
npm install
npm run dev
```

Öppna http://localhost:4321

`npm run build` skriver färdiga sidor till `dist/`.

## Ändra innehåll

Kör `npm run dev` och öppna http://localhost:4321/redigera. Formuläret sparar texterna i `src/data/content.json`. Sidan finns bara på den lokala datorn, inte i den publicerade sajten.

Ett tomt pris visas som texten "Pris vid visning", tills du fyller i ett belopp i kronor. I löpande text kan du skriva `{foretag}`, `{produkt}`, `{namn}`, `{epost}`, `{telefon}` och `{ort}`. De byts ut mot uppgifterna under Kontakt.

Den publika sajten ändras först när du publicerar, som nedan.

## Publicera

Den publika sajten är https://kassapaplats.se. `site` i `astro.config.mjs` är redan den adressen. Cloudflare Pages bygger från GitHub när `main` uppdateras: byggkommando `npm run build`, utdatamapp `dist`.

```bash
cd ~/projects/portal
git add src/data/content.json $(ls public/skiss.* 2>/dev/null)
git commit -m "Uppdatera texterna på sajten."
git push
```

Formuläret på `/boka` öppnar besökarens e-postprogram. Det skickar inget själv och sparar inget på servern.

Demobutiken på https://demo.kassapaplats.se är en egen kopia av kassan. Den uppdateras inte av det här repot. Se [docs/DEMO-SYNC.md](docs/DEMO-SYNC.md).

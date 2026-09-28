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

Priser, telefon och e-post ligger i `src/data/site.ts`. Ett tomt pris (`null`) visas som "Pris vid visning". Sätt ett tal i kronor när priset är bestämt, till exempel `programMonthly: 1500`.

## Publicera

Bygg kommandot är `npm run build`. Publicera mappen `dist/`.

På Cloudflare Pages eller Netlify: koppla repot, byggkommando `npm run build`, utdatamapp `dist`.

När du har ett domännamn, sätt `site: "https://dindomän.se"` i `astro.config.mjs`.

Formuläret på `/boka` öppnar besökarens e-postprogram. Det skickar inget själv och sparar inget på servern.

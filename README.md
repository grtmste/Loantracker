# Laenuhai 🦈

Laenuhai on mobiilisõbralik laenude jälgimise rakendus (loan tracker). Kogu kasutajaliides on eesti keeles. Andmed salvestatakse brauseri `localStorage`-i — taustteenust ega internetiühendust ei ole vaja.

## Funktsioonid

- **Konto** — esmakäivitusel loo üks konto (kasutajanimi + parool), sessioon püsib `localStorage`-is.
- **Avaleht** — kokkuvõttekaardid (aktiivsed laenud, jääk, hilinenud, oodatav sel kuul) ja laenusaajate nimekiri.
- **Jälgimine** — hilinenud maksed, järgmised maksed (30 päeva) ja muud aktiivsed laenud.
- **Laenud** — kõik laenud koos filtritega.
- **Laenu detail** — jääk, järgmise makse kuupäev, maksete ajalugu ning nupp „Märgi makse tehtuks".
- **Lisa / muuda laen** — automaatselt arvutatud tagasimakse ja intressikulu.

## Tehnoloogia

- React + Vite + TypeScript
- Tailwind CSS
- React Router v6
- `localStorage` andmete püsivuseks

## Käivitamine

```bash
npm install
npm run dev      # arendusserver
npm run build    # produktsioonibuild
npm run preview  # buildi eelvaade
```

## Vercelisse paigaldamine

Projekt sisaldab `vercel.json`-i SPA marsruutimise jaoks. Lihtsalt impordi repo Vercelisse — build-käsk on `npm run build`, väljundkaust `dist`.

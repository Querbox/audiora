# 🎧 Audiora

**Die Heimat für alles, was hörbar ist.**

Audiora ist kein Streamingdienst, sondern die zentrale Plattform zum Entdecken,
Organisieren und Bewerten von Podcasts, Hörbüchern, Hörspielen und allen anderen
Audioformaten – das IMDb/Letterboxd für Audio, mit Fokus auf den deutschen Markt.

## Starten

```bash
npm install
npm run dev        # → http://localhost:5180
```

## Seiten

| Route | Inhalt |
|---|---|
| `/` | Startseite: Suche, Stimmungskarten, Weiterhören, Empfehlungen, Community-Listen |
| `/suche?q=…` | Natürlichsprachige Suche („True Crime ohne brutale Details“) |
| `/titel/:id` | Titel-Detail: Bewertung, Plattform-Links, KI-Begründung, Ähnliches |
| `/graph?titel=…` | Interaktiver Audio Graph (zoomen, verschieben, klicken) |
| `/person/:id` | Profile für Autoren, Sprecher, Hosts – inkl. „Profil beanspruchen“ |
| `/listen`, `/listen/:id` | Community-Listen & Aktivitäten |
| `/dna` | Persönliche Audio-DNA mit Radar-Diagramm |

## Echte Daten – kostenlos, ohne API-Key

Die **Top 30 der deutschen Podcast-Charts sind echt** und werden automatisch importiert:

- **Apple Podcast-Charts** (`rss.marketingtools.apple.com`) → Rangliste, Cover, Genres
- **iTunes Lookup** → RSS-Feed-URL, Folgenzahl, Links
- **Offene RSS-Feeds** → Beschreibung, neueste Folgen, Dauer

`node scripts/import-podcasts.mjs` erzeugt daraus `src/real-podcasts.json` im
Audiora-Datenmodell (inkl. abgeleiteter Stimmungen/Situationen aus den Genres).
Der GitHub-Actions-Workflow führt den Import **jede Nacht** aus und deployt neu –
die Live-Seite hält sich also selbst aktuell. Schlägt der Import fehl, dient die
eingecheckte JSON als Fallback.

## Datenstrategie (Roadmap)

Audiora hostet **keine Audiodateien** – es zeigt echte Metadaten und verlinkt zu den Anbietern.

1. **Offene Podcast-RSS-Feeds** als primäre Quelle (Titel, Cover, Episoden, Dauer, Kategorien).
2. **APIs**: Podcast Index, Listen Notes, Spotify (Podcast-Metadaten), Google Books, Open Library.
3. **Eigener Importer/Crawler**: läuft nächtlich – neue Folge → importieren → KI analysiert →
   Tags, Themen, Stimmung → Audio Graph.
4. **Creator**: Podcast beanspruchen → RSS hinterlegen → automatische Synchronisation.

**MVP-Fokus: Podcasts zuerst** – technisch offen, Millionen freier Feeds, rechtlich einfacher.
Hörbücher folgen mit reinen Metadaten (Titel, Autor, Sprecher, Beschreibung, Plattform-Links).
Das Datenmodell ist von Anfang an **einheitlich**: Podcast, Hörbuch und Hörspiel sind intern
dasselbe Audio-Objekt (siehe `src/data.js`) – neue Inhaltstypen sind nur ein weiterer `type`.

Der langfristige Wert liegt in dem, was APIs *nicht* liefern: Bewertungen, Community-Listen,
Audio-DNA, KI-Tags und der Audio Graph.

## Deployment

Jeder Push auf `main` baut die App via GitHub Actions und veröffentlicht sie auf GitHub Pages
(`.github/workflows/deploy.yml`). SPA-Routing wird über eine `404.html`-Kopie abgefangen.

## Architektur

- **Vite + React 18 + React Router** – keine weiteren Laufzeit-Abhängigkeiten.
- `src/data.js` ist die Mock-Datenbank *und* die Graph-/Such-/Empfehlungs-Logik
  (`smartSearch`, `buildGraph`, `similarTo`, `explainRecommendation`).
  In Produktion würde sie durch externe APIs (Spotify, Podcast Index,
  Google Books, Open Library) plus eigene Metadaten-DB ersetzt.
- Der Audio Graph nutzt eine kleine eigene Force-Simulation (SVG, ohne D3).
- Cover werden als Farbverlauf + Emoji generiert – keine Bildrechte nötig.

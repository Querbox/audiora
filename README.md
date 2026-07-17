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

Drei Importer laufen **jede Nacht** im GitHub-Actions-Workflow und deployen neu.
Schlägt eine Quelle fehl, dient die eingecheckte JSON als Fallback.

| Importer | Quelle | Liefert |
|---|---|---|
| `import-podcasts.mjs` | Apple Podcast-Charts + iTunes Lookup + offene RSS-Feeds | Top 30 DE-Podcasts: Cover, Beschreibung, neueste Folgen, Dauer |
| `import-audiobooks.mjs` | Apple Hörbuch-Charts (Legacy-RSS) + iTunes Lookup | Top 30 DE-Hörbücher: Cover, Beschreibung, Apple-Books-Link |
| `import-librivox.mjs` | LibriVox API | Gemeinfreie deutsche Klassiker – komplett & legal kostenlos hörbar |

Dazu einmalig `enrich-media.mjs` (iTunes-Cover + Wikipedia-Fotos für kuratierte Inhalte).

**Optional: Spotify-Anreicherung.** Der Hörbuch-Importer nutzt automatisch die
kostenlose Spotify Web API (Sprecher, Kapitelzahl, Direktlinks), sobald die
Repo-Secrets `SPOTIFY_CLIENT_ID` und `SPOTIFY_CLIENT_SECRET` gesetzt sind
(App anlegen unter developer.spotify.com/dashboard, dann
`gh secret set SPOTIFY_CLIENT_ID` / `gh secret set SPOTIFY_CLIENT_SECRET`).
Ohne Secrets läuft der Import unverändert – nur ohne Sprecherangaben.

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

## Nutzerkonten (Supabase)

Registrierung, Login, Favoriten, Gehört-Markierungen, Likes und die daraus live
berechnete Audio-DNA laufen über [Supabase](https://supabase.com) (kostenloser Tier reicht).
Einrichtung in 3 Schritten:

1. **Schema anlegen:** Inhalt von `supabase/schema.sql` im Dashboard unter
   *SQL Editor → New query* ausführen (Profile, User-Items, RLS-Policies, Signup-Trigger).
2. **Credentials eintragen:** In `src/supabase-config.js` die Project-URL und den
   Anon-Key aus *Project Settings → API* einsetzen (der Anon-Key darf öffentlich sein,
   Row-Level-Security schützt alle Daten), dann committen/deployen.
3. **Redirect-URL setzen:** Unter *Authentication → URL Configuration* als Site URL
   `https://querbox.github.io/audiora/` eintragen, damit Bestätigungs-Mails korrekt
   zurückführen.

Ohne Konfiguration läuft die Seite im Demo-Modus (Beispiel-Profil, lokale Buttons).

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

# Rekruten-Bewertung

Interne Web-App, mit der ein Kader-Team Rekruten bewertet. Zugang nur auf Einladung.
Funktioniert auf Laptop und Handy.

- **Admin** (du): erstellt Anlässe, verwaltet die Rekrutenliste, lädt Teammitglieder ein,
  sieht alle Bewertungen + Auswertung.
- **Bewerter** (Teammitglieder): bewerten jeden Rekruten pro Anlass mit
  `-- / - / 0 / + / ++` und freiem Text (**Bemerkungen**). Sehen nur ihre eigenen Bewertungen.

## Tech-Stack

- **Next.js 16** (App Router, TypeScript) + **Tailwind CSS v4**
- **Supabase** – Postgres-Datenbank, Authentifizierung, Row Level Security (RLS)
- Deployment auf **Vercel**

## Datenmodell

| Tabelle    | Inhalt |
|------------|--------|
| `profiles` | Konten + Rolle (`admin` / `evaluator`) |
| `recruits` | Globale Rekrutenliste: Name + Sprache (`de`/`fr`) + aktiv/inaktiv |
| `events`   | Anlässe: Titel, Datum, Zeit |
| `ratings`  | Eine Bewertung pro Bewerter × Rekrut × Anlass: Score `-2..2`, Bemerkungen |

RLS sorgt dafür, dass Bewerter nur ihre eigenen Bewertungen sehen/ändern und nur Admins
Anlässe/Rekruten/Team verwalten. Anonyme Zugriffe sehen nichts.

## Einrichtung (einmalig)

Die Supabase-Datenbank ist bereits angelegt und konfiguriert. `.env.local` enthält bereits
die Projekt-URL und den öffentlichen Schlüssel. Es fehlen nur noch diese Schritte:

### 1. Secret Key hinterlegen (für Einladungen)
Supabase Dashboard → **Project Settings → API Keys** → den **secret**-Schlüssel
(`sb_secret_…`) kopieren und in `.env.local` bei `SUPABASE_SECRET_KEY=` einsetzen.

### 2. Erstes Admin-Konto erstellen
Supabase Dashboard → **Authentication → Users → Add user** → deine E-Mail
(`corkovicanto@gmail.com`) + Passwort, **„Auto Confirm User"** aktivieren.
→ Dieses Konto wird automatisch zum **Admin** (per Datenbank-Trigger).
Danach unter `/login` anmelden.

> Nutzt du eine andere E-Mail? Dann im Dashboard im **SQL Editor** ausführen:
> `update public.profiles set role='admin' where email='deine@mail.ch';`

### 3. Öffentliche Registrierung deaktivieren (nur auf Einladung)
Supabase Dashboard → **Authentication → Providers → Email** →
**„Allow new users to sign up"** ausschalten. Neue Konten entstehen dann nur über Einladungen.

### 4. URLs für Auth setzen
Supabase Dashboard → **Authentication → URL Configuration**:
- **Site URL**: deine App-Adresse (lokal `http://localhost:3000`, später die Vercel-URL)
- **Redirect URLs**: `http://localhost:3000/**` und später `https://DEINE-DOMAIN/**`

### 5. (Empfohlen) E-Mail-Versand für Einladungen
Der eingebaute Supabase-Mailversand ist nur zum Testen gedacht (stark limitiert).
Für zuverlässige Einladungen unter **Authentication → Emails → SMTP Settings** einen
Anbieter wie **Resend** (kostenloses Kontingent) hinterlegen.

Falls Einladungslinks keine Sitzung herstellen, die Vorlage **Authentication → Emails →
Templates → „Invite user"** auf das Token-Hash-Format umstellen:

```html
<h2>Einladung zur Rekruten-Bewertung</h2>
<p>Klicke auf den Link, um dein Konto einzurichten:</p>
<p><a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=invite">Konto einrichten</a></p>
```

## Lokal starten

```bash
npm install
npm run dev
```

App unter http://localhost:3000.

## Bauen / Deployen

```bash
npm run build   # Produktions-Build (Turbopack)
```

Auf **Vercel**: Repo importieren, die drei Variablen aus `.env.local`
(`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`,
`SUPABASE_SECRET_KEY`) als Environment Variables setzen, deployen. Danach die Vercel-URL
in Supabase unter **Site URL** und **Redirect URLs** ergänzen (Schritt 4).

## Bedienung

- **Anlässe** – Liste aller Anlässe; Admin erstellt/bearbeitet hier neue Anlässe.
- **Anlass öffnen → Bewerten** – alle aktiven Rekruten mit `-- / - / 0 / + / ++` und
  Bemerkungen; Eingaben werden **automatisch gespeichert** (Suche + Sprachfilter oben).
- **Auswertung** (nur Admin) – pro Rekrut Durchschnitt + alle Einzelbewertungen.
- **Rekruten** (nur Admin) – Rekrutenliste pflegen (Name + Sprache, aktiv/inaktiv).
- **Team** (nur Admin) – Teammitglieder per E-Mail einladen.

## Projektstruktur (Kurzüberblick)

```
src/
  proxy.ts                 # Session-Refresh + Zugriffsschutz (Next 16 "Proxy" = Middleware)
  lib/supabase/            # Supabase-Clients (Browser / Server / Admin) + Proxy-Logik
  lib/actions/             # Server Actions (auth, events, recruits, team)
  lib/auth.ts              # Auth-Helfer (requireUser / requireAdmin)
  app/login, app/accept-invite, app/auth/confirm
  app/(app)/events, app/(app)/admin/...   # geschützte Bereiche
  components/              # UI + Bewertungs-Komponenten
```

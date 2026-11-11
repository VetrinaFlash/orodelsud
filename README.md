# Pasta Oro del Sud — sito + gestionale ordini Ho.Re.Ca.

Un solo progetto Cloudflare Worker che contiene:

| Indirizzo | Cosa c'è |
|---|---|
| `/` | **Sito pubblico**: home, catalogo formati, schede prodotto, il pastificio, pagina per la ristorazione, contatti, privacy |
| `/area-clienti/` | **App ordini per i clienti** (ristoranti, pizzerie, gastronomie), installabile sul telefono |
| `/admin/` | **Gestionale** del pastificio (e area agenti) |

Il sito legge prodotti, foto e zone di consegna dal database del gestionale: quando si aggiorna il listino, il catalogo online si aggiorna da solo. I testi delle pagine si cambiano dal pannello (**Sito web**).

Tutto su Cloudflare: Worker + D1 (database) + R2 (foto). Nessuna libreria esterna, nessuna build.

## Messa online

Il database D1 e il bucket R2 **si creano da soli al primo deploy** (non ci sono ID da copiare), e tabelle, catalogo di esempio e impostazioni si creano alla prima visita. Anche le chiavi per le notifiche push si generano da sole e restano nel database.

1. Cloudflare → **Workers & Pages → Create → Import a repository** → scegli `VetrinaFlash/orodelsud`.
   - Build command: vuoto · Deploy command: `npx wrangler deploy` (quello proposto) · Root directory: vuota.
2. Al termine il sito è su `https://orodelsud.<account>.workers.dev`. Ogni push su `main` ripubblica.
3. **Dominio**: Worker → Settings → Domains & Routes → *Add Custom Domain* → `orodelsud.it` (e `www.orodelsud.it`). Il dominio deve essere gestito da Cloudflare (basta spostare i nameserver; la posta esistente non si tocca se si copiano i record MX).
   Dopo, in `wrangler.toml` metti `APP_URL = "https://orodelsud.it"` (serve per i link nelle email e nella sitemap).

Da riga di comando, in alternativa: `npm install && npx wrangler login && npx wrangler deploy`.

> Se il primo deploy si ferma sui binding: R2 va attivato una volta sull'account (Cloudflare → R2 → *Purchase/Enable*, il piano gratuito basta). In alternativa crea a mano il database D1 `orodelsud-db` e il bucket R2 `orodelsud-images`: il deploy li trova per nome.

### Facoltativi

- **Email automatiche** (nuovo ordine al pastificio, conferma al cliente, inviti, reset password, richieste dal sito): crea un account [Resend](https://resend.com), aggiungi il dominio e imposta il secret `RESEND_API_KEY` (Worker → Settings → Variables and Secrets). Senza Resend tutto funziona lo stesso: gli inviti si mandano col pulsante WhatsApp e le richieste arrivano come notifica nel pannello.
- **Password del pannello**: è già impostata (l'impronta cifrata sta in `wrangler.toml`). Per cambiarla imposta il secret `ADMIN_PASSWORD` oppure rigenera l'impronta con `npm run password -- "nuova password"`.

## Primo accesso al pannello

`/admin/` → password del pannello. La panoramica mostra la lista **Per partire**:

1. Impostazioni → dati aziendali (indirizzo, telefono, email, P.IVA): compaiono su sito, email e app.
2. Prodotti → controlla prezzi e formati (il catalogo iniziale è **di esempio**), oppure *Importa listino* da CSV.
3. Prodotti → carica le foto (finché manca la foto, sito e app mostrano un'illustrazione del formato).
4. Impostazioni → attiva le notifiche sul telefono.
5. Clienti → crea il primo cliente e mandagli l'invito (email o WhatsApp).

## Cosa fa

**Sito pubblico**
- Pagine generate dal Worker (veloci e indicizzabili): sitemap.xml, robots.txt, dati strutturati, URL parlanti per ogni prodotto
- Catalogo per categorie con formato, tempo di cottura, allergeni; prezzi nascosti o visibili (interruttore nel pannello)
- Pagina "Per la ristorazione" con zone e giorni di consegna presi dal gestionale
- Modulo **Richiedi il listino** con protezione anti-spam: la richiesta arriva nel pannello (+ notifica push + email)

**Richieste dal sito** (pannello)
- Elenco con stato (nuova, contattata, diventata cliente, archiviata), note interne, chiamata e WhatsApp in un tocco
- **Crea cliente**: l'anagrafica si compila dalla richiesta e parte l'invito per ordinare

**Cliente (PWA installabile)**
- Catalogo con i suoi prezzi (sconto % o prezzo fisso per prodotto), ricerca, categorie, preferiti, "I soliti"
- Data di consegna secondo la sua zona, con limite orario e conto alla rovescia
- Carrello con IVA per aliquota (4% pasta, 10% ripiena/gnocchi), spese di consegna e soglia di gratuità, ordine minimo
- Storico ordini, stato in tempo reale, "Ordina di nuovo", annullamento finché non è confermato
- Notifiche push (conferma, preparazione, consegna, modifiche, messaggi, promozioni, promemoria "ordina entro le…")

**Agente** (stesso pannello, vede solo i suoi clienti)
- Ordini e clienti propri, inserimento ordini, provvigioni, messaggi ai clienti

**Pastificio**
- Panoramica: da confermare, consegne oggi/domani, imponibile del mese, grafico 30 giorni, prodotti e clienti top, clienti da richiamare, scorte basse
- Ordini: filtri, cambio stato singolo o in blocco, modifica righe (peso reale, sostituzioni), note, pagato, rif. fattura/DDT, stampa, WhatsApp
- Inserimento ordini presi al telefono/WhatsApp
- Preparazione: totali da produrre per giorno + giro consegne per zona, stampabile
- Prodotti: foto su R2, giacenze, minimi e multipli (es. pasta fresca a 0,5 kg), cottura, allergeni, visibilità sul sito, prodotti riservati, import/export CSV
- Clienti, zone, agenti, provvigioni, promozioni, comunicazioni push, impostazioni (ferie, chiusure, ordine minimo, conferma automatica, promemoria)
- Esportazione ordini CSV per il commercialista

## Sviluppo in locale

```bash
npm install
cp .dev.vars.example .dev.vars
npm run dev            # http://localhost:8787 — il database locale si crea da solo
```

Dopo aver modificato `migrations/*.sql` o `seed.sql`: `npm run schema` (rigenera `src/lib/schema.js`).

## Struttura

```
src/index.js          ingresso del Worker (fetch + cron ogni 30 minuti)
src/site.js           pagine del sito pubblico
src/api.js            router delle API /api/*
src/lib/              logica: ordini, prezzi, consegne, notifiche push, email, richieste dal sito
public/area-clienti/  app clienti        public/admin/  pannello
public/assets/        js/css condivisi, logo, illustrazioni dei formati
migrations/, seed.sql database e catalogo iniziale
```

## Note tecniche

- Importi in centesimi, IVA esclusa sul listino; IVA calcolata per aliquota.
- Pannello protetto da password (PBKDF2, blocco dopo 8 errori in 15 minuti). Password clienti PBKDF2, sessione in cookie HttpOnly, controllo dell'origine sulle richieste che modificano dati.
- Web Push implementato con WebCrypto (VAPID + aes128gcm). Su iPhone le notifiche funzionano con l'app aggiunta alla Home (iOS 16.4+): l'app lo spiega al cliente.

// Sito pubblico di Pasta Oro del Sud, generato dal Worker leggendo il database:
// prodotti, foto, testi e zone di consegna si aggiornano dal pannello senza toccare il codice.
import { getSettings } from './lib/core.js';
import { ensureSchema } from './lib/migrate.js';
import { LEAD_KINDS } from './lib/routes-site.js';
import { pastaArt } from '../public/assets/pasta-art.js';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const slugify = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const productPath = p => `/prodotti/${p.id}-${slugify(p.name)}${p.pack ? '-' + slugify(p.pack) : ''}`;
const euro = c => new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format((c || 0) / 100);
const paras = t => String(t || '').split(/\n\s*\n/).map(p => p.trim()).filter(Boolean).map(p => `<p>${esc(p)}</p>`).join('');
const DAYS = ['lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato', 'domenica'];
const telHref = p => `tel:${String(p || '').replace(/[^\d+]/g, '')}`;
const waHref = p => { let n = String(p || '').replace(/[^\d+]/g, ''); n = n.startsWith('+') ? n.slice(1) : n.startsWith('00') ? n.slice(2) : '39' + n; return `https://wa.me/${n}`; };

const ICON = {
  bronze: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="11" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="16" cy="16" r="2.4" fill="currentColor"/><circle cx="16" cy="9" r="2" fill="currentColor"/><circle cx="16" cy="23" r="2" fill="currentColor"/><circle cx="9" cy="16" r="2" fill="currentColor"/><circle cx="23" cy="16" r="2" fill="currentColor"/></svg>',
  sun: '<svg viewBox="0 0 32 32" aria-hidden="true"><circle cx="16" cy="16" r="6" fill="none" stroke="currentColor" stroke-width="2"/><path d="M16 3v4M16 25v4M3 16h4M25 16h4M6.8 6.8l2.8 2.8M22.4 22.4l2.8 2.8M6.8 25.2l2.8-2.8M22.4 9.6l2.8-2.8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
  wheat: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 29V9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><path d="M16 23c-4 0-6-3-6-6 4 0 6 3 6 6Zm0 0c4 0 6-3 6-6-4 0-6 3-6 6Zm0-6c-4 0-6-3-6-6 4 0 6 3 6 6Zm0 0c4 0 6-3 6-6-4 0-6 3-6 6Zm0-6c-3 0-4-3-4-6 3 0 4 3 4 6Zm0 0c3 0 4-3 4-6-3 0-4 3-4 6Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  truck: '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M3 8h16v14H3zM19 12h6l4 5v5h-10" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><circle cx="9" cy="23.5" r="2.6" fill="var(--cream)" stroke="currentColor" stroke-width="2"/><circle cx="23" cy="23.5" r="2.6" fill="var(--cream)" stroke="currentColor" stroke-width="2"/></svg>',
  phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h3l1.5 4-2 1.5a11 11 0 0 0 7 7l1.5-2 4 1.5v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  mail: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="m4 7 8 6 8-6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
  pin: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="12" cy="9.5" r="2.5" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
  clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  wa: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.2-3.6A8 8 0 1 1 8 19.2L4 20Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/><path d="M9 9c0 3 2.5 6 6 6l1-1.5-2-1-1 .8c-1-.4-2-1.4-2.3-2.3l.8-1-1-2L9 9Z" fill="currentColor"/></svg>',
  check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12.5 4.2 4.2L19 7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  menu: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>',
};

// ---------- dati ----------
async function loadCatalog(env) {
  const [{ results: cats }, { results: prods }] = await Promise.all([
    env.DB.prepare('SELECT id, name, sort FROM categories ORDER BY sort, name').all(),
    env.DB.prepare(`SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id
      WHERE p.archived = 0 AND p.site_visible = 1 AND NOT EXISTS (SELECT 1 FROM product_visibility v WHERE v.product_id = p.id)
      ORDER BY c.sort, p.sort, p.name`).all(),
  ]);
  for (const p of prods) p.image = p.image_key ? `/api/img/${p.image_key}` : (p.image_url || null);
  return { cats: cats.filter(c => prods.some(p => p.category_id === c.id)), prods };
}

// ---------- componenti ----------
function header(s, path) {
  const nav = [['/prodotti', 'Prodotti'], ['/pastificio', 'Il pastificio'], ['/ristorazione', 'Per la ristorazione'], ['/contatti', 'Contatti']];
  const links = nav.map(([h, l]) => `<a href="${h}"${path === h || path.startsWith(h + '/') ? ' aria-current="page"' : ''}>${l}</a>`).join('');
  return `<header class="s-header"><div class="wrap s-header-in">
    <a class="s-logo" href="/" aria-label="${esc(s.company_name)} — home"><img src="/assets/brand/logo-480.webp" width="240" height="144" alt="${esc(s.company_name)}"></a>
    <nav class="s-nav" aria-label="Menu principale">${links}</nav>
    <a class="s-btn s-btn-gold s-cta-head" href="/area-clienti/">Area clienti</a>
    <details class="s-burger"><summary aria-label="Apri il menu">${ICON.menu}</summary>
      <nav aria-label="Menu">${links}<a href="/area-clienti/" class="s-btn s-btn-gold">Area clienti</a></nav></details>
  </div></header>`;
}

function footer(s) {
  const year = new Date().getFullYear();
  const social = [s.site_instagram && `<a href="${esc(s.site_instagram)}" rel="noopener" target="_blank">Instagram</a>`, s.site_facebook && `<a href="${esc(s.site_facebook)}" rel="noopener" target="_blank">Facebook</a>`].filter(Boolean).join(' · ');
  return `<footer class="s-footer"><div class="wrap s-footer-grid">
    <div><img src="/assets/brand/logo-480.webp" width="200" height="120" alt="${esc(s.company_name)}" class="s-footer-logo" loading="lazy">
      <p class="s-muted">Pasta di semola di grano duro trafilata al bronzo e pasta fresca per la ristorazione.</p></div>
    <div><h3>Contatti</h3><ul class="s-contact-list">${contactItems(s)}</ul></div>
    <div><h3>Esplora</h3><ul class="s-links">
      <li><a href="/prodotti">I nostri formati</a></li><li><a href="/pastificio">Il pastificio</a></li>
      <li><a href="/ristorazione">Diventa cliente Ho.Re.Ca.</a></li><li><a href="/area-clienti/">Area clienti · ordini</a></li></ul>
      ${social ? `<p class="s-social">${social}</p>` : ''}</div>
  </div>
  <div class="wrap s-footer-bottom"><span>© ${year} ${esc(s.company_name)}${s.company_vat ? ` · P.IVA ${esc(s.company_vat)}` : ''}</span>
    <span><a href="/privacy">Privacy</a> · <a href="/admin/" rel="nofollow">Accesso staff</a> · Sito realizzato da Daniele Zobel</span></div></footer>`;
}

function contactItems(s) {
  return [
    s.company_address && `<li>${ICON.pin}<span>${esc(s.company_address)}</span></li>`,
    s.company_phone && `<li>${ICON.phone}<a href="${telHref(s.company_phone)}">${esc(s.company_phone)}</a></li>`,
    s.company_whatsapp && `<li>${ICON.wa}<a href="${waHref(s.company_whatsapp)}" target="_blank" rel="noopener">WhatsApp</a></li>`,
    s.company_email && `<li>${ICON.mail}<a href="mailto:${esc(s.company_email)}">${esc(s.company_email)}</a></li>`,
    s.site_hours && `<li>${ICON.clock}<span>${esc(s.site_hours)}</span></li>`,
  ].filter(Boolean).join('') || `<li>${ICON.mail}<a href="/contatti#richiesta">Scrivici dal modulo: ti rispondiamo in giornata</a></li>`;
}

function productCard(p, s) {
  const media = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy" width="400" height="300">`
    : pastaArt(p.name);
  const fresh = /fresc/i.test(p.category_name || '');
  return `<a class="s-card" href="${productPath(p)}">
    <div class="s-card-media${p.image ? ' has-img' : ''}">${media}${fresh ? '<span class="s-badge">Su ordinazione</span>' : ''}</div>
    <div class="s-card-body"><h3>${esc(p.name)}</h3>
      <p class="s-card-meta">${[p.pack, p.cooking_time && `cottura ${p.cooking_time}`].filter(Boolean).map(esc).join(' · ')}</p>
      ${s.site_show_prices === '1' ? `<p class="s-card-price">${euro(p.price)} <small>/ ${esc(p.unit)} + IVA</small></p>` : ''}
    </div></a>`;
}

function leadForm(s, { compact = false } = {}) {
  return `<form class="s-form" id="richiesta-form" novalidate>
    <div class="s-form-grid">
      <div class="s-field s-span2"><label for="lf-bn">Nome del locale *</label><input id="lf-bn" name="business_name" required autocomplete="organization"></div>
      <div class="s-field"><label for="lf-kind">Tipo di attività</label><select id="lf-kind" name="kind"><option value="">Scegli…</option>${LEAD_KINDS.map(k => `<option>${esc(k)}</option>`).join('')}</select></div>
      <div class="s-field"><label for="lf-city">Città</label><input id="lf-city" name="city" autocomplete="address-level2"></div>
      <div class="s-field"><label for="lf-cn">Referente *</label><input id="lf-cn" name="contact_name" required autocomplete="name"></div>
      <div class="s-field"><label for="lf-ph">Telefono</label><input id="lf-ph" name="phone" type="tel" autocomplete="tel"></div>
      <div class="s-field"><label for="lf-em">Email</label><input id="lf-em" name="email" type="email" autocomplete="email"></div>
      <div class="s-field"><label for="lf-vat">Partita IVA</label><input id="lf-vat" name="vat" inputmode="numeric"></div>
      ${compact ? '' : `<div class="s-field s-span2"><label for="lf-msg">Cosa ti serve?</label><textarea id="lf-msg" name="message" rows="4" placeholder="Formati che usi, quantità indicative a settimana, giorni di consegna preferiti…"></textarea></div>`}
    </div>
    <div class="s-hp" aria-hidden="true"><label>Lascia vuoto <input name="website" tabindex="-1" autocomplete="off"></label></div>
    <label class="s-check"><input type="checkbox" name="privacy" required><span>Acconsento al trattamento dei dati per essere ricontattato, come descritto nell'<a href="/privacy" target="_blank">informativa privacy</a>. *</span></label>
    <button class="s-btn s-btn-dark s-btn-lg" type="submit">Richiedi il listino ${ICON.arrow}</button>
    <p class="s-form-msg" role="status" aria-live="polite"></p>
  </form>`;
}

function appMockup(s, prods) {
  const items = prods.slice(0, 4);
  return `<div class="s-phone" aria-hidden="true"><div class="s-phone-screen">
    <div class="m-top"><img src="/assets/brand/logo-480.webp" alt=""><span>Trattoria da Rosa<small>Ordini ${esc(s.company_name)}</small></span></div>
    <div class="m-body">
      <div class="m-deliv">${ICON.truck}<div><b>Consegna domani</b><small>Ordina entro le 18:00 · cambia data</small></div></div>
      ${items.map((p, i) => `<div class="m-row"><div class="m-thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : pastaArt(p.name)}</div>
        <div class="m-info"><b>${esc(p.name)}</b><small>${esc(p.pack || '')}</small><i>${euro(Math.round(p.price * .9))} / ${esc(p.unit)}</i></div>
        <div class="m-step">${i === 0 ? '<span>−</span><b>6</b><span>+</span>' : i === 2 ? '<span>−</span><b>2</b><span>+</span>' : '<em>+ Aggiungi</em>'}</div></div>`).join('')}
    </div>
    <div class="m-cart"><span class="m-count">2</span><span>${euro(Math.round(((items[0]?.price || 0) * 6 + (items[2]?.price || 0) * 2) * .9))}<small>IVA esclusa</small></span><b>Invia ordine</b></div>
  </div></div>`;
}

function zonesTable(zones) {
  if (!zones.length) return '';
  return `<div class="s-zones">${zones.map(z => {
    const days = String(z.delivery_days).split(',').map(Number).filter(Boolean).map(d => DAYS[d - 1]);
    return `<div class="s-zone"><h3>${esc(z.name)}</h3>
      <p><b>Consegna:</b> ${days.length === 7 ? 'tutti i giorni' : days.join(', ')}</p>
      <p><b>Ordina entro:</b> le ${esc(z.cutoff_time)} ${z.lead_days > 1 ? `di ${z.lead_days} giorni prima` : z.lead_days === 1 ? 'del giorno prima' : 'dello stesso giorno'}</p>
      <p><b>Trasporto:</b> ${z.delivery_fee ? `${euro(z.delivery_fee)}${z.free_over ? `, gratis sopra ${euro(z.free_over)}` : ''}` : 'gratuito'}</p></div>`;
  }).join('')}</div>`;
}

const STEPS = `<ol class="s-steps">
  <li><b>Richiedi l'accesso</b><span>Compila il modulo o chiamaci: ti ricontattiamo in giornata per conoscere il tuo locale.</span></li>
  <li><b>Ricevi il tuo listino</b><span>Concordiamo prezzi, formati e giorni di consegna. Ti arriva il link per scegliere la password.</span></li>
  <li><b>Ordina dal telefono</b><span>Quando vuoi, anche a servizio finito. Vedi subito il totale e ricevi una notifica a ogni passaggio.</span></li>
</ol>`;

function layout(s, { title, description, path, body, jsonld, origin }) {
  const full = title ? `${title} · ${s.company_name}` : `${s.company_name} · Pasta artigianale trafilata al bronzo`;
  const canonical = `${origin}${path}`;
  const ld = [{
    '@context': 'https://schema.org', '@type': 'FoodEstablishment', additionalType: 'https://schema.org/LocalBusiness',
    name: s.company_name, url: origin, logo: `${origin}/assets/brand/logo-1200.png`, image: `${origin}/assets/brand/logo-1200.png`,
    ...(s.company_phone ? { telephone: s.company_phone } : {}), ...(s.company_email ? { email: s.company_email } : {}),
    ...(s.company_address ? { address: s.company_address } : {}),
  }, ...(jsonld ? [jsonld] : [])];
  return `<!doctype html>
<html lang="it">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(full)}</title>
<meta name="description" content="${esc(description || s.site_hero_text)}">
<link rel="canonical" href="${esc(canonical)}">
<meta name="theme-color" content="#4a2310">
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(full)}">
<meta property="og:description" content="${esc(description || s.site_hero_text)}">
<meta property="og:url" content="${esc(canonical)}">
<meta property="og:image" content="${origin}/assets/brand/logo-1200.png">
<meta property="og:locale" content="it_IT">
<link rel="icon" href="/icons/favicon-48.png" type="image/png">
<link rel="apple-touch-icon" href="/icons/apple-touch-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,600;1,9..144,400&family=Figtree:wght@400;500;600;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/site.css">
<script type="application/ld+json">${JSON.stringify(ld.length === 1 ? ld[0] : ld).replace(/</g, '\\u003c')}</script>
</head>
<body>
<a class="s-skip" href="#main">Vai al contenuto</a>
${header(s, path)}
<main id="main">${body}</main>
${footer(s)}
<script src="/assets/site.js" defer></script>
</body>
</html>`;
}

// ---------- pagine ----------
async function home(env, s) {
  const { prods } = await loadCatalog(env);
  // in evidenza prima, poi il resto: sempre 8 card (2 righe piene)
  const featured = [...prods.filter(p => p.featured), ...prods.filter(p => !p.featured)].slice(0, 8);
  const body = `
  <section class="s-hero"><div class="wrap s-hero-grid">
    <div class="s-hero-text">
      <p class="s-eyebrow">Pastificio artigianale · Sud Italia</p>
      <h1>${esc(s.site_hero_title)}</h1>
      <p class="s-lead">${esc(s.site_hero_text)}</p>
      <div class="s-actions"><a class="s-btn s-btn-dark s-btn-lg" href="/prodotti">Scopri i formati ${ICON.arrow}</a><a class="s-btn s-btn-line s-btn-lg" href="/ristorazione">Sei un ristorante?</a></div>
    </div>
    <div class="s-hero-art"><div class="s-sun"></div><img src="/assets/brand/logo-1200.webp" width="600" height="361" alt="${esc(s.company_name)}" fetchpriority="high"></div>
  </div></section>

  <section class="s-values"><div class="wrap s-values-grid">
    <div>${ICON.wheat}<b>Semola di grano duro</b><span>Solo semola e acqua, senza additivi.</span></div>
    <div>${ICON.bronze}<b>Trafilata al bronzo</b><span>Superficie ruvida che trattiene il sugo.</span></div>
    <div>${ICON.sun}<b>Essiccazione lenta</b><span>A bassa temperatura, per una cottura che tiene.</span></div>
    <div>${ICON.truck}<b>Consegna diretta</b><span>Con il nostro furgone, nei giorni del tuo giro.</span></div>
  </div></section>

  <section class="s-section"><div class="wrap">
    <div class="s-section-head"><div><p class="s-eyebrow">I nostri formati</p><h2>Dalla pasta secca alla fresca su ordinazione</h2></div>
      <a class="s-link" href="/prodotti">Tutto il catalogo ${ICON.arrow}</a></div>
    <div class="s-grid">${featured.map(p => productCard(p, s)).join('')}</div>
  </div></section>

  <section class="s-horeca"><div class="wrap s-horeca-grid">
    <div>
      <p class="s-eyebrow s-eyebrow-gold">Per ristoranti, pizzerie e gastronomie</p>
      <h2>Il tuo listino riservato, sempre in tasca</h2>
      <p class="s-lead">${esc(s.site_horeca_text)}</p>
      <ul class="s-ticks">
        <li>${ICON.check}Prezzi e formati concordati con te</li>
        <li>${ICON.check}Ordini in un minuto, anche di notte</li>
        <li>${ICON.check}Data di consegna secondo il tuo giro</li>
        <li>${ICON.check}Notifica quando l'ordine parte e arriva</li>
        <li>${ICON.check}"Ordina di nuovo" con un tocco</li>
      </ul>
      <div class="s-actions"><a class="s-btn s-btn-gold s-btn-lg" href="/ristorazione#richiesta">Richiedi l'accesso ${ICON.arrow}</a><a class="s-btn s-btn-ghost-light s-btn-lg" href="/area-clienti/">Sono già cliente</a></div>
    </div>
    ${appMockup(s, featured)}
  </div></section>

  <section class="s-section s-about"><div class="wrap s-about-grid">
    <div class="s-about-art">${pastaArt('spiga', 's-about-svg')}</div>
    <div><p class="s-eyebrow">${esc(s.site_about_title)}</p><h2>Grano, acqua, bronzo e tempo</h2>${paras(String(s.site_about_text).split(/\n\s*\n/)[0])}
      <a class="s-link" href="/pastificio">La nostra storia ${ICON.arrow}</a></div>
  </div></section>

  <section class="s-band"><div class="wrap s-band-in">
    <div><h2>Vuoi provare la nostra pasta in cucina?</h2><p>Ti portiamo una campionatura dei formati che usi di più.</p></div>
    <div class="s-actions"><a class="s-btn s-btn-dark s-btn-lg" href="/contatti#richiesta">Scrivici</a>${s.company_phone ? `<a class="s-btn s-btn-line s-btn-lg" href="${telHref(s.company_phone)}">${ICON.phone} ${esc(s.company_phone)}</a>` : ''}</div>
  </div></section>`;
  return { title: '', path: '/', body };
}

async function catalog(env, s) {
  const { cats, prods } = await loadCatalog(env);
  const uncategorized = prods.filter(p => !p.category_id);
  const groups = [...cats.map(c => ({ id: `c${c.id}`, name: c.name, items: prods.filter(p => p.category_id === c.id) })),
    ...(uncategorized.length ? [{ id: 'altri', name: 'Altri prodotti', items: uncategorized }] : [])];
  const body = `
  <section class="s-pagehead"><div class="wrap">
    <p class="s-eyebrow">Catalogo</p><h1>I nostri formati</h1>
    <p class="s-lead">${prods.length} prodotti tra pasta secca trafilata al bronzo, specialità regionali e pasta fresca preparata su ordinazione.
      ${s.site_show_prices === '1' ? 'Prezzi di listino IVA esclusa: ai clienti Ho.Re.Ca. riserviamo condizioni dedicate.' : 'I prezzi sono riservati ai clienti: richiedi il listino per il tuo locale.'}</p>
    <nav class="s-chips" aria-label="Categorie">${groups.map(g => `<a href="#${g.id}">${esc(g.name)}</a>`).join('')}</nav>
  </div></section>
  ${groups.map(g => `<section class="s-section s-cat" id="${g.id}"><div class="wrap"><h2>${esc(g.name)}</h2><div class="s-grid">${g.items.map(p => productCard(p, s)).join('')}</div></div></section>`).join('')}
  <section class="s-band"><div class="wrap s-band-in"><div><h2>Ti serve un formato che non vedi?</h2><p>Lavoriamo anche su richiesta per la ristorazione: dicci cosa cerchi.</p></div>
    <div class="s-actions"><a class="s-btn s-btn-dark s-btn-lg" href="/ristorazione#richiesta">Richiedi il listino</a></div></div></section>`;
  return {
    title: 'I nostri formati', path: '/prodotti', body,
    description: `Catalogo ${s.company_name}: paccheri, spaghetti, fusilli al ferretto, orecchiette e pasta fresca su ordinazione per ristoranti e gastronomie.`,
  };
}

async function product(env, s, id, origin) {
  const { prods } = await loadCatalog(env);
  const p = prods.find(x => x.id === id);
  if (!p) return null;
  const related = prods.filter(x => x.category_id === p.category_id && x.id !== p.id).slice(0, 4);
  const rows = [['Formato', p.pack], ['Vendita a', p.unit], ['Tempo di cottura', p.cooking_time], ['Allergeni', p.allergens], ['Codice', p.sku]].filter(r => r[1]);
  const body = `
  <section class="s-section s-product"><div class="wrap">
    <nav class="s-crumbs" aria-label="Percorso"><a href="/prodotti">Prodotti</a>${p.category_name ? ` / <a href="/prodotti#c${p.category_id}">${esc(p.category_name)}</a>` : ''}</nav>
    <div class="s-product-grid">
      <div class="s-product-media${p.image ? ' has-img' : ''}">${p.image ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" width="800" height="600">` : pastaArt(p.name)}</div>
      <div>
        <h1>${esc(p.name)}</h1>
        ${p.pack ? `<p class="s-product-pack">${esc(p.pack)}</p>` : ''}
        ${p.description ? `<p class="s-lead">${esc(p.description)}</p>` : ''}
        ${s.site_show_prices === '1' ? `<p class="s-product-price">${euro(p.price)} <small>/ ${esc(p.unit)} · IVA esclusa</small></p>` : ''}
        <dl class="s-specs">${rows.map(([k, v]) => `<dt>${k}</dt><dd>${esc(v)}</dd>`).join('')}</dl>
        <div class="s-actions"><a class="s-btn s-btn-dark s-btn-lg" href="/ristorazione#richiesta">Richiedi il listino ${ICON.arrow}</a><a class="s-btn s-btn-line s-btn-lg" href="/area-clienti/">Ordina dall'area clienti</a></div>
      </div>
    </div>
  </div></section>
  ${related.length ? `<section class="s-section"><div class="wrap"><h2>Dalla stessa famiglia</h2><div class="s-grid">${related.map(r => productCard(r, s)).join('')}</div></div></section>` : ''}`;
  return {
    title: `${p.name}${p.pack ? ' ' + p.pack : ''}`, path: productPath(p), body,
    description: p.description || `${p.name} ${p.pack || ''} di ${s.company_name}.`,
    jsonld: {
      '@context': 'https://schema.org', '@type': 'Product', name: p.name, description: p.description || undefined, sku: p.sku || undefined,
      brand: { '@type': 'Brand', name: s.company_name }, image: p.image ? `${origin}${p.image.startsWith('/') ? p.image : ''}` : undefined,
    },
  };
}

function about(s) {
  const body = `
  <section class="s-pagehead"><div class="wrap"><p class="s-eyebrow">Chi siamo</p><h1>${esc(s.site_about_title)}</h1></div></section>
  <section class="s-section"><div class="wrap s-about-grid">
    <div class="s-prose">${paras(s.site_about_text)}</div>
    <div class="s-about-logo"><img src="/assets/brand/logo-1200.webp" width="600" height="361" alt="${esc(s.company_name)}" loading="lazy"></div>
  </div></section>
  <section class="s-section s-process"><div class="wrap">
    <p class="s-eyebrow">Come nasce la nostra pasta</p><h2>Cinque passaggi, nessuna scorciatoia</h2>
    <ol class="s-process-list">
      <li><span>01</span><b>La semola</b><p>Grano duro del Mezzogiorno, macinato in semola dal colore dorato.</p></li>
      <li><span>02</span><b>L'impasto</b><p>Semola e acqua fresca, lavorate a lungo e a bassa temperatura.</p></li>
      <li><span>03</span><b>Il bronzo</b><p>La trafilatura al bronzo rende la superficie ruvida e porosa.</p></li>
      <li><span>04</span><b>Il tempo</b><p>Essiccazione lenta, come una volta: la pasta tiene la cottura.</p></li>
      <li><span>05</span><b>La consegna</b><p>Confezionata e portata in cucina con il nostro furgone.</p></li>
    </ol>
  </div></section>
  <section class="s-band"><div class="wrap s-band-in"><div><h2>Vieni a trovarci o chiedi una campionatura</h2></div>
    <div class="s-actions"><a class="s-btn s-btn-dark s-btn-lg" href="/contatti">Contatti</a></div></div></section>`;
  return { title: s.site_about_title, path: '/pastificio', body, description: String(s.site_about_text).slice(0, 160) };
}

async function horeca(env, s) {
  const [{ results: zones }, { prods }] = await Promise.all([env.DB.prepare('SELECT * FROM zones ORDER BY sort, name').all(), loadCatalog(env)]);
  const min = Number(s.min_order || 0);
  const body = `
  <section class="s-horeca s-horeca-top"><div class="wrap s-horeca-grid">
    <div><p class="s-eyebrow s-eyebrow-gold">Ho.Re.Ca.</p><h1>Ordina la pasta per il tuo locale in un minuto</h1>
      <p class="s-lead">${esc(s.site_horeca_text)}</p>
      <div class="s-actions"><a class="s-btn s-btn-gold s-btn-lg" href="#richiesta">Richiedi l'accesso ${ICON.arrow}</a><a class="s-btn s-btn-ghost-light s-btn-lg" href="/area-clienti/">Sono già cliente</a></div></div>
    ${appMockup(s, [...prods.filter(p => p.featured), ...prods.filter(p => !p.featured)])}
  </div></section>
  <section class="s-section"><div class="wrap">
    <p class="s-eyebrow">Come funziona</p><h2>Tre passi e sei operativo</h2>${STEPS}
  </div></section>
  <section class="s-section s-features"><div class="wrap">
    <h2>Pensato per chi lavora in cucina</h2>
    <div class="s-feature-grid">
      <div><b>I tuoi prezzi</b><p>Listino personalizzato, sconti e offerte riservate: vedi esattamente quanto spendi, IVA per aliquota inclusa.</p></div>
      <div><b>"I soliti" e preferiti</b><p>Salva i formati che ordini sempre e ripeti l'ultimo ordine con un tocco.</p></div>
      <div><b>Consegna nel tuo giro</b><p>L'app ti propone solo le date disponibili per la tua zona e ti ricorda l'orario limite.</p></div>
      <div><b>Notifiche in tempo reale</b><p>Ti avvisiamo quando l'ordine è confermato, in preparazione e in consegna.</p></div>
      <div><b>Più persone, un locale</b><p>Cuoco, titolare e responsabile acquisti possono avere ciascuno il proprio accesso.</p></div>
      <div><b>Storico e documenti</b><p>Tutti i tuoi ordini in un posto, con stato, totale e riferimenti di fattura e DDT.</p></div>
    </div>
  </div></section>
  <section class="s-section"><div class="wrap">
    <p class="s-eyebrow">Consegne</p><h2>Dove e quando consegniamo</h2>
    ${min ? `<p class="s-lead">Ordine minimo ${euro(min)} IVA esclusa.</p>` : ''}
    ${zonesTable(zones)}
  </div></section>
  <section class="s-section s-form-section" id="richiesta"><div class="wrap s-form-wrap">
    <div><p class="s-eyebrow">Diventa cliente</p><h2>Richiedi il listino per il tuo locale</h2>
      <p>Ti ricontattiamo entro un giorno lavorativo. Nessun impegno: prima ti facciamo assaggiare la pasta.</p>
      <ul class="s-contact-list">${contactItems(s)}</ul></div>
    ${leadForm(s)}
  </div></section>`;
  return { title: 'Per la ristorazione', path: '/ristorazione', body, description: `Listino riservato e ordini online per ristoranti, pizzerie e gastronomie: ${s.company_name} consegna la sua pasta direttamente nel tuo locale.` };
}

function contacts(s) {
  const map = s.company_address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.company_address)}` : null;
  const body = `
  <section class="s-pagehead"><div class="wrap"><p class="s-eyebrow">Contatti</p><h1>Parliamo della tua cucina</h1>
    <p class="s-lead">Per ordini, campionature o informazioni sui formati: scrivici o chiamaci.</p></div></section>
  <section class="s-section s-form-section" id="richiesta"><div class="wrap s-form-wrap">
    <div><ul class="s-contact-list s-contact-big">${contactItems(s)}</ul>
      ${map ? `<a class="s-btn s-btn-line" href="${map}" target="_blank" rel="noopener">${ICON.pin} Apri su Google Maps</a>` : ''}
      <p class="s-muted" style="margin-top:1.5rem">Sei già cliente? Gli ordini si fanno dall'<a href="/area-clienti/">area clienti</a>.</p></div>
    ${leadForm(s)}
  </div></section>`;
  return { title: 'Contatti', path: '/contatti', body, description: `Contatta ${s.company_name}: ordini, campionature e listino per la ristorazione.` };
}

function privacy(s) {
  const who = [s.company_name, s.company_address, s.company_vat && `P.IVA ${s.company_vat}`, s.company_email].filter(Boolean).map(esc).join(', ');
  const body = `<section class="s-pagehead"><div class="wrap"><h1>Informativa privacy</h1></div></section>
  <section class="s-section"><div class="wrap s-prose">
    <p><b>Titolare del trattamento:</b> ${who}.</p>
    <p><b>Dati raccolti:</b> i dati che inserisci nel modulo di richiesta (nome del locale, referente, telefono, email, città, partita IVA, messaggio) e, per i clienti con accesso all'area riservata, i dati necessari a gestire gli ordini e le consegne.</p>
    <p><b>Finalità e base giuridica:</b> ricontattarti e gestire il rapporto commerciale su tua richiesta (art. 6.1.b GDPR); adempiere agli obblighi fiscali e contabili (art. 6.1.c).</p>
    <p><b>Conservazione:</b> le richieste non seguite da un rapporto commerciale vengono cancellate entro 12 mesi; i dati di ordini e fatturazione per il tempo previsto dalla legge.</p>
    <p><b>Destinatari:</b> fornitori tecnici che ospitano il sito e il database (Cloudflare) e il servizio di invio email, nominati responsabili del trattamento. I dati non vengono venduti né usati per pubblicità.</p>
    <p><b>Cookie:</b> il sito non usa cookie di profilazione. L'area clienti usa un cookie tecnico per mantenere l'accesso.</p>
    <p><b>I tuoi diritti:</b> puoi chiedere in qualsiasi momento accesso, rettifica o cancellazione dei tuoi dati scrivendo ${s.company_email ? `a <a href="mailto:${esc(s.company_email)}">${esc(s.company_email)}</a>` : 'al titolare'}, e proporre reclamo al Garante per la protezione dei dati personali.</p>
  </div></section>`;
  return { title: 'Privacy', path: '/privacy', body };
}

function notFound(s) {
  return { title: 'Pagina non trovata', path: '/404', status: 404, body: `<section class="s-pagehead s-404"><div class="wrap">${pastaArt('spaghetti', 's-404-art')}<h1>Questa pagina è scotta</h1>
    <p class="s-lead">Non troviamo quello che cerchi. Riparti dal catalogo o dalla home.</p>
    <div class="s-actions"><a class="s-btn s-btn-dark s-btn-lg" href="/prodotti">I nostri formati</a><a class="s-btn s-btn-line s-btn-lg" href="/">Home</a></div></div></section>` };
}

// ---------- router ----------
export async function handleSite(request, env) {
  const url = new URL(request.url);
  let path = url.pathname.replace(/\/+$/, '') || '/';
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response('Metodo non consentito', { status: 405 });
  // vecchi link all'area clienti senza la barra finale
  if (path === '/area-clienti' || path === '/admin') return Response.redirect(`${url.origin}${path}/${url.hash}`, 301);
  if (url.pathname !== '/' && url.pathname.endsWith('/')) return Response.redirect(`${url.origin}${path}${url.search}`, 301);

  await ensureSchema(env);
  const s = await getSettings(env);
  const origin = (env.APP_URL || url.origin).replace(/\/$/, '');

  if (path === '/robots.txt') return new Response(`User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /area-clienti/\nDisallow: /api/\nSitemap: ${origin}/sitemap.xml\n`, { headers: { 'content-type': 'text/plain; charset=utf-8' } });
  if (path === '/sitemap.xml') {
    const { prods } = await loadCatalog(env);
    const urls = ['/', '/prodotti', '/pastificio', '/ristorazione', '/contatti', ...prods.map(productPath)];
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${esc(origin + u)}</loc></url>`).join('')}</urlset>`, { headers: { 'content-type': 'application/xml; charset=utf-8' } });
  }
  if (path === '/manifest.webmanifest') return Response.redirect(`${url.origin}/area-clienti/manifest.webmanifest`, 301);

  let page;
  if (path === '/') page = await home(env, s);
  else if (path === '/prodotti') page = await catalog(env, s);
  else if (path.startsWith('/prodotti/')) {
    const id = Number(path.slice('/prodotti/'.length).split('-')[0]);
    page = id ? await product(env, s, id, origin) : null;
    if (page && page.path !== path) return Response.redirect(`${url.origin}${page.path}`, 301);
  }
  else if (path === '/pastificio' || path === '/chi-siamo') page = about(s);
  else if (path === '/ristorazione' || path === '/horeca') page = await horeca(env, s);
  else if (path === '/contatti') page = contacts(s);
  else if (path === '/privacy') page = privacy(s);
  page ||= notFound(s);
  const html = layout(s, { ...page, origin });
  return new Response(request.method === 'HEAD' ? null : html, {
    status: page.status || 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=60', 'x-content-type-options': 'nosniff', 'referrer-policy': 'strict-origin-when-cross-origin' },
  });
}


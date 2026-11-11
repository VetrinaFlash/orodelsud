// Richieste dal sito pubblico ("Diventa cliente") e loro gestione nel pannello.
import { json, readJson, fail, str, int, isEmail } from './util.js';
import { getSettings, notifyUsers, adminIds, appUrl } from './core.js';
import { sendEmail, emailLayout } from './email.js';

export const LEAD_KINDS = ['Ristorante', 'Pizzeria', 'Trattoria / osteria', 'Bar / bistrot', 'Gastronomia / negozio', 'Hotel / B&B', 'Catering', 'Altro'];
const LEAD_STATUS = ['nuova', 'contattata', 'convertita', 'scartata'];

export const siteApiRoutes = [
  ['POST', '/api/site/richiesta', async ({ env, request }) => {
    const b = await readJson(request);
    // campo trappola per i bot: invisibile alle persone
    if (b.website) return json({ ok: true });
    const ip = request.headers.get('cf-connecting-ip') || '';
    const recent = await env.DB.prepare("SELECT COUNT(*) AS n FROM leads WHERE ip = ? AND created_at > datetime('now', '-1 hour')").bind(ip).first();
    if (recent.n >= 5) fail(429, 'Hai già inviato diverse richieste: ti ricontattiamo noi a breve.');
    const f = {
      business_name: str(b.business_name, 150), kind: LEAD_KINDS.includes(b.kind) ? b.kind : null,
      contact_name: str(b.contact_name, 100), phone: str(b.phone, 40), email: str(b.email, 120),
      city: str(b.city, 80), vat: str(b.vat, 20), message: str(b.message, 1500),
    };
    if (!f.business_name) fail(400, 'Indica il nome del locale.');
    if (!f.contact_name) fail(400, 'Indica il nome del referente.');
    if (!f.phone && !f.email) fail(400, 'Lascia almeno un telefono o un\'email per ricontattarti.');
    if (f.email && !isEmail(f.email)) fail(400, 'L\'indirizzo email non sembra corretto.');
    if (!b.privacy) fail(400, 'Per inviare la richiesta serve il consenso al trattamento dei dati.');
    const r = await env.DB.prepare(`INSERT INTO leads (business_name, kind, contact_name, phone, email, city, vat, message, ip)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?) RETURNING id`)
      .bind(f.business_name, f.kind, f.contact_name, f.phone, f.email, f.city, f.vat, f.message, ip).first();

    const settings = await getSettings(env);
    const url = `/admin/#/richieste?id=${r.id}`;
    const summary = [f.kind, f.city].filter(Boolean).join(' · ');
    const work = Promise.all([
      notifyUsers(env, await adminIds(env), {
        title: `Nuova richiesta dal sito: ${f.business_name}`,
        body: `${summary ? summary + ' — ' : ''}${f.contact_name}${f.phone ? ' · ' + f.phone : ''}`, url, tag: `lead-${r.id}`,
      }),
      (async () => {
        const to = String(settings.order_notify_emails || settings.company_email || '').split(/[\s,;]+/).filter(Boolean);
        if (!to.length) return;
        await sendEmail(env, {
          to, replyTo: f.email || undefined,
          subject: `Richiesta listino dal sito · ${f.business_name}`,
          html: emailLayout({
            company: settings.company_name, title: `${f.business_name} vuole diventare cliente`,
            intro: f.message || 'Nessun messaggio.',
            rows: [['Tipo di locale', f.kind || '—'], ['Referente', f.contact_name], ['Telefono', f.phone || '—'], ['Email', f.email || '—'], ['Città', f.city || '—'], ['P.IVA', f.vat || '—']],
            button: { url: `${appUrl(env, request)}${url}`, label: 'Apri nel gestionale' },
          }),
        });
      })(),
    ]);
    return { response: json({ ok: true }), waitUntil: work };
  }],
];

export const siteAdminRoutes = [
  ['GET', '/api/admin/leads', async ({ env }) => {
    const { results } = await env.DB.prepare(`SELECT l.*, c.business_name AS customer_name FROM leads l
      LEFT JOIN customers c ON c.id = l.customer_id
      ORDER BY CASE l.status WHEN 'nuova' THEN 0 WHEN 'contattata' THEN 1 ELSE 2 END, l.created_at DESC LIMIT 500`).all();
    return json({ items: results.map(({ ip, ...l }) => l), kinds: LEAD_KINDS });
  }],
  ['PATCH', '/api/admin/leads/:id', async ({ env, request, params }) => {
    const b = await readJson(request);
    const sets = [], args = [];
    if ('status' in b) {
      if (!LEAD_STATUS.includes(b.status)) fail(400, 'Stato non valido.');
      sets.push('status = ?'); args.push(b.status);
    }
    if ('admin_notes' in b) { sets.push('admin_notes = ?'); args.push(str(b.admin_notes, 2000)); }
    if ('customer_id' in b) { sets.push('customer_id = ?'); args.push(b.customer_id ? int(b.customer_id) : null); }
    if (!sets.length) fail(400, 'Nessuna modifica.');
    await env.DB.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`).bind(...args, int(params.id)).run();
    return json({ ok: true });
  }],
  ['DELETE', '/api/admin/leads/:id', async ({ env, params }) => {
    await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(int(params.id)).run();
    return json({ ok: true });
  }],
];

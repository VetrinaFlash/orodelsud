// Worker: /api/* → gestionale, pagine del sito generate dal database, tutto il resto sono file statici
// (area clienti su /area-clienti/, pannello su /admin/), serviti direttamente da Cloudflare.
import { handleApi, runReminders } from './api.js';
import { handleSite } from './site.js';

const withDb = env => ({ ...env, DB: env.DB || env.db, IMAGES: env.IMAGES || env.images });

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith('/api/')) {
      return handleApi({ request, env, waitUntil: p => ctx.waitUntil(p) });
    }
    // i file statici sono già serviti da Cloudflare prima di arrivare qui: restano le pagine del sito
    try {
      return await handleSite(request, withDb(env));
    } catch (e) {
      console.error(e);
      return new Response('Il sito è momentaneamente non disponibile. Riprova tra qualche istante.', { status: 503, headers: { 'content-type': 'text/plain; charset=utf-8' } });
    }
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runReminders(withDb(env)).then(n => console.log(`promemoria inviati: ${n}`)));
  },
};

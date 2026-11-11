// Sito pubblico: invio del modulo "Richiedi il listino" e chiusura del menu mobile.
(() => {
  const form = document.getElementById('richiesta-form');
  if (form) {
    const msg = form.querySelector('.s-form-msg');
    const btn = form.querySelector('button[type=submit]');
    form.addEventListener('submit', async e => {
      e.preventDefault();
      msg.className = 's-form-msg';
      msg.textContent = '';
      form.querySelectorAll('[aria-invalid]').forEach(el => el.removeAttribute('aria-invalid'));
      const data = Object.fromEntries(new FormData(form));
      data.privacy = form.privacy.checked;
      const bad = [];
      if (!data.business_name.trim()) bad.push(form.business_name);
      if (!data.contact_name.trim()) bad.push(form.contact_name);
      if (!data.phone.trim() && !data.email.trim()) bad.push(form.phone, form.email);
      if (bad.length) {
        bad.forEach(el => el.setAttribute('aria-invalid', 'true'));
        bad[0].focus();
        msg.className = 's-form-msg err';
        msg.textContent = !data.phone.trim() && !data.email.trim() && data.business_name && data.contact_name
          ? 'Lascia almeno un telefono o un\'email per ricontattarti.' : 'Compila i campi obbligatori evidenziati.';
        return;
      }
      if (!data.privacy) { msg.className = 's-form-msg err'; msg.textContent = 'Serve il consenso al trattamento dei dati.'; form.privacy.focus(); return; }
      btn.disabled = true;
      try {
        const res = await fetch('/api/site/richiesta', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
        const out = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(out.error || 'Invio non riuscito, riprova.');
        form.classList.add('sent');
        form.innerHTML = `<h3>Grazie, ${String(data.contact_name).split(' ')[0].replace(/[<>&"]/g, '')}!</h3>
          <p>Abbiamo ricevuto la richiesta per <b>${String(data.business_name).replace(/[<>&"]/g, '')}</b>. Ti ricontattiamo entro un giorno lavorativo.</p>`;
      } catch (err) {
        msg.className = 's-form-msg err';
        msg.textContent = err.message === 'Failed to fetch' ? 'Connessione assente: controlla la rete e riprova.' : err.message;
        btn.disabled = false;
      }
    });
  }
  // chiude il menu mobile quando si sceglie una voce
  document.querySelectorAll('.s-burger nav a').forEach(a => a.addEventListener('click', () => a.closest('details').removeAttribute('open')));
})();

/* Digits Studio — Interactive Project Scope & Budget Estimator */
(() => {
  const root = document.getElementById('scope-estimator');
  if (!root) return;

  const isAr = document.documentElement.lang === 'ar';
  const state = { type: 'website', bilingual: true, addons: new Set() };

  const base = {
    brand: { en: 'Brand Identity Sprint', ar: 'تأسيس الهوية البصرية', weeks: [2, 3], cost: [1200, 2200], services: 'Branding' },
    website: { en: 'Custom Bilingual Website', ar: 'موقع إلكتروني مخصص', weeks: [3, 5], cost: [1800, 3500], services: 'Website' },
    ecommerce: { en: 'D2C Store / Booking Engine', ar: 'متجر إلكتروني أو نظام حجز', weeks: [4, 7], cost: [2800, 5200], services: 'Website,Marketing' },
    portal: { en: 'SaaS / Custom Web Portal', ar: 'منصة ويب أو بوابة أعمال', weeks: [5, 8], cost: [3500, 7000], services: 'Website' }
  };

  function render() {
    const b = base[state.type];
    let minW = b.weeks[0], maxW = b.weeks[1];
    let minC = b.cost[0], maxC = b.cost[1];
    if (state.bilingual) { minW += 1; maxW += 1; minC += 300; maxC += 600; }
    if (state.addons.has('seo')) { minC += 400; maxC += 800; }
    if (state.addons.has('social')) { minC += 350; maxC += 700; }

    const titleEl = root.querySelector('[data-est-title]');
    const timeEl = root.querySelector('[data-est-time]');
    const costEl = root.querySelector('[data-est-cost]');
    const ctaEl = root.querySelector('[data-est-cta]');

    if (titleEl) titleEl.textContent = isAr ? b.ar : b.en;
    if (timeEl) timeEl.textContent = isAr ? `${minW}–${maxW} أسابيع` : `${minW}–${maxW} weeks`;
    if (costEl) costEl.textContent = `$${minC.toLocaleString()}–$${maxC.toLocaleString()} USD`;
    if (ctaEl) {
      const target = isAr ? '/ar/contact' : '/contact';
      ctaEl.href = `${target}?service=${encodeURIComponent(b.services)}`;
    }
  }

  root.querySelectorAll('[data-est-type]').forEach(btn => {
    btn.addEventListener('click', () => {
      state.type = btn.dataset.estType;
      root.querySelectorAll('[data-est-type]').forEach(o => o.classList.toggle('is-selected', o === btn));
      render();
    });
  });

  root.querySelector('[data-est-bilingual]')?.addEventListener('change', e => {
    state.bilingual = e.target.checked;
    render();
  });

  root.querySelectorAll('[data-est-addon]').forEach(cb => {
    cb.addEventListener('change', () => {
      if (cb.checked) state.addons.add(cb.dataset.estAddon);
      else state.addons.delete(cb.dataset.estAddon);
      render();
    });
  });

  render();
})();

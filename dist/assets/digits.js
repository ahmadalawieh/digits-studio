/* Digits Studio — Unified Modular Runtime (digits.js) */
(() => {
  // 1. Mobile Navigation Drawer
  const menuBtn = document.querySelector('.menu-btn');
  const drawer = document.getElementById('mobile-menu');
  const closeDrawer = () => {
    if (!menuBtn || !drawer) return;
    drawer.hidden = true;
    menuBtn.setAttribute('aria-expanded', 'false');
  };
  menuBtn?.addEventListener('click', () => {
    const open = menuBtn.getAttribute('aria-expanded') !== 'true';
    menuBtn.setAttribute('aria-expanded', String(open));
    drawer.hidden = !open;
  });
  drawer?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDrawer(); });

  // 2. Embedded Live Demo Switcher
  const demoFrame = document.getElementById('live-demo-frame');
  const demoExt = document.getElementById('live-demo-ext');
  document.querySelectorAll('[data-demo-src]').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('[data-demo-src]').forEach(t => t.classList.remove('is-active'));
      tab.classList.add('is-active');
      if (demoFrame) demoFrame.src = tab.dataset.demoSrc;
      if (demoExt) demoExt.href = tab.dataset.demoSrc;
    });
  });

  // 3. Project Category Filter
  const filterBtns = document.querySelectorAll('[data-project-filter]');
  const cards = document.querySelectorAll('[data-project-card]');
  const statusEl = document.getElementById('project-filter-status');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.projectFilter;
      filterBtns.forEach(b => b.setAttribute('aria-pressed', String(b === btn)));
      let count = 0;
      cards.forEach(card => {
        const show = cat === 'all' || (card.dataset.services || '').split(' ').includes(cat);
        card.hidden = !show;
        if (show) count++;
      });
      if (statusEl) {
        const isAr = document.documentElement.lang === 'ar';
        statusEl.textContent = isAr ? `عرض ${count} من المشاريع.` : `Showing ${count} projects.`;
      }
    });
  });

  // 4. Interactive Scope & Budget Estimator
  const estRoot = document.getElementById('scope-estimator');
  if (estRoot) {
    const isAr = document.documentElement.lang === 'ar';
    const state = { type: 'website', bilingual: true, addons: new Set() };
    const tiers = {
      brand: { en: 'Brand Identity Sprint', ar: 'تأسيس الهوية البصرية', w: [2, 3], c: [1200, 2200], s: 'Branding' },
      website: { en: 'Custom Bilingual Website', ar: 'موقع إلكتروني مخصص', w: [3, 5], c: [1800, 3500], s: 'Website' },
      ecommerce: { en: 'D2C Store / Booking Engine', ar: 'متجر إلكتروني أو نظام حجز', w: [4, 7], c: [2800, 5200], s: 'Website,Marketing' },
      portal: { en: 'SaaS / Custom Web Portal', ar: 'منصة ويب أو بوابة أعمال', w: [5, 8], c: [3500, 7000], s: 'Website' }
    };
    const renderEst = () => {
      const t = tiers[state.type];
      let w1 = t.w[0], w2 = t.w[1], c1 = t.c[0], c2 = t.c[1];
      if (state.bilingual) { w1++; w2++; c1 += 300; c2 += 600; }
      if (state.addons.has('seo')) { c1 += 400; c2 += 800; }
      if (state.addons.has('social')) { c1 += 350; c2 += 700; }
      estRoot.querySelector('[data-est-title]').textContent = isAr ? t.ar : t.en;
      estRoot.querySelector('[data-est-time]').textContent = isAr ? `${w1}–${w2} أسابيع` : `${w1}–${w2} weeks`;
      estRoot.querySelector('[data-est-cost]').textContent = `$${c1.toLocaleString()}–$${c2.toLocaleString()} USD`;
      estRoot.querySelector('[data-est-cta]').href = `${isAr ? '/ar/contact' : '/contact'}?service=${encodeURIComponent(t.s)}`;
    };
    estRoot.querySelectorAll('[data-est-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.type = btn.dataset.estType;
        estRoot.querySelectorAll('[data-est-type]').forEach(b => b.classList.toggle('is-selected', b === btn));
        renderEst();
      });
    });
    estRoot.querySelector('[data-est-bilingual]')?.addEventListener('change', e => { state.bilingual = e.target.checked; renderEst(); });
    estRoot.querySelectorAll('[data-est-addon]').forEach(cb => {
      cb.addEventListener('change', () => { cb.checked ? state.addons.add(cb.dataset.estAddon) : state.addons.delete(cb.dataset.estAddon); renderEst(); });
    });
    renderEst();
  }

  // 5. Guided Inquiry Form + ?service= Pre-Selection + Direct API Delivery
  const form = document.getElementById('inquiry-form');
  if (form) {
    const pre = new URLSearchParams(location.search).get('service');
    if (pre) {
      const wanted = pre.split(',').map(s => s.trim().toLowerCase());
      form.querySelectorAll('input[name="service"]').forEach(cb => {
        if (wanted.includes(cb.value.toLowerCase())) cb.checked = true;
      });
    }
    form.addEventListener('submit', async e => {
      e.preventDefault();
      if (!form.reportValidity()) return;
      const d = new FormData(form);
      const isAr = document.documentElement.lang === 'ar';
      const services = d.getAll('service');
      const payload = {
        name: String(d.get('name') || '').trim(),
        email: String(d.get('email') || '').trim(),
        business: String(d.get('business') || '').trim(),
        services,
        budget: String(d.get('budget') || ''),
        timing: String(d.get('timing') || ''),
        message: String(d.get('message') || '').trim(),
        language: isAr ? 'ar' : 'en',
        website_url: String(d.get('website_url') || '')
      };
      const text = isAr
        ? `مرحباً أحمد،\nالاسم: ${payload.name}\nالبريد: ${payload.email}\nالخدمات: ${services.join('، ') || 'غير محدد'}\nالميزانية: ${payload.budget || 'للنقاش'}\n\n${payload.message}`
        : `Hi Ahmad,\nName: ${payload.name}\nEmail: ${payload.email}\nServices: ${services.join(', ') || 'To discuss'}\nBudget: ${payload.budget || 'To discuss'}\n\n${payload.message}`;

      document.getElementById('inquiry-preview').textContent = text;
      document.getElementById('inquiry-whatsapp').href = 'https://wa.me/96170332361?text=' + encodeURIComponent(text);
      document.getElementById('inquiry-email').href = 'mailto:hello@digitsstudio.online?subject=' + encodeURIComponent('Digits Studio Inquiry') + '&body=' + encodeURIComponent(text);
      const result = document.getElementById('inquiry-result');
      result.hidden = false;

      const status = document.getElementById('inquiry-delivery-status');
      const directBtn = document.getElementById('inquiry-send-direct');
      if (directBtn) {
        directBtn.hidden = false;
        directBtn.onclick = async () => {
          directBtn.disabled = true;
          status.textContent = isAr ? 'جارٍ الإرسال...' : 'Sending...';
          try {
            const res = await fetch('/api/inquiry', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            status.textContent = res.ok
              ? (isAr ? 'تم استلام رسالتك بنجاح! سيرد أحمد خلال 24 ساعة.' : 'Sent! Ahmad will reply within 24 hours.')
              : (isAr ? 'تعذّر الإرسال المباشر — استخدم واتساب أو البريد.' : 'Direct send unavailable — please use WhatsApp or Email above.');
          } catch {
            status.textContent = isAr ? 'تعذّر الإرسال المباشر — استخدم واتساب أو البريد.' : 'Direct send unavailable — please use WhatsApp or Email above.';
          }
          directBtn.disabled = false;
        };
      }
      result.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    });
  }
})();

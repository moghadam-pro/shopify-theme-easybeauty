/* EasyBeauty theme — vanilla JS, no build step, no framework. */
(() => {
  'use strict';

  const settings = JSON.parse(document.getElementById('theme-settings').textContent);

  /* ---------- helpers ---------- */
  function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
  function qsa(sel, ctx) { return Array.from((ctx || document).querySelectorAll(sel)); }
  function formatWithDelimiters(cents, precision, thousands, decimal) {
    precision = isNaN(precision) ? 2 : precision;
    thousands = thousands === undefined ? ',' : thousands;
    decimal = decimal === undefined ? '.' : decimal;
    if (isNaN(cents)) return '0';
    const fixed = (cents / 100).toFixed(precision);
    const parts = fixed.split('.');
    const dollars = parts[0].replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1' + thousands);
    const centsPart = parts[1] ? decimal + parts[1] : '';
    return dollars + centsPart;
  }
  /* Mirrors Shopify's documented Shopify.formatMoney helper: supports every
     token shop.money_format can use, not just the plain {{ amount }} case. */
  function formatMoney(cents, format) {
    format = format || settings.moneyFormat || '${{ amount }}';
    const placeholderRegex = /\{\{\s*(\w+)\s*\}\}/;
    const match = format.match(placeholderRegex);
    const token = match ? match[1] : 'amount';
    let value;
    switch (token) {
      case 'amount_no_decimals': value = formatWithDelimiters(cents, 0); break;
      case 'amount_with_comma_separator': value = formatWithDelimiters(cents, 2, '.', ','); break;
      case 'amount_no_decimals_with_comma_separator': value = formatWithDelimiters(cents, 0, '.'); break;
      case 'amount_with_space_separator': value = formatWithDelimiters(cents, 2, ' ', ','); break;
      case 'amount_no_decimals_with_space_separator': value = formatWithDelimiters(cents, 0, ' '); break;
      case 'amount':
      default: value = formatWithDelimiters(cents, 2); break;
    }
    return match ? format.replace(placeholderRegex, value) : '$' + value;
  }
  function trapFocus(container) {
    const focusable = qsa('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', container);
    if (!focusable.length) return;
    focusable[0].focus();
  }

  /* ---------- cart drawer ---------- */
  const cartDrawer = qs('[data-cart-drawer]');

  function openCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.add('is-open');
    cartDrawer.setAttribute('aria-hidden', 'false');
    trapFocus(cartDrawer);
    document.body.style.overflow = 'hidden';
  }
  function closeCartDrawer() {
    if (!cartDrawer) return;
    cartDrawer.classList.remove('is-open');
    cartDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  async function refreshCartDrawer() {
    if (!cartDrawer) return;
    try {
      const res = await fetch('/?section_id=cart-drawer');
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const fresh = doc.querySelector('[data-cart-drawer]');
      if (fresh) cartDrawer.innerHTML = fresh.innerHTML;
    } catch (err) {
      console.error('[cart] failed to refresh drawer', err);
    }
    updateCartCount();
  }
  async function updateCartCount() {
    try {
      const res = await fetch('/cart.js');
      const cart = await res.json();
      qsa('[data-cart-count]').forEach((el) => {
        el.textContent = cart.item_count > 0 ? cart.item_count : '';
        el.hidden = cart.item_count === 0;
      });
    } catch (err) {
      console.error('[cart] failed to read cart', err);
    }
  }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-cart-drawer-open]')) {
      e.preventDefault();
      openCartDrawer();
    }
    if (e.target.closest('[data-cart-drawer-close]')) {
      closeCartDrawer();
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeCartDrawer();
  });

  /* Intercept product-form add-to-cart submissions for an AJAX add. */
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('form[data-product-form], form[data-quick-add]');
    if (!form) return;
    e.preventDefault();
    const submitBtn = qs('[type="submit"]', form);
    if (submitBtn) submitBtn.disabled = true;
    try {
      const formData = new FormData(form);
      if (formData.get('selling_plan') === '') formData.delete('selling_plan');
      Array.from(formData.keys()).filter((k) => k.indexOf('pack-') === 0).forEach((k) => formData.delete(k));
      const res = await fetch(settings.cartAddUrl, {
        method: 'POST',
        headers: { Accept: 'application/json' },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        const err = qs('[data-form-error]', form);
        if (err) { err.textContent = data.description || data.message; err.hidden = false; }
      } else {
        if (settings.cartType === 'page') {
          window.location.href = settings.cartUrl;
          return;
        }
        await refreshCartDrawer();
        openCartDrawer();
      }
    } catch (err) {
      console.error('[cart] add failed', err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  /* Cart line quantity +/- and remove, delegated (works inside the drawer and cart page). */
  document.addEventListener('click', async (e) => {
    const stepBtn = e.target.closest('[data-cart-qty-step]');
    if (stepBtn) {
      e.preventDefault();
      const wrapper = stepBtn.closest('[data-cart-line]');
      const input = qs('[data-cart-qty-input]', wrapper);
      const step = parseInt(stepBtn.getAttribute('data-cart-qty-step'), 10);
      const next = Math.max(0, parseInt(input.value || '0', 10) + step);
      await changeLine(wrapper.getAttribute('data-cart-line'), next);
    }
    const removeBtn = e.target.closest('[data-cart-remove]');
    if (removeBtn) {
      e.preventDefault();
      await changeLine(removeBtn.getAttribute('data-cart-remove'), 0);
    }
  });
  document.addEventListener('change', async (e) => {
    const input = e.target.closest('[data-cart-qty-input]');
    if (!input) return;
    const wrapper = input.closest('[data-cart-line]');
    await changeLine(wrapper.getAttribute('data-cart-line'), Math.max(0, parseInt(input.value || '0', 10)));
  });
  async function changeLine(key, quantity) {
    try {
      await fetch(settings.cartChangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: key, quantity })
      });
      if (qs('[data-cart-page]')) {
        window.location.reload();
      } else {
        await refreshCartDrawer();
      }
    } catch (err) {
      console.error('[cart] change failed', err);
    }
  }

  /* ---------- search drawer ---------- */
  const searchDrawer = qs('[data-search-drawer]');
  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-search-drawer-open]')) {
      e.preventDefault();
      searchDrawer && searchDrawer.classList.add('is-open');
      const input = searchDrawer && qs('input[type="search"]', searchDrawer);
      if (input) input.focus();
    }
    if (e.target.closest('[data-search-drawer-close]')) {
      searchDrawer && searchDrawer.classList.remove('is-open');
    }
  });

  /* ---------- mobile menu ---------- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-mobile-menu-toggle]');
    if (trigger) {
      const menu = qs('[data-mobile-menu]');
      if (menu) menu.classList.toggle('is-open');
    }
  });

  /* ---------- generic accordions (FAQ, product info) ---------- */
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-accordion-trigger]');
    if (!trigger) return;
    const item = trigger.closest('[data-accordion-item]');
    if (!item) return;
    const group = item.closest('[data-accordion-single]');
    if (group) {
      qsa('[data-accordion-item]', group).forEach((other) => {
        if (other !== item) other.classList.remove('is-open');
      });
    }
    item.classList.toggle('is-open');
  });

  /* ---------- newsletter forms (footer + section) ---------- */
  document.addEventListener('submit', async (e) => {
    const form = e.target.closest('[data-newsletter-form]');
    if (!form) return;
    e.preventDefault();
    const msg = qs('[data-form-message]', form.closest('[data-newsletter-wrapper]') || form.parentElement);
    try {
      const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
      if (msg) {
        msg.hidden = false;
        msg.textContent = res.ok ? (form.getAttribute('data-success-text') || 'Thank you for subscribing') : (form.getAttribute('data-error-text') || 'Something went wrong');
        msg.classList.toggle('form-message--success', res.ok);
        msg.classList.toggle('form-message--error', !res.ok);
      }
      if (res.ok) form.reset();
    } catch (err) {
      console.error('[newsletter] submit failed', err);
    }
  });

  /* ---------- product: variant selection, packs, sticky bar ----------
     Prices shown depend on the variant *and* the chosen pack: a quantity
     pack is qty × variant price less its display discount; a subscription
     pack uses the variant's selling-plan allocation price. The pack also
     sets the quantity / selling_plan fields that go to the cart. */
  qsa('[data-product-form]').forEach((form) => {
    const root = form.closest('[data-product-root]') || document;
    const productJsonEl = qs('[data-product-json]', root);
    if (!productJsonEl) return;
    let product;
    try { product = JSON.parse(productJsonEl.textContent); } catch (err) { return; }
    const packs = qsa('[data-pack]', form);
    const qtyInput = qs('[data-pack-quantity]', form);
    const planInput = qs('[data-pack-plan]', form);
    let variant = null;

    function selectedOptions() {
      return qsa('[data-option-input]:checked, [data-option-select]', form).map((el) => el.value);
    }
    function findVariant(options) {
      if (!options.length) return product.variants[0];
      return product.variants.find((v) => v.options.every((val, i) => val === options[i]));
    }
    function packPrice(v, pack) {
      const qty = parseInt(pack.getAttribute('data-qty'), 10) || 1;
      const plan = pack.getAttribute('data-plan');
      if (plan) {
        const alloc = (v.selling_plan_allocations || []).find((a) => String(a.selling_plan_id) === plan);
        return { price: (alloc ? alloc.price : v.price) * qty, full: v.price * qty, qty };
      }
      const discount = parseFloat(pack.getAttribute('data-discount')) || 0;
      return { price: Math.round(v.price * qty * (100 - discount) / 100), full: v.price * qty, qty };
    }
    function activePack() { return packs.find((p) => p.checked) || null; }

    function render() {
      const priceEl = qs('[data-product-price]', root);
      const compareEl = qs('[data-product-compare-price]', root);
      const unitEl = qs('[data-pack-unit]', root);
      const submitBtn = qs('[type="submit"]', form);
      const idInput = qs('[data-variant-id]', form);
      const setButtonLabel = (text) => {
        const label = submitBtn && qs('[data-add-label]', submitBtn);
        if (label) label.textContent = text; else if (submitBtn) submitBtn.textContent = text;
      };
      const stickyBtn = qs('[data-product-sticky] [type="submit"]', root);
      if (!variant) {
        if (submitBtn) { submitBtn.disabled = true; setButtonLabel(form.getAttribute('data-unavailable-text') || 'Unavailable'); }
        if (stickyBtn) stickyBtn.disabled = true;
        return;
      }
      const pack = activePack();
      const pp = pack ? packPrice(variant, pack) : {
        price: variant.price, qty: 1,
        full: variant.compare_at_price > variant.price ? variant.compare_at_price : variant.price
      };
      if (idInput) idInput.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(pp.price);
      if (compareEl) {
        compareEl.hidden = !(pp.full > pp.price);
        if (pp.full > pp.price) compareEl.textContent = formatMoney(pp.full);
      }
      if (unitEl && pack) unitEl.textContent = pp.qty > 1 ? formatMoney(Math.round(pp.price / pp.qty)) + ' ' + (unitEl.getAttribute('data-each') || 'each') : '';
      qsa('[data-add-price]', root).forEach((el) => { el.textContent = formatMoney(pp.price); });
      packs.forEach((p) => {
        const label = p.closest('.pack-option');
        const el = label && qs('[data-pack-price]', label);
        if (el) el.textContent = formatMoney(packPrice(variant, p).price);
      });
      if (pack) {
        if (qtyInput) qtyInput.value = pp.qty;
        if (planInput) planInput.value = pack.getAttribute('data-plan') || '';
      }
      const summary = qs('[data-sticky-summary]', root);
      if (summary) summary.textContent = [variant.title !== 'Default Title' ? variant.title : '', pack ? pack.getAttribute('data-title') : ''].filter(Boolean).join(' · ');
      if (submitBtn) {
        submitBtn.disabled = !variant.available;
        setButtonLabel(variant.available
          ? (form.getAttribute('data-add-text') || 'Add to bag')
          : (form.getAttribute('data-soldout-text') || 'Sold out'));
      }
      if (stickyBtn) stickyBtn.disabled = !variant.available;
    }

    form.addEventListener('change', (e) => {
      if (e.target.matches('[data-option-input], [data-option-select]')) {
        variant = findVariant(selectedOptions());
        if (variant && variant.featured_image) {
          const mainImg = qs('[data-product-main-image]', root);
          if (mainImg) { mainImg.removeAttribute('srcset'); mainImg.src = variant.featured_image.src; }
        }
      }
      render();
    });
    variant = findVariant(selectedOptions());
    render();

    /* Sticky add-to-bag bar: shown once the main add button has scrolled
       out of view above, hidden again near it or at the footer. */
    const sticky = qs('[data-product-sticky]', root);
    const mainAdd = qs('[data-product-add]', form);
    if (sticky && mainAdd && 'IntersectionObserver' in window) {
      new IntersectionObserver(([entry]) => {
        const show = !entry.isIntersecting && entry.boundingClientRect.top < 0;
        sticky.classList.toggle('is-visible', show);
        sticky.setAttribute('aria-hidden', String(!show));
        const btn = qs('button', sticky);
        if (btn) btn.tabIndex = show ? 0 : -1;
      }).observe(mainAdd);
    }
  });

  qsa('[data-gallery-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const root = thumb.closest('[data-product-root]');
      const mainImg = qs('[data-product-main-image]', root);
      qsa('[data-gallery-thumb]', root).forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (mainImg) { mainImg.removeAttribute('srcset'); mainImg.src = thumb.getAttribute('data-full-src') || thumb.src; }
    });
  });

  qsa('[data-quantity-selector]').forEach((wrap) => {
    const input = qs('input', wrap);
    wrap.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (!btn) return;
      const dir = btn.getAttribute('data-quantity-step');
      const min = parseInt(input.min || '1', 10);
      const next = Math.max(min, (parseInt(input.value || '1', 10)) + (dir === 'increase' ? 1 : -1));
      input.value = next;
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  });

  /* ---------- skin quiz ----------
     intro → one question at a time → result. Single-answer questions advance
     on tap; multi-answer ones (checkboxes) cap at data-max and use Next.
     Products are ranked by how many answer tags they carry. */
  qsa('[data-quiz]').forEach((quiz) => {
    const intro = qs('.quiz-intro', quiz);
    const stage = qs('[data-quiz-stage]', quiz);
    const result = qs('.quiz-result', quiz);
    const questions = qsa('.quiz-question', quiz);
    const progress = qs('[data-quiz-progress]', quiz);
    let current = 0;

    function scrollTop() {
      const top = quiz.getBoundingClientRect().top + window.scrollY - 80;
      if (window.scrollY > top) window.scrollTo({ top, behavior: 'smooth' });
    }
    function show(view) {
      intro.hidden = view !== 'intro';
      stage.hidden = view !== 'quiz';
      result.hidden = view !== 'result';
    }
    function goTo(i) {
      current = i;
      questions.forEach((q, j) => { q.hidden = j !== i; });
      if (progress) progress.style.width = (i / questions.length) * 100 + '%';
      show('quiz');
      const first = qs('input', questions[i]);
      if (first) first.focus({ preventScroll: true });
    }
    function answersOf(q) { return qsa('[data-quiz-input]:checked', q); }
    function next() {
      if (current < questions.length - 1) goTo(current + 1);
      else finish();
      scrollTop();
    }

    questions.forEach((q) => {
      const multi = q.getAttribute('data-multi') === 'true';
      const max = parseInt(q.getAttribute('data-max'), 10) || 2;
      const nextBtn = qs('[data-quiz-next]', q);
      q.addEventListener('change', (e) => {
        const input = e.target.closest('[data-quiz-input]');
        if (!input) return;
        if (multi) {
          const checked = answersOf(q);
          if (checked.length > max) input.checked = false;
          if (nextBtn) nextBtn.disabled = answersOf(q).length === 0;
        } else {
          setTimeout(next, 180);
        }
      });
      if (nextBtn) nextBtn.addEventListener('click', () => { if (answersOf(q).length) next(); });
      const back = qs('[data-quiz-back]', q);
      if (back) back.addEventListener('click', () => {
        if (current === 0) { show('intro'); } else { goTo(current - 1); }
        scrollTop();
      });
    });

    function finish() {
      const tags = [];
      const recap = qs('[data-quiz-recap]', quiz);
      if (recap) recap.innerHTML = '';
      questions.forEach((q) => {
        const picked = answersOf(q);
        picked.forEach((input) => { if (input.value) tags.push(input.value.toLowerCase()); });
        if (recap) {
          const cell = document.createElement('div');
          const dt = document.createElement('dt');
          const dd = document.createElement('dd');
          dt.textContent = (q.getAttribute('data-question') || '').replace(/\?$/, '');
          dd.textContent = picked.map((i) => i.getAttribute('data-label')).join(', ') || '—';
          cell.appendChild(dt); cell.appendChild(dd);
          recap.appendChild(cell);
        }
      });
      const tagWrap = qs('[data-quiz-tags]', quiz);
      if (tagWrap) {
        tagWrap.innerHTML = '';
        questions.slice(0, 3).forEach((q) => answersOf(q).slice(0, 1).forEach((input) => {
          const span = document.createElement('span');
          span.textContent = input.getAttribute('data-label');
          tagWrap.appendChild(span);
        }));
      }
      const grid = qs('[data-quiz-results]', quiz);
      const limit = parseInt(grid && grid.getAttribute('data-limit'), 10) || 3;
      const items = grid ? qsa('[data-quiz-product]', grid) : [];
      const ranked = items.map((el, index) => {
        const own = (el.getAttribute('data-tags') || '').split(',').map((t) => t.trim());
        const score = tags.reduce((n, t) => n + (own.indexOf(t) !== -1 ? 1 : 0), 0);
        return { el, score, index, ok: !el.hasAttribute('data-unavailable') };
      }).filter((r) => r.ok).sort((x, y) => y.score - x.score || x.index - y.index);
      const picks = ranked.slice(0, limit);
      items.forEach((el) => { el.hidden = true; });
      picks.forEach((r) => { r.el.hidden = false; grid.appendChild(r.el); });
      const total = picks.reduce((n, r) => n + (parseInt(r.el.getAttribute('data-price'), 10) || 0), 0);
      const totalEl = qs('[data-quiz-total]', quiz);
      if (totalEl) totalEl.textContent = formatMoney(total);
      quiz._picks = picks.map((r) => parseInt(r.el.getAttribute('data-variant-id'), 10)).filter(Boolean);
      if (progress) progress.style.width = '100%';
      show('result');
      syncSaved();
    }

    const start = qs('[data-quiz-start]', quiz);
    if (start) start.addEventListener('click', () => goTo(0));
    const restart = qs('[data-quiz-restart]', quiz);
    if (restart) restart.addEventListener('click', () => {
      qsa('[data-quiz-input]', quiz).forEach((i) => { i.checked = false; });
      qsa('[data-quiz-next]', quiz).forEach((b) => { b.disabled = true; });
      show('intro');
      scrollTop();
    });
    const add = qs('[data-quiz-add]', quiz);
    const error = qs('[data-quiz-error]', quiz);
    if (add) add.addEventListener('click', async () => {
      if (!quiz._picks || !quiz._picks.length) return;
      add.disabled = true;
      if (error) error.hidden = true;
      try {
        const res = await fetch(settings.cartAddUrl + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items: quiz._picks.map((id) => ({ id, quantity: 1 })) })
        });
        const data = await res.json();
        if (!res.ok) { if (error) { error.textContent = data.description || data.message; error.hidden = false; } return; }
        if (settings.cartType === 'page') { window.location.href = settings.cartUrl; return; }
        await refreshCartDrawer();
        openCartDrawer();
      } catch (err) {
        console.error('[quiz] add failed', err);
      } finally {
        add.disabled = false;
      }
    });
  });

  /* ---------- hero hotspots ----------
     Hover (or keyboard focus) opens a hotspot's card; it stays open while the
     pointer is anywhere on the dot or the card, and closes shortly after the
     pointer leaves both. Touch has no hover, so a tap toggles it instead. */
  const HOTSPOT_CLOSE_DELAY = 180;
  function setHotspot(hotspot, open) {
    clearTimeout(hotspot._closeTimer);
    hotspot.classList.toggle('is-open', open);
    const dot = qs('[data-hotspot-toggle]', hotspot);
    if (dot) dot.setAttribute('aria-expanded', String(open));
  }
  function openHotspot(hotspot) {
    qsa('[data-hotspot].is-open').forEach((h) => { if (h !== hotspot) setHotspot(h, false); });
    setHotspot(hotspot, true);
  }
  const canHover = window.matchMedia('(hover: hover)');
  qsa('[data-hotspot]').forEach((hotspot) => {
    hotspot.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') openHotspot(hotspot); });
    hotspot.addEventListener('pointerleave', (e) => {
      if (e.pointerType !== 'mouse') return;
      clearTimeout(hotspot._closeTimer);
      hotspot._closeTimer = setTimeout(() => setHotspot(hotspot, false), HOTSPOT_CLOSE_DELAY);
    });
    hotspot.addEventListener('focusin', () => openHotspot(hotspot));
    hotspot.addEventListener('focusout', (e) => { if (!hotspot.contains(e.relatedTarget)) setHotspot(hotspot, false); });
  });
  document.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-hotspot-toggle]');
    if (dot) {
      const hotspot = dot.closest('[data-hotspot]');
      /* With a mouse the card is already open from hovering; a click keeps it. */
      if (canHover.matches) openHotspot(hotspot);
      else if (hotspot.classList.contains('is-open')) setHotspot(hotspot, false);
      else openHotspot(hotspot);
      return;
    }
    if (!e.target.closest('[data-hotspot]')) qsa('[data-hotspot].is-open').forEach((h) => setHotspot(h, false));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') qsa('[data-hotspot].is-open').forEach((h) => setHotspot(h, false));
  });

  /* ---------- header mega menu (hover + keyboard) ---------- */
  const megaScrim = qs('[data-mega-scrim]');
  function closeAllMega() {
    qsa('[data-mega-panel].is-open').forEach((p) => p.classList.remove('is-open'));
    qsa('[data-mega-trigger]').forEach((t) => t.setAttribute('aria-expanded', 'false'));
    if (megaScrim) megaScrim.hidden = true;
  }
  qsa('[data-mega-trigger]').forEach((trigger) => {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId && document.getElementById(panelId);
    if (!panel) return;
    const nav = trigger.closest('[data-site-nav]');
    function open() {
      closeAllMega();
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
      if (megaScrim) megaScrim.hidden = false;
    }
    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('focus', open);
    trigger.addEventListener('click', (e) => {
      if (panel.classList.contains('is-open')) { closeAllMega(); } else { e.preventDefault(); open(); }
    });
    if (nav) nav.addEventListener('mouseleave', closeAllMega);
  });
  if (megaScrim) megaScrim.addEventListener('click', closeAllMega);
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAllMega(); });

  /* ---------- account dropdown ---------- */
  qsa('[data-account-menu]').forEach((root) => {
    const toggle = qs('[data-account-menu-toggle]', root);
    const panel = toggle && document.getElementById(toggle.getAttribute('aria-controls'));
    if (!panel) return;
    const setOpen = (open) => { panel.hidden = !open; toggle.setAttribute('aria-expanded', String(open)); };
    toggle.addEventListener('click', () => setOpen(panel.hidden));
    document.addEventListener('click', (e) => { if (!root.contains(e.target)) setOpen(false); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  });

  /* ---------- header shadow once the page scrolls ---------- */
  const siteHeader = qs('[data-site-header]');
  if (siteHeader) {
    const onScroll = () => siteHeader.classList.toggle('is-scrolled', window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      qsa('[data-mega-panel].is-open').forEach((p) => p.classList.remove('is-open'));
    }
  });

  /* ---------- product recommendations (lazy-loaded, per Shopify's recommendations endpoint) ---------- */
  qsa('[data-product-recommendations]').forEach(async (section) => {
    const url = section.getAttribute('data-url');
    if (!url) return;
    try {
      const res = await fetch(url);
      const html = await res.text();
      const doc = new DOMParser().parseFromString(html, 'text/html');
      const freshGrid = doc.querySelector('[data-product-recommendations-grid]');
      const grid = qs('[data-product-recommendations-grid]', section);
      if (freshGrid && grid && freshGrid.innerHTML.trim()) grid.innerHTML = freshGrid.innerHTML;
      else if (grid && !grid.innerHTML.trim()) section.hidden = true;
    } catch (err) {
      console.error('[recommendations] failed to load', err);
    }
  });

  /* ---------- category showcase: hover/focus swaps photo + note ---------- */
  qsa('[data-category-showcase]').forEach((root) => {
    const noteEl = qs('[data-category-note-target]', root);
    function activate(index) {
      qsa('[data-category-layer]', root).forEach((el) => el.classList.toggle('is-active', el.getAttribute('data-category-layer') === index));
      qsa('[data-category-link]', root).forEach((el) => {
        const on = el.getAttribute('data-category-link') === index;
        el.classList.toggle('is-active', on);
        if (on && noteEl) noteEl.textContent = el.getAttribute('data-category-note') || '';
      });
    }
    qsa('[data-category-link]', root).forEach((link) => {
      const index = link.getAttribute('data-category-link');
      link.addEventListener('mouseenter', () => activate(index));
      link.addEventListener('focus', () => activate(index));
    });
  });

  /* ---------- tabs ---------- */
  qsa('[data-tabs]').forEach((root) => {
    const tabs = qsa('[data-tab]', root);
    const panels = qsa('[data-tab-panel]', root);
    function select(i) {
      tabs.forEach((t, j) => t.setAttribute('aria-selected', String(i === j)));
      panels.forEach((p, j) => { p.hidden = i !== j; });
    }
    tabs.forEach((tab, i) => {
      tab.addEventListener('click', () => select(i));
      tab.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = (i + (e.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
        select(next);
        tabs[next].focus();
      });
    });
  });

  /* ---------- media carousel ("in use" reels) ----------
     One reel is active at a time: it grows (CSS) and plays. A video advances
     to the next reel when it ends, a photo after data-image-duration seconds,
     and the last reel loops back to the first. Playback runs only while the
     section is visible and never for prefers-reduced-motion. */
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  qsa('[data-reel]').forEach((root) => {
    const track = qs('[data-reel-track]', root);
    const items = qsa('[data-reel-item]', root);
    if (!track || !items.length) return;
    const imageMs = (parseFloat(root.getAttribute('data-image-duration')) || 5) * 1000;
    let active = Math.max(0, items.findIndex((it) => it.classList.contains('is-active')));
    let visible = false;
    let timer = null;
    let frame = null;

    const videoOf = (item) => qs('video', item);
    const barOf = (item) => qs('[data-reel-progress]', item);
    function setProgress(item, ratio) {
      const bar = barOf(item);
      if (bar) bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, ratio)) + ')';
    }
    function stop() {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
      items.forEach((item) => {
        item.classList.remove('is-playing');
        const video = videoOf(item);
        if (video) video.pause();
      });
    }
    function next() { activate((active + 1) % items.length, true); }
    function play() {
      stop();
      if (!visible || reduceMotion.matches) return;
      const item = items[active];
      const video = videoOf(item);
      item.classList.add('is-playing');
      if (video) {
        video.muted = true;
        video.play().catch(() => { timer = setTimeout(next, imageMs); });
        const tick = () => {
          if (video.duration) setProgress(item, video.currentTime / video.duration);
          frame = requestAnimationFrame(tick);
        };
        tick();
      } else {
        const started = performance.now();
        const tick = (now) => {
          setProgress(item, (now - started) / imageMs);
          frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        timer = setTimeout(next, imageMs);
      }
    }
    /* Bring the active reel into view inside the track only — never scroll
       the page — once its grow transition has settled. */
    function reveal(item) {
      if (track.scrollWidth <= track.clientWidth + 1) return;
      setTimeout(() => {
        const left = item.offsetLeft - (track.clientWidth - item.offsetWidth) / 2;
        track.scrollTo({ left: Math.max(0, left), behavior: reduceMotion.matches ? 'auto' : 'smooth' });
      }, 520);
    }
    function activate(index, autoplay) {
      const changed = index !== active;
      if (changed) {
        const prevVideo = videoOf(items[active]);
        if (prevVideo) { prevVideo.pause(); prevVideo.currentTime = 0; }
        setProgress(items[active], 0);
      }
      active = index;
      items.forEach((item, i) => item.classList.toggle('is-active', i === active));
      if (changed) reveal(items[active]);
      if (autoplay) play();
    }

    items.forEach((item, i) => {
      const video = videoOf(item);
      if (video) {
        video.loop = false;
        video.addEventListener('ended', () => { if (i === active) next(); });
      }
      const media = qs('[data-reel-media]', item);
      if (!media) return;
      media.addEventListener('click', () => {
        if (i !== active) { activate(i, true); return; }
        /* Clicking the playing reel pauses it; clicking again resumes. */
        if (item.classList.contains('is-playing')) stop(); else play();
      });
    });
    const prevBtn = qs('[data-reel-prev]', root);
    const nextBtn = qs('[data-reel-next]', root);
    if (prevBtn) prevBtn.addEventListener('click', () => activate((active - 1 + items.length) % items.length, true));
    if (nextBtn) nextBtn.addEventListener('click', () => activate((active + 1) % items.length, true));

    if ('IntersectionObserver' in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) play(); else stop();
        });
      }, { threshold: 0.35 }).observe(root);
    }
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stop(); else if (visible) play();
    });
  });

  /* ---------- bundle: live total + add every step in one request ---------- */
  qsa('[data-bundle]').forEach((root) => {
    const addBtn = qs('[data-bundle-add]', root);
    const totalEl = qs('[data-bundle-total]', root);
    const errorEl = qs('[data-bundle-error]', root);
    const inputs = qsa('[data-bundle-variant]', root);
    const discount = parseFloat(root.getAttribute('data-discount')) || 0;
    function priceOf(input) {
      const opt = input.tagName === 'SELECT' ? input.options[input.selectedIndex] : input;
      return parseInt(opt.getAttribute('data-price'), 10) || 0;
    }
    function refresh() {
      let total = 0;
      inputs.forEach((input) => {
        const price = priceOf(input);
        total += price;
        const row = input.closest('[data-bundle-row]');
        const priceEl = row && qs('[data-bundle-price]', row);
        if (priceEl) priceEl.textContent = formatMoney(price);
      });
      if (totalEl) totalEl.textContent = formatMoney(Math.round(total * (100 - discount) / 100));
    }
    inputs.forEach((input) => input.addEventListener('change', refresh));
    if (!addBtn) return;
    addBtn.addEventListener('click', async () => {
      addBtn.disabled = true;
      if (errorEl) errorEl.hidden = true;
      try {
        const items = inputs.map((input) => ({ id: parseInt(input.value, 10), quantity: 1 }));
        const res = await fetch(settings.cartAddUrl + '.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ items })
        });
        const data = await res.json();
        if (!res.ok) {
          if (errorEl) { errorEl.textContent = data.description || data.message; errorEl.hidden = false; }
          return;
        }
        if (settings.cartType === 'page') {
          window.location.href = settings.cartUrl;
          return;
        }
        await refreshCartDrawer();
        openCartDrawer();
      } catch (err) {
        console.error('[bundle] add failed', err);
      } finally {
        addBtn.disabled = false;
      }
    });
  });

  /* ---------- cart promo code: /discount/CODE attaches it to the checkout ---------- */
  function promoCode() {
    const input = qs('[data-cart-promo]');
    return input ? input.value.trim() : '';
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-cart-promo-apply]')) return;
    const code = promoCode();
    if (code) window.location.href = '/discount/' + encodeURIComponent(code) + '?redirect=' + encodeURIComponent(settings.cartUrl);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter' || !e.target.closest('[data-cart-promo]')) return;
    e.preventDefault();
    const btn = qs('[data-cart-promo-apply]');
    if (btn) btn.click();
  });
  document.addEventListener('submit', (e) => {
    const form = e.target.closest('[data-cart-checkout-form]');
    const code = promoCode();
    if (!form || !code) return;
    e.preventDefault();
    window.location.href = '/discount/' + encodeURIComponent(code) + '?redirect=' + encodeURIComponent('/checkout');
  });

  /* ---------- saved for later (per browser, like the design's saved list) ---------- */
  const SAVED_KEY = 'eb-saved';
  function readSaved() {
    try { const list = JSON.parse(localStorage.getItem(SAVED_KEY)); return Array.isArray(list) ? list : []; } catch (err) { return []; }
  }
  function writeSaved(list) {
    try { localStorage.setItem(SAVED_KEY, JSON.stringify(list)); } catch (err) { /* storage unavailable */ }
    syncSaved();
  }
  function isSaved(handle) { return readSaved().indexOf(handle) !== -1; }
  function setSaved(handle, on) {
    const list = readSaved().filter((h) => h !== handle);
    if (on) list.unshift(handle);
    writeSaved(list);
  }
  function syncSaved() {
    const list = readSaved();
    qsa('[data-save-toggle]').forEach((btn) => {
      const on = list.indexOf(btn.getAttribute('data-product-handle')) !== -1;
      btn.setAttribute('aria-pressed', String(on));
      const label = qs('[data-save-label]', btn);
      if (label) label.textContent = btn.getAttribute(on ? 'data-label-saved' : 'data-label-save');
    });
    qsa('[data-saved-count]').forEach((el) => { el.textContent = list.length ? String(list.length) : ''; });
    qsa('[data-saved-list]').forEach(renderSavedList);
  }
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-save-toggle]');
    if (!btn) return;
    const handle = btn.getAttribute('data-product-handle');
    setSaved(handle, !isSaved(handle));
  });

  async function cartAddVariant(id) {
    const res = await fetch(settings.cartAddUrl + '.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ items: [{ id, quantity: 1 }] })
    });
    if (!res.ok) throw new Error('add failed');
  }

  async function renderSavedList(root) {
    const list = readSaved();
    const empty = qs('[data-saved-empty]', root);
    const grid = qs('[data-saved-grid]', root);
    const wrapper = root.closest('[data-saved-section]');
    if (wrapper && wrapper.hasAttribute('data-hide-when-empty')) wrapper.hidden = list.length === 0;
    if (empty) empty.hidden = list.length > 0;
    if (!grid) return;
    const token = String(Date.now()) + Math.random();
    root.setAttribute('data-render-token', token);
    const products = await Promise.all(list.map((handle) =>
      fetch('/products/' + encodeURIComponent(handle) + '.js').then((r) => (r.ok ? r.json() : null)).catch(() => null)
    ));
    if (root.getAttribute('data-render-token') !== token) return;
    grid.innerHTML = '';
    products.forEach((p, i) => {
      if (!p) return;
      const variant = p.variants.find((v) => v.available) || p.variants[0];
      const card = document.createElement('div');
      card.className = 'saved-card';
      const imgUrl = p.featured_image ? p.featured_image + (p.featured_image.indexOf('?') === -1 ? '?' : '&') + 'width=500' : '';
      const img = imgUrl ? '<img src="' + imgUrl + '" alt="" width="500" height="500" loading="lazy">' : '';
      card.innerHTML =
        '<a class="saved-card__media" href="' + p.url + '">' + img + '</a>' +
        '<div class="saved-card__body">' +
          '<a class="saved-card__title" href="' + p.url + '"></a>' +
          '<span class="saved-card__stock' + (variant.available ? '' : ' is-out') + '"></span>' +
          '<span class="saved-card__price">' + formatMoney(variant.price) + '</span>' +
          '<div class="saved-card__actions">' +
            '<button type="button" class="btn btn-primary" data-saved-move' + (variant.available ? '' : ' disabled') + '></button>' +
            '<button type="button" class="saved-card__remove" data-saved-remove></button>' +
          '</div>' +
        '</div>';
      qs('.saved-card__title', card).textContent = p.title;
      qs('.saved-card__stock', card).textContent = root.getAttribute(variant.available ? 'data-in-stock' : 'data-sold-out');
      qs('[data-saved-move]', card).textContent = root.getAttribute('data-move-label');
      qs('[data-saved-remove]', card).textContent = root.getAttribute('data-remove-label');
      qs('[data-saved-move]', card).addEventListener('click', async (ev) => {
        ev.currentTarget.disabled = true;
        try {
          await cartAddVariant(variant.id);
          setSaved(list[i], false);
          if (qs('[data-cart-page]')) { window.location.reload(); return; }
          await refreshCartDrawer();
          openCartDrawer();
        } catch (err) {
          console.error('[saved] move to bag failed', err);
          ev.currentTarget.disabled = false;
        }
      });
      qs('[data-saved-remove]', card).addEventListener('click', () => setSaved(list[i], false));
      grid.appendChild(card);
    });
  }

  /* Cart line "Save for later": remember the product, then drop the line. */
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-cart-save]');
    if (!btn) return;
    e.preventDefault();
    btn.disabled = true;
    setSaved(btn.getAttribute('data-product-handle'), true);
    try {
      await fetch(settings.cartChangeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ id: btn.getAttribute('data-line-key'), quantity: 0 })
      });
    } catch (err) {
      console.error('[saved] could not remove line', err);
    }
    if (btn.closest('[data-cart-page]')) { window.location.reload(); return; }
    await refreshCartDrawer();
  });

  window.addEventListener('storage', (e) => { if (e.key === SAVED_KEY) syncSaved(); });
  syncSaved();

  /* ---------- collection page: filters, sort, density, load more ----------
     Filter / sort changes fetch this section again through the Section
     Rendering API and swap it in place (URL kept in sync with history), so
     the page never fully reloads. */
  const GRID_KEY = 'eb-grid';
  const FILTERS_KEY = 'eb-filters-hidden';
  const narrow = window.matchMedia('(max-width: 900px)');

  function initCollection(root) {
    const sectionId = root.getAttribute('data-section-id');
    const form = qs('[data-collection-form]', root);
    const grid = qs('[data-collection-grid]', root);

    /* show / hide filters (desktop) or open / close the drawer (narrow) */
    try { root.classList.toggle('is-filters-hidden', localStorage.getItem(FILTERS_KEY) === '1'); } catch (err) { /* storage unavailable */ }
    qsa('[data-collection-toggle]', root).forEach((btn) => btn.addEventListener('click', () => {
      if (narrow.matches) {
        root.classList.toggle('is-drawer-open');
        document.body.style.overflow = root.classList.contains('is-drawer-open') ? 'hidden' : '';
        return;
      }
      const hidden = root.classList.toggle('is-filters-hidden');
      try { localStorage.setItem(FILTERS_KEY, hidden ? '1' : '0'); } catch (err) { /* storage unavailable */ }
      const toggle = qs('.collection-toolbar__toggle', root);
      if (toggle) toggle.setAttribute('aria-expanded', String(!hidden));
    }));

    /* grid density */
    function setDensity(mode) {
      if (grid) grid.classList.toggle('is-dense', mode === 'dense');
      qsa('[data-grid-density]', root).forEach((b) => b.setAttribute('aria-pressed', String(b.getAttribute('data-grid-density') === mode)));
    }
    let density = 'large';
    try { density = localStorage.getItem(GRID_KEY) || 'large'; } catch (err) { /* storage unavailable */ }
    setDensity(density);
    qsa('[data-grid-density]', root).forEach((b) => b.addEventListener('click', () => {
      const mode = b.getAttribute('data-grid-density');
      setDensity(mode);
      try { localStorage.setItem(GRID_KEY, mode); } catch (err) { /* storage unavailable */ }
    }));

    /* quick search over the loaded cards */
    const search = qs('[data-collection-search]', root);
    const searchEmpty = qs('[data-collection-search-empty]', root);
    if (search && grid) {
      search.addEventListener('input', () => {
        const q = search.value.trim().toLowerCase();
        let shown = 0;
        qsa('.product-card', grid).forEach((card) => {
          const title = (qs('.product-card__title', card) || card).textContent.toLowerCase();
          const match = !q || title.indexOf(q) !== -1;
          card.hidden = !match;
          if (match) shown += 1;
        });
        if (searchEmpty) searchEmpty.hidden = shown > 0;
      });
    }

    /* two-handle price range */
    qsa('[data-price-range]', root).forEach((wrap) => {
      const minR = qs('[data-price-min]', wrap);
      const maxR = qs('[data-price-max]', wrap);
      const minF = qs('[data-price-min-field]', wrap);
      const maxF = qs('[data-price-max-field]', wrap);
      const minL = qs('[data-price-min-label]', wrap);
      const maxL = qs('[data-price-max-label]', wrap);
      const box = qs('.price-range', wrap);
      const rangeMax = parseFloat(maxF.getAttribute('data-range-max')) || parseFloat(maxR.max);
      function paint(changed) {
        let lo = parseFloat(minR.value);
        let hi = parseFloat(maxR.value);
        if (lo > hi) { if (changed === minR) { lo = hi; minR.value = lo; } else { hi = lo; maxR.value = hi; } }
        box.style.setProperty('--min', lo);
        box.style.setProperty('--max', hi);
        if (minL) minL.textContent = formatMoney(lo * 100).replace(/[.,]00(?=\D*$)/, '');
        if (maxL) maxL.textContent = formatMoney(hi * 100).replace(/[.,]00(?=\D*$)/, '');
        minF.value = lo > 0 ? lo : '';
        maxF.value = hi < rangeMax ? hi : '';
      }
      [minR, maxR].forEach((r) => {
        r.addEventListener('input', () => paint(r));
        r.addEventListener('change', () => { paint(r); submit(); });
      });
    });

    /* AJAX filtering */
    function urlFromForm() {
      const params = new URLSearchParams();
      new FormData(form).forEach((value, key) => { if (value !== '') params.append(key, value); });
      return form.getAttribute('action') + (params.toString() ? '?' + params.toString() : '');
    }
    async function load(url, push) {
      root.classList.add('is-loading');
      try {
        const sep = url.indexOf('?') === -1 ? '?' : '&';
        const res = await fetch(url + sep + 'section_id=' + encodeURIComponent(sectionId));
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const fresh = doc.querySelector('[data-collection]');
        if (!fresh) { window.location.href = url; return; }
        const drawerOpen = root.classList.contains('is-drawer-open');
        const hidden = root.classList.contains('is-filters-hidden');
        const scroll = (qs('[data-collection-filters]', root) || {}).scrollTop || 0;
        const openGroups = qsa('.collection-filters__group', root).map((d) => d.open);
        root.innerHTML = fresh.innerHTML;
        root.classList.toggle('is-drawer-open', drawerOpen);
        root.classList.toggle('is-filters-hidden', hidden);
        qsa('.collection-filters__group', root).forEach((d, i) => { if (openGroups[i] !== undefined) d.open = openGroups[i] || d.open; });
        const aside = qs('[data-collection-filters]', root);
        if (aside) aside.scrollTop = scroll;
        if (push) history.replaceState({}, '', url);
        initCollection(root);
        syncSaved();
      } catch (err) {
        window.location.href = url;
      } finally {
        root.classList.remove('is-loading');
      }
    }
    function submit() { if (form) load(urlFromForm(), true); }
    if (form) {
      form.addEventListener('change', (e) => { if (!e.target.closest('[data-price-range]')) submit(); });
      form.addEventListener('submit', (e) => { e.preventDefault(); submit(); });
    }
    const sort = qs('[data-collection-sort]', root);
    if (sort) sort.addEventListener('change', submit);
    qsa('[data-collection-link]', root).forEach((a) => a.addEventListener('click', (e) => { e.preventDefault(); load(a.href, true); }));

    /* load more: fetch the next page of this section and append its cards */
    const more = qs('[data-load-more]', root);
    if (more && grid) {
      more.addEventListener('click', async (e) => {
        e.preventDefault();
        more.setAttribute('aria-busy', 'true');
        try {
          const url = more.href;
          const res = await fetch(url + (url.indexOf('?') === -1 ? '?' : '&') + 'section_id=' + encodeURIComponent(sectionId));
          const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
          qsa('[data-collection-grid] > *', doc).forEach((card) => grid.appendChild(card));
          const nextMore = doc.querySelector('[data-load-more]');
          const total = parseInt(more.getAttribute('data-total'), 10) || 0;
          const count = qsa('.product-card', grid).length;
          const shownEl = qs('[data-shown]', root);
          const bar = qs('[data-progress]', root);
          if (shownEl) shownEl.textContent = count;
          if (bar && total) bar.style.width = Math.min(100, (count / total) * 100) + '%';
          if (nextMore) more.href = nextMore.href; else (qs('[data-collection-more]', root) || more).remove();
          syncSaved();
        } catch (err) {
          window.location.href = more.href;
        } finally {
          more.removeAttribute('aria-busy');
        }
      });
    }
  }
  qsa('[data-collection]').forEach(initCollection);
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    qsa('[data-collection].is-drawer-open').forEach((r) => { r.classList.remove('is-drawer-open'); document.body.style.overflow = ''; });
  });

  /* ---------- legal: document tabs (+ #privacy style links) ---------- */
  qsa('[data-legal]').forEach((root) => {
    const tabs = qsa('[data-legal-tab]', root);
    const panels = qsa('[data-legal-panel]', root);
    if (!tabs.length) return;
    function show(id, focus) {
      if (!panels.some((p) => p.getAttribute('data-legal-panel') === id)) id = tabs[0].getAttribute('data-legal-tab');
      tabs.forEach((t) => {
        const on = t.getAttribute('data-legal-tab') === id;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        if (on && focus) t.focus();
      });
      panels.forEach((p) => { p.hidden = p.getAttribute('data-legal-panel') !== id; });
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        const id = t.getAttribute('data-legal-tab');
        show(id);
        try { history.replaceState(null, '', '#' + id); } catch (err) { /* ignore */ }
      });
      t.addEventListener('keydown', (e) => {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        const next = tabs[(i + (e.key === 'ArrowRight' ? 1 : tabs.length - 1)) % tabs.length];
        show(next.getAttribute('data-legal-tab'), true);
      });
    });
    const fromHash = () => show((window.location.hash || '').replace('#', ''));
    window.addEventListener('hashchange', fromHash);
    fromHash();
  });

  /* ---------- lookbook: hotspots <-> product rows ---------- */
  qsa('[data-look]').forEach((root) => {
    const spots = qsa('[data-look-spot]', root);
    const rows = qsa('[data-look-row]', root);
    let pinned = '';
    function mark(n) {
      const key = n || pinned;
      spots.forEach((el) => el.classList.toggle('is-active', el.getAttribute('data-look-spot') === key));
      rows.forEach((el) => el.classList.toggle('is-active', el.getAttribute('data-look-row') === key));
    }
    spots.forEach((el) => {
      const n = el.getAttribute('data-look-spot');
      el.addEventListener('mouseenter', () => mark(n));
      el.addEventListener('mouseleave', () => mark(''));
      el.addEventListener('click', () => { pinned = pinned === n ? '' : n; mark(''); });
    });
    rows.forEach((el) => {
      const n = el.getAttribute('data-look-row');
      el.addEventListener('mouseenter', () => mark(n));
      el.addEventListener('mouseleave', () => mark(''));
    });
  });

  /* ---------- journal: search + load more ---------- */
  qsa('[data-blog]').forEach((root) => {
    const grid = qs('[data-blog-grid]', root);
    const search = qs('[data-blog-search]', root);
    const empty = qs('[data-blog-search-empty]', root);
    function filter() {
      if (!search || !grid) return;
      const q = search.value.trim().toLowerCase();
      let visible = 0;
      qsa('[data-article-card]', grid).forEach((card) => {
        const hit = !q || (card.getAttribute('data-title') || '').indexOf(q) !== -1;
        card.hidden = !hit;
        if (hit) visible += 1;
      });
      if (empty) empty.hidden = visible > 0;
    }
    if (search) search.addEventListener('input', filter);
    const more = qs('[data-blog-load-more]', root);
    if (more && grid) {
      more.addEventListener('click', async (e) => {
        e.preventDefault();
        more.setAttribute('aria-busy', 'true');
        try {
          const url = more.href;
          const res = await fetch(url + (url.indexOf('?') === -1 ? '?' : '&') + 'section_id=' + encodeURIComponent(root.getAttribute('data-section-id')));
          const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
          qsa('[data-blog-grid] > *', doc).forEach((card) => grid.appendChild(card));
          const nextMore = doc.querySelector('[data-blog-load-more]');
          const total = parseInt(more.getAttribute('data-total'), 10) || 0;
          const count = qsa('[data-article-card]', grid).length + (qs('.blog-featured', root) ? 1 : 0);
          const shownEl = qs('[data-shown]', root);
          const bar = qs('[data-progress]', root);
          if (shownEl) shownEl.textContent = count;
          if (bar && total) bar.style.width = Math.min(100, (count / total) * 100) + '%';
          if (nextMore) more.href = nextMore.href; else (qs('[data-blog-more]', root) || more).remove();
          filter();
        } catch (err) {
          window.location.href = more.href;
        } finally {
          more.removeAttribute('aria-busy');
        }
      });
    }
  });

  /* ---------- journal article: contents, reading progress, copy link ---------- */
  qsa('[data-article]').forEach((root) => {
    const content = qs('[data-article-content]', root);
    const toc = qs('[data-article-toc]', root);
    const tocWrap = qs('[data-article-toc-wrap]', root);
    const heads = content ? qsa('h2', content) : [];
    const links = [];
    if (toc && heads.length > 1) {
      heads.forEach((h, i) => {
        if (!h.id) h.id = 'section-' + (i + 1) + '-' + h.textContent.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.trim();
        toc.appendChild(a);
        links.push(a);
      });
      if (tocWrap) tocWrap.hidden = false;
    }
    const bar = qs('[data-article-progress]');
    function onScroll() {
      if (!content) return;
      const rect = content.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const done = Math.min(1, Math.max(0, -rect.top / (total > 0 ? total : 1)));
      if (bar) bar.style.width = (done * 100) + '%';
      if (!links.length) return;
      let active = 0;
      heads.forEach((h, i) => { if (h.getBoundingClientRect().top < window.innerHeight * 0.3) active = i; });
      links.forEach((a, i) => a.classList.toggle('is-active', i === active));
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const copy = qs('[data-article-copy]', root);
    const note = qs('[data-article-copied]', root);
    if (copy) {
      copy.addEventListener('click', async () => {
        try { await navigator.clipboard.writeText(window.location.href.split('#')[0]); } catch (err) { /* clipboard blocked */ }
        if (!note) return;
        note.textContent = copy.getAttribute('data-copied') || '';
        clearTimeout(copy._t);
        copy._t = setTimeout(() => { note.textContent = ''; }, 2200);
      });
    }
  });

  /* ---------- light / dark switch (header) ---------- */
  function syncThemeToggle() {
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    qsa('[data-theme-toggle]').forEach((btn) => {
      btn.setAttribute('aria-label', btn.getAttribute(dark ? 'data-label-light' : 'data-label-dark') || '');
      btn.setAttribute('aria-pressed', String(dark));
    });
  }
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-theme-toggle]')) return;
    const dark = document.documentElement.getAttribute('data-theme') !== 'dark';
    if (dark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
    try { localStorage.setItem('eb-theme', dark ? 'dark' : 'light'); } catch (err) { /* storage unavailable */ }
    syncThemeToggle();
  });
  syncThemeToggle();

  /* ---------- free shipping progress bar in cart ---------- */
  updateCartCount();
})();

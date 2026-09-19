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
    const form = e.target.closest('form[data-product-form]');
    if (!form) return;
    e.preventDefault();
    const submitBtn = qs('[type="submit"]', form);
    if (submitBtn) submitBtn.disabled = true;
    try {
      const formData = new FormData(form);
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

  /* ---------- product: variant selection + gallery thumbs ---------- */
  qsa('[data-product-form]').forEach((form) => {
    const productJsonEl = qs('[data-product-json]', form.closest('[data-product-root]') || document);
    if (!productJsonEl) return;
    let product;
    try { product = JSON.parse(productJsonEl.textContent); } catch (err) { return; }

    function selectedOptions() {
      return qsa('[data-option-input]:checked, [data-option-select]', form).map((el) => el.value);
    }
    function findVariant(options) {
      return product.variants.find((v) => v.options.every((val, i) => val === options[i]));
    }
    function updateForVariant(variant) {
      const priceEl = qs('[data-product-price]', form.closest('[data-product-root]'));
      const compareEl = qs('[data-product-compare-price]', form.closest('[data-product-root]'));
      const submitBtn = qs('[type="submit"]', form);
      const idInput = qs('[data-variant-id]', form);
      if (!variant) {
        if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = form.getAttribute('data-unavailable-text') || 'Unavailable'; }
        return;
      }
      if (idInput) idInput.value = variant.id;
      if (priceEl) priceEl.textContent = formatMoney(variant.price);
      if (compareEl) {
        if (variant.compare_at_price > variant.price) {
          compareEl.textContent = formatMoney(variant.compare_at_price);
          compareEl.hidden = false;
        } else {
          compareEl.hidden = true;
        }
      }
      if (submitBtn) {
        submitBtn.disabled = !variant.available;
        submitBtn.textContent = variant.available
          ? (form.getAttribute('data-add-text') || 'Add to bag')
          : (form.getAttribute('data-soldout-text') || 'Sold out');
      }
      const root = form.closest('[data-product-root]');
      if (root && variant.featured_image) {
        const mainImg = qs('[data-product-main-image]', root);
        if (mainImg) mainImg.src = variant.featured_image.src;
      }
    }

    form.addEventListener('change', () => updateForVariant(findVariant(selectedOptions())));
    updateForVariant(findVariant(selectedOptions()));
  });

  qsa('[data-gallery-thumb]').forEach((thumb) => {
    thumb.addEventListener('click', () => {
      const root = thumb.closest('[data-product-root]');
      const mainImg = qs('[data-product-main-image]', root);
      qsa('[data-gallery-thumb]', root).forEach((t) => t.classList.remove('is-active'));
      thumb.classList.add('is-active');
      if (mainImg) mainImg.src = thumb.getAttribute('data-full-src') || thumb.src;
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

  /* ---------- skin quiz ---------- */
  qsa('[data-quiz]').forEach((quiz) => {
    const steps = qsa('[data-quiz-step]', quiz);
    const progressFill = qs('[data-quiz-progress-fill]', quiz);
    const answers = {};
    let current = 0;

    function render() {
      steps.forEach((step, i) => step.classList.toggle('is-active', i === current));
      if (progressFill) progressFill.style.width = Math.round((current / (steps.length - 1)) * 100) + '%';
      if (current === steps.length - 1) buildResult();
    }

    function buildResult() {
      const pickedTags = Object.values(answers).filter(Boolean);
      const resultList = qs('[data-quiz-results]', quiz);
      if (!resultList) return;
      const cards = qsa('[data-quiz-product]', resultList);
      if (!pickedTags.length) {
        cards.forEach((card) => { card.hidden = false; });
        return;
      }
      /* Score every card by how many of the answers it satisfies, rather than
         picking one "top" tag — with one tag per question, counts tie and a
         single-tag filter would only ever reflect whichever answer sorted
         first, ignoring the rest of the quiz. */
      const scored = cards.map((card) => {
        const tags = (card.getAttribute('data-tags') || '').split(',').map((t) => t.trim());
        const score = pickedTags.reduce((n, tag) => n + (tags.includes(tag) ? 1 : 0), 0);
        return { card, score };
      });
      const bestScore = Math.max(0, ...scored.map((s) => s.score));
      scored
        .sort((a, b) => b.score - a.score)
        .forEach(({ card, score }) => {
          resultList.appendChild(card);
          card.hidden = bestScore > 0 && score === 0;
        });
    }

    quiz.addEventListener('click', (e) => {
      const option = e.target.closest('[data-quiz-option]');
      if (option) {
        const step = option.closest('[data-quiz-step]');
        answers[step.getAttribute('data-quiz-step')] = option.getAttribute('data-quiz-tag');
        current = Math.min(current + 1, steps.length - 1);
        render();
      }
      if (e.target.closest('[data-quiz-back]')) {
        current = Math.max(current - 1, 0);
        render();
      }
      if (e.target.closest('[data-quiz-restart]')) {
        Object.keys(answers).forEach((k) => delete answers[k]);
        current = 0;
        render();
      }
      if (e.target.closest('[data-quiz-start]')) {
        current = 1;
        render();
      }
    });

    render();
  });

  /* ---------- hero hotspots ---------- */
  document.addEventListener('click', (e) => {
    const dot = e.target.closest('[data-hotspot-toggle]');
    if (!dot) return;
    const hotspot = dot.closest('[data-hotspot]');
    const wasOpen = hotspot.classList.contains('is-open');
    qsa('[data-hotspot].is-open').forEach((h) => h.classList.remove('is-open'));
    if (!wasOpen) hotspot.classList.add('is-open');
  });
  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-hotspot]')) {
      qsa('[data-hotspot].is-open').forEach((h) => h.classList.remove('is-open'));
    }
  });

  /* ---------- header mega menu (hover + keyboard) ---------- */
  qsa('[data-mega-trigger]').forEach((trigger) => {
    const panelId = trigger.getAttribute('aria-controls');
    const panel = panelId && document.getElementById(panelId);
    if (!panel) return;
    const nav = trigger.closest('[data-site-nav]');
    function open() {
      qsa('[data-mega-panel]', nav).forEach((p) => p.classList.remove('is-open'));
      panel.classList.add('is-open');
      trigger.setAttribute('aria-expanded', 'true');
    }
    function close() {
      panel.classList.remove('is-open');
      trigger.setAttribute('aria-expanded', 'false');
    }
    trigger.addEventListener('mouseenter', open);
    trigger.addEventListener('focus', open);
    trigger.addEventListener('click', (e) => {
      if (panel.classList.contains('is-open')) { close(); } else { e.preventDefault(); open(); }
    });
    if (nav) nav.addEventListener('mouseleave', close);
  });
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

  /* ---------- free shipping progress bar in cart ---------- */
  updateCartCount();
})();

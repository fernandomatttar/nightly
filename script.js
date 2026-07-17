/* Nightly site — small, dependency-free UI polish.
   No external libraries: everything below is vanilla JS.
   Degrades safely: if this file fails to load, the page still
   shows all content (see the .js-anim gating in style.css). */
(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Header: scrolled state + scroll progress bar ---------- */
  const header = document.querySelector('header.site');
  let progressBar = null;
  if (header) {
    progressBar = document.createElement('div');
    progressBar.className = 'scroll-progress';
    header.appendChild(progressBar);
  }

  function onScroll() {
    if (header) header.classList.toggle('scrolled', window.scrollY > 8);
    if (progressBar) {
      const doc = document.documentElement;
      const scrollable = doc.scrollHeight - doc.clientHeight;
      const pct = scrollable > 0 ? (doc.scrollTop / scrollable) * 100 : 0;
      progressBar.style.width = pct + '%';
    }
    if (toTopBtn) toTopBtn.classList.toggle('show', window.scrollY > 480);
  }

  /* ---------- Back-to-top button ---------- */
  const toTopBtn = document.createElement('button');
  toTopBtn.type = 'button';
  toTopBtn.className = 'to-top';
  toTopBtn.setAttribute('aria-label', 'Back to top');
  toTopBtn.innerHTML = '&#8593;';
  toTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
  });
  document.body.appendChild(toTopBtn);

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll reveal ---------- */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (revealEls.length) {
    if ('IntersectionObserver' in window && !reduceMotion) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach((el) => io.observe(el));
    } else {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    }
  }

  /* ---------- Hero / page-head load-in ---------- */
  const loadEls = document.querySelectorAll('[data-load]');
  requestAnimationFrame(() => {
    loadEls.forEach((el, i) => {
      el.style.transitionDelay = reduceMotion ? '0ms' : (i * 90) + 'ms';
      el.classList.add('is-visible');
    });
  });

  /* ---------- Button ripple ---------- */
  document.querySelectorAll('.btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (reduceMotion) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height) * 1.4;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
      ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
      btn.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove());
    });
  });

  /* ---------- Demo mock auto-cycle (index.html "Designed for everyday use") ---------- */
  const switchEl = document.querySelector('.mock .switch');
  const barFill = document.querySelector('.mock .bar-fill');
  const pctLabel = document.querySelector('.mock .pct');
  const presets = document.querySelectorAll('.mock .presets .preset');

  if (switchEl && !reduceMotion) {
    let on = true;
    setInterval(() => {
      on = !on;
      switchEl.classList.toggle('off', !on);
      const val = on ? 65 : 0;
      if (barFill) barFill.style.width = val + '%';
      if (pctLabel) pctLabel.textContent = 'Strength: ' + val + '%';
    }, 2800);
  }

  if (presets.length && !reduceMotion) {
    let idx = Array.from(presets).findIndex((p) => p.classList.contains('active'));
    if (idx < 0) idx = 0;
    setInterval(() => {
      presets[idx].classList.remove('active');
      idx = (idx + 1) % presets.length;
      presets[idx].classList.add('active');
    }, 2000);
  }

  /* ---------- FAQ: smooth custom accordion ---------- */
  document.querySelectorAll('.faq details').forEach((details) => {
    const summary = details.querySelector('summary');
    const content = details.querySelector('p');
    if (!summary || !content) return;

    /* Force the native attribute open permanently once JS runs, so the
       browser's own show/hide never fights our animation — visibility is
       driven entirely by max-height/opacity below, which CSS transitions
       smoothly. (No-JS visitors still get the normal native accordion.) */
    details.setAttribute('open', '');
    content.style.maxHeight = '0px';
    content.style.opacity = '0';

    summary.addEventListener('click', (e) => {
      e.preventDefault();
      const isOpen = details.classList.contains('is-open');
      if (isOpen) {
        details.classList.remove('is-open');
        content.style.maxHeight = '0px';
        content.style.opacity = '0';
      } else {
        details.classList.add('is-open');
        content.style.maxHeight = content.scrollHeight + 'px';
        content.style.opacity = '1';
      }
    });
  });

  /* Recalculate open FAQ heights on resize so wrapped text isn't clipped */
  window.addEventListener('resize', () => {
    document.querySelectorAll('.faq details.is-open').forEach((details) => {
      const content = details.querySelector('p');
      if (content) content.style.maxHeight = content.scrollHeight + 'px';
    });
  });
})();

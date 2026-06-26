/* =========================================================
   course.js — helpers for the LLM Fundamentals course pages
   Theme is owned by the site-wide ../theme.js (sessionStorage,
   #theme-toggle). Here we only:
     - run the sticky topic-strip scrollspy
     - expose tiny deterministic helpers (CK) for the visuals
     - re-fire a 'themechange' event after a theme toggle so the
       canvas visualizations re-read CSS variables and redraw
   ========================================================= */
(function () {
  'use strict';

  const root = document.documentElement;

  /* ---------- redraw visuals when the site theme toggles ---------- */
  function wireThemeRedraw() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', function () {
      // let ../theme.js flip data-theme first, then signal a redraw
      requestAnimationFrame(function () {
        window.dispatchEvent(new Event('themechange'));
      });
    });
  }

  /* ---------- scrollspy for .topic-strip ---------- */
  function initSpy() {
    const links = Array.from(document.querySelectorAll('.topic-strip a'));
    if (!links.length) return;
    const map = new Map();
    links.forEach(function (a) {
      const id = a.getAttribute('href').slice(1);
      const sec = document.getElementById(id);
      if (sec) map.set(sec, a);
    });
    const obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('active'); });
          const a = map.get(en.target);
          if (a) {
            a.classList.add('active');
            a.scrollIntoView({ block: 'nearest', inline: 'center' });
          }
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });
    map.forEach(function (_a, sec) { obs.observe(sec); });
  }

  /* ---------- helpers exposed for inline page scripts ---------- */
  window.CK = {
    // seeded deterministic PRNG (mulberry32)
    rng: function (seed) {
      let a = seed >>> 0;
      return function () {
        a |= 0; a = (a + 0x6D2B79F5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    },
    // hash a string to an int seed
    hash: function (s) {
      let h = 2166136261 >>> 0;
      for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
      return h >>> 0;
    },
    // softmax with temperature
    softmax: function (arr, temp) {
      temp = temp || 1;
      const m = Math.max.apply(null, arr);
      const ex = arr.map(function (x) { return Math.exp((x - m) / temp); });
      const s = ex.reduce(function (a, b) { return a + b; }, 0);
      return ex.map(function (x) { return x / s; });
    },
    // read a CSS variable from :root (re-read on theme change)
    cssVar: function (name) {
      return getComputedStyle(root).getPropertyValue(name).trim();
    },
    // HiDPI canvas setup -> returns 2d ctx sized to css box
    fitCanvas: function (canvas, cssH) {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.clientWidth || canvas.parentElement.clientWidth;
      const h = cssH || canvas.clientHeight || 200;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      canvas.style.height = h + 'px';
      const ctx = canvas.getContext('2d');
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx._w = w; ctx._h = h;
      return ctx;
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { wireThemeRedraw(); initSpy(); });
  } else {
    wireThemeRedraw();
    initSpy();
  }
})();

/*! fk-reveal — Fawkes site-header registered script — v1.2.0
 *  Super-subtle "animate into view" for whole content blocks: a short opacity +
 *  10px rise the first time each block enters the viewport.
 *
 *  Uses IntersectionObserver (not ScrollTrigger.batch, which drops elements on
 *  fast scroll / when they start above the fold).
 *
 *  v1.2.0 — the reveal path now uses gsap.set (synchronous, no rAF) with a CSS
 *  transition for the fade, so blocks still un-hide in environments where
 *  requestAnimationFrame is throttled/stopped (background tabs, headless/automation).
 *  gsap.to tweens were freezing at autoAlpha:0 there, leaving the whole page
 *  invisible. Hard failsafe also un-hides everything after 1.8s and on tab-hide.
 *  Respects prefers-reduced-motion. Hero / nav / footer bottom are left alone.
 */
(function () {
  "use strict";
  if (window.__FK_REVEAL__) return;
  window.__FK_REVEAL__ = true;

  var REDUCED = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Whole blocks — one gentle fade per section/card, never per leaf node.
  var SELECTOR = [
    ".section-wrapper",
    ".fk-product-block",
    ".fk-cta-banner",
    ".fk-trusted-band",
    ".fk-use-cases-bar",
    ".fk-xlink-card"
  ].join(",");

  function init() {
    var els = Array.prototype.slice.call(document.querySelectorAll(SELECTOR))
      .filter(function (el) { return !el.closest(".hero-wrapper, nav, .fk-nav-wrapper"); });
    if (!els.length) return;

    if (REDUCED || !window.gsap) return; // leave everything visible

    var vh = window.innerHeight || document.documentElement.clientHeight;
    var hidden = [];

    els.forEach(function (el) {
      // already in view on load → don't touch it (no flash, no CLS)
      if (el.getBoundingClientRect().top < vh * 0.9) return;
      // CSS transition drives the fade so we never depend on the rAF ticker.
      el.style.transition = "opacity .5s ease, transform .5s ease";
      gsap.set(el, { autoAlpha: 0, y: 10 });
      hidden.push(el);
    });
    if (!hidden.length) return;

    function reveal(el) {
      if (el.__fkDone) return;
      el.__fkDone = true;
      // gsap.set is synchronous — applies instantly even with no rAF. The inline
      // CSS transition above animates opacity/transform to the new values.
      gsap.set(el, { autoAlpha: 1, y: 0 });
    }
    function revealAll() { hidden.forEach(reveal); }

    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); }
        });
      }, { rootMargin: "0px 0px -8% 0px", threshold: 0.01 });
      hidden.forEach(function (el) { io.observe(el); });
    } else {
      revealAll();
      return;
    }

    // Failsafes — nothing may ever stay invisible.
    setTimeout(revealAll, 1800);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) revealAll();
    });
    window.addEventListener("pagehide", revealAll);
    window.addEventListener("load", function () { setTimeout(revealAll, 1200); });
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();

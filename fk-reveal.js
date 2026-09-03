/*! fk-reveal — Fawkes site-header registered script — v1.1.0
 *  Super-subtle "animate into view" for whole content blocks: a short opacity +
 *  10px rise the first time each block enters the viewport.
 *
 *  Uses IntersectionObserver (not ScrollTrigger.batch, which drops elements on
 *  fast scroll / when they start above the fold). Hard failsafe reveals
 *  everything after 3.5s and on tab-hide so nothing can get stuck invisible.
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
      gsap.set(el, { autoAlpha: 0, y: 10 });
      hidden.push(el);
    });
    if (!hidden.length) return;

    function reveal(el) {
      if (!el.__fkDone) {
        el.__fkDone = true;
        gsap.to(el, { autoAlpha: 1, y: 0, duration: 0.5, ease: "power1.out", overwrite: "auto" });
      }
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
    setTimeout(revealAll, 3500);
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) revealAll();
    });
    window.addEventListener("pagehide", revealAll);
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();

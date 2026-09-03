/*! fk-reveal — Fawkes site-header registered script — v1.0.0
 *  Super-subtle "animate into view" for content blocks: a short opacity + 12px
 *  rise as each block crosses into the viewport, once. Respects
 *  prefers-reduced-motion. Requires gsapcore + gsapscrolltrigger first.
 *
 *  Deliberately gentle — this is polish, not a showcase. Hero is left alone
 *  (heropinv3 owns it). Nav and footer are left alone.
 */
(function () {
  "use strict";
  if (window.__FK_REVEAL__) return;
  window.__FK_REVEAL__ = true;

  var REDUCED = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  // Block-level things worth revealing. Kept to a curated list so we animate
  // whole sections/cards, not every leaf node.
  var SELECTOR = [
    ".section-wrapper > *",
    ".fk-product-block",
    ".fk-visual-card",
    ".fk-case-study-card",
    ".fk-trusted-band",
    ".fk-process-tile-list > *",
    ".approach-headline",
    ".approach-subtext",
    ".fk-method-cta",
    ".fk-cta-banner > *",
    ".fk-footer-columns",
    ".fk-use-cases-bar",
    ".fk-xlink-card",
    ".fk-comparison-table",
    ".fk-feature-groups"
  ].join(",");

  function init() {
    if (REDUCED || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    var all = Array.prototype.slice.call(document.querySelectorAll(SELECTOR));
    var els = all.filter(function (el) {
      // skip anything inside the hero, nav or an already-hidden ancestor
      if (el.closest(".hero-wrapper, .fk-nav-wrapper, nav")) return false;
      return true;
    });
    if (!els.length) return;

    var vh = window.innerHeight || document.documentElement.clientHeight;

    els.forEach(function (el) {
      var top = el.getBoundingClientRect().top;
      // Already comfortably in view on load → leave it fully visible, no flash.
      if (top < vh * 0.92) return;
      gsap.set(el, { autoAlpha: 0, y: 12 });
      el.__fkReveal = true;
    });

    var pending = els.filter(function (el) { return el.__fkReveal; });
    if (!pending.length) return;

    ScrollTrigger.batch(pending, {
      start: "top 90%",
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          autoAlpha: 1,
          y: 0,
          duration: 0.5,
          ease: "power1.out",
          stagger: 0.06,
          overwrite: true
        });
      }
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();

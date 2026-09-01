/*! heropinv3 — Fawkes site-header registered script — v1.0.0
 *  Pinned "Palantir" hero: the .image-fill + .hero-scrim are transform-pinned
 *  (pinType:"transform" so the hero's own overflow:hidden crops them
 *  progressively), the scrim darkens and .hero-content / .hero-stat-row fade
 *  as the page scrolls past. Every driver is `scrub`ed, so scrolling back up
 *  retraces the same values — no snap.
 *
 *  This is heropinparallaxv2's architecture with ONE fix: v2 left
 *  data-parallax="0.25" on the hero's .image-fill, so the generic parallax
 *  tween AND the pin both wrote translateY on it — they desynced on scroll-up
 *  and the image "snapped back onto the full box". v3 strips data-parallax off
 *  hero furniture first, so the pin is the only thing transforming it.
 *
 *  Requires: gsapcore + gsapscrolltrigger loaded first; .hero-wrapper keeps
 *  its Webflow overflow:hidden. Other templates have no .hero-stat-row (the
 *  selector just returns null there).
 */
(function () {
  "use strict";
  if (window.__FK_HERO_V3__) return;
  window.__FK_HERO_V3__ = true;

  var HERO = ".hero-wrapper";
  var FURNITURE = ".image-fill, .hero-scrim, .hero-content, .hero-stat-row";
  var AMOUNT = 100;

  var REDUCED = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function init() {
    // Strip data-parallax from hero furniture regardless of GSAP — belt-and-braces
    // so a half-loaded GSAP can't leave the image mid-parallax.
    document.querySelectorAll(HERO).forEach(function (hero) {
      hero.querySelectorAll("[data-parallax]").forEach(function (el) {
        if (el.matches(FURNITURE)) el.removeAttribute("data-parallax");
      });
    });

    if (REDUCED || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Generic parallax — product dashboards, case-study card images, etc.
    // Hero furniture is already disarmed above; the closest() guard covers any
    // other [data-parallax] that happens to live inside a hero.
    document.querySelectorAll("[data-parallax]").forEach(function (el) {
      if (el.closest(HERO)) return;
      var speed = parseFloat(el.getAttribute("data-parallax")) || 0.15;
      gsap.to(el, {
        y: function () { return -(speed * AMOUNT); },
        ease: "none",
        scrollTrigger: {
          trigger: el, start: "top bottom", end: "bottom top",
          scrub: true, invalidateOnRefresh: true
        }
      });
    });

    // Pinned hero.
    document.querySelectorAll(HERO).forEach(function (hero) {
      var img = hero.querySelector(".image-fill");
      var scrim = hero.querySelector(".hero-scrim");
      var content = hero.querySelector(".hero-content");
      var statRow = hero.querySelector(".hero-stat-row");
      var range = {
        trigger: hero, start: "top top", end: "bottom top",
        invalidateOnRefresh: true
      };

      if (img) ScrollTrigger.create(Object.assign(
        { pin: img, pinSpacing: false, pinType: "transform" }, range));
      if (scrim) ScrollTrigger.create(Object.assign(
        { pin: scrim, pinSpacing: false, pinType: "transform" }, range));

      if (scrim) gsap.fromTo(scrim,
        { backgroundColor: "rgba(17,18,23,0.45)" },
        { backgroundColor: "rgba(17,18,23,0.9)", ease: "none",
          immediateRender: false, overwrite: "auto",
          scrollTrigger: Object.assign({ scrub: true }, range) });

      if (content) gsap.to(content,
        { autoAlpha: 0.25, ease: "none", overwrite: "auto",
          scrollTrigger: Object.assign({ scrub: true }, range) });

      if (statRow) gsap.to(statRow,
        { autoAlpha: 0.25, ease: "none", overwrite: "auto",
          scrollTrigger: Object.assign({ scrub: true }, range) });
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();

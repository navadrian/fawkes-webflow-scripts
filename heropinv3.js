/*! heropinv3 — Fawkes site-header registered script — v1.4.0
 *  Plain parallax hero. NO pin — the page keeps scrolling normally; the hero
 *  background just drifts slower than the scroll (classic parallax) and the
 *  hero's own overflow:hidden crops it. Everything is `scrub`ed to the scroll
 *  position, so scrolling back up retraces the exact same frames — no snap.
 *
 *  History: v1.0 tried to pin the absolutely-positioned .image-fill/.hero-scrim
 *  (GSAP can't box those — never pinned). v1.1 pinned the whole .hero-wrapper
 *  section — that DID pin, but it froze the page while darkening, which read as
 *  broken. v1.2 drops pinning entirely and just does the parallax + a gentle
 *  scrim lift.
 *
 *  Requires gsapcore + gsapscrolltrigger first. .hero-wrapper keeps its Webflow
 *  overflow:hidden. About Us has no .hero-wrapper and is untouched.
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
    // The hero image carried data-parallax="0.25" (driven by the generic loop
    // below). Drive it explicitly in the hero block instead so we control the
    // scale/headroom, and strip the attr so it isn't double-animated.
    document.querySelectorAll(HERO).forEach(function (hero) {
      hero.querySelectorAll("[data-parallax]").forEach(function (el) {
        if (el.matches(FURNITURE)) el.removeAttribute("data-parallax");
      });
    });

    if (REDUCED || !window.gsap || !window.ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    // Generic parallax — product dashboards, case-study card images, etc.
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

    // Parallax hero — no pin.
    document.querySelectorAll(HERO).forEach(function (hero) {
      var images = hero.querySelectorAll(".image-fill, .home-hero-media-b");
      var scrim = hero.querySelector(".hero-scrim");
      var content = hero.querySelector(".hero-content");
      var statRow = hero.querySelector(".hero-stat-row");
      var range = {
        trigger: hero, start: "top top", end: "bottom top",
        scrub: true, invalidateOnRefresh: true
      };

      images.forEach(function (img) {
        // Responsive image selection must describe the transformed footprint,
        // not the pre-transform 100vw layout box. Without this, browsers pick
        // a source roughly 24% smaller than the 1.32x rendered hero.
        img.setAttribute("sizes", "132vw");
        // Overscale so the drift never exposes an edge, then move ~28% of the
        // hero height across the whole scroll-through (well slower than the page).
        gsap.set(img, { scale: 1.32, transformOrigin: "50% 50%", willChange: "transform" });
        gsap.fromTo(img,
          { yPercent: -14 },
          { yPercent: 14, ease: "none", immediateRender: false,
            scrollTrigger: Object.assign({}, range) });
      });

      // Gentle darken as the hero leaves — nowhere near a full black-out.
      if (scrim) gsap.fromTo(scrim,
        { backgroundColor: "rgba(17,18,23,0.45)" },
        { backgroundColor: "rgba(17,18,23,0.72)", ease: "none", immediateRender: false,
          scrollTrigger: Object.assign({}, range) });

      // Copy just fades a touch (no vertical lift — that was tried and rejected).
      if (content) gsap.to(content,
        { autoAlpha: 0.55, ease: "none",
          scrollTrigger: Object.assign({}, range) });
      if (statRow && !hero.querySelector('.home-hero-state-b')) gsap.to(statRow,
        { autoAlpha: 0.4, ease: "none",
          scrollTrigger: Object.assign({}, range) });
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();

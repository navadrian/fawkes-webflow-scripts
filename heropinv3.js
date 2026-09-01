/*! heropinv3 — Fawkes site-header registered script — v1.1.0
 *  Pinned "hold & dim" hero.
 *
 *  v1.0.0 tried heropinparallaxv2's trick of pinning the absolutely-positioned
 *  .image-fill / .hero-scrim directly. GSAP can't get a stable box for those
 *  (it froze .hero-scrim at 0x0 and never applied a counter-scroll transform),
 *  so nothing actually pinned. This version pins the whole .hero-wrapper
 *  <section> — a normal in-flow block, the textbook GSAP pin target — with
 *  pinType:"transform" so it stays in flow (no position:fixed escape) and
 *  scrub:true so scrolling back up retraces exactly. The hero holds for ~70vh
 *  of scroll while the scrim darkens and .hero-content / .hero-stat-row fade,
 *  then releases into the next section.
 *
 *  Requires gsapcore + gsapscrolltrigger first. .hero-wrapper keeps its
 *  Webflow overflow:hidden / min-height:100vh. Templates with no .hero-stat-row
 *  just skip that tween. About Us has no .hero-wrapper and is untouched.
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
    // The hero image carried data-parallax="0.25"; with the pin below driving
    // the whole section that would just fight the pin. Strip it from hero
    // furniture (every other [data-parallax] is left alone).
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

    // Pinned hero.
    document.querySelectorAll(HERO).forEach(function (hero) {
      var scrim = hero.querySelector(".hero-scrim");
      var content = hero.querySelector(".hero-content");
      var statRow = hero.querySelector(".hero-stat-row");

      var tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: hero,
          start: "top top",
          end: function () { return "+=" + Math.round(window.innerHeight * 0.72); },
          scrub: true,
          pin: true,
          pinType: "transform",
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });

      if (scrim) tl.fromTo(scrim,
        { backgroundColor: "rgba(17,18,23,0.45)" },
        { backgroundColor: "rgba(17,18,23,0.9)", immediateRender: false, overwrite: "auto" }, 0);
      if (content) tl.to(content, { autoAlpha: 0.25, overwrite: "auto" }, 0);
      if (statRow) tl.to(statRow, { autoAlpha: 0.25, overwrite: "auto" }, 0);
    });

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  }

  if (document.readyState !== "loading") init();
  else document.addEventListener("DOMContentLoaded", init, { once: true });
})();

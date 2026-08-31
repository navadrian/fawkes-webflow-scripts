/*! heropinsimple — Fawkes site-header registered script — v1.0.0
 *  Freeze + release is 100% CSS (position:sticky hero sheets — see the
 *  consolidated CSS script). This file adds ONE scrubbed ScrollTrigger
 *  timeline per hero (scrim .55 -> .92, content autoAlpha -> .25, media
 *  scale -> 1.03) plus the generic [data-parallax] loop.
 *  No per-frame rect reads, no element generation, no --nav-h measurement.
 */
(function () {
  "use strict";

  if (window.__HERO_PIN_SIMPLE__) return;
  window.__HERO_PIN_SIMPLE__ = true;

  var HERO = ".hero-wrapper",
      MEDIA = ".image-fill",
      SCRIM = ".hero-scrim",
      CONTENT = ".hero-content";

  var SCRIM_RGB = "17,18,23",
      SCRIM_FROM = 0.55,          // == the .hero-scrim base style -> no pop at scroll 0
      SCRIM_TO   = 0.92,
      CONTENT_TO = 0.25,          // autoAlpha floor for the hero copy
      ZOOM       = 1.03,          // subtle depth cue
      PX_AMOUNT  = 100,           // [data-parallax] travel, px per 1.0 of speed
      PX_DEFAULT = 0.15;

  var REDUCED = !!(window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches);

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  function each(list, fn) { Array.prototype.forEach.call(list, fn); }

  /* Hero furniture must never be driven twice: strip data-parallax from the
     hero's own media/scrim/content. Every other [data-parallax] (case-study
     card images at 0.16, etc) is untouched. */
  function disarm(hero) {
    each(hero.querySelectorAll("[data-parallax]"), function (el) {
      if (el.matches(MEDIA) || el.matches(SCRIM) || el.matches(CONTENT)) {
        el.setAttribute("data-parallax-disabled", el.getAttribute("data-parallax"));
        el.removeAttribute("data-parallax");
      }
    });
  }

  function isHeroFurniture(el) {
    return !!el.closest(HERO) &&
      (el.matches(MEDIA) || el.matches(SCRIM) || el.matches(CONTENT));
  }

  /* ONE scrubbed timeline per hero. scrub:true => reverse scroll retraces the
     same values, so there is no snap-back. */
  function buildHero(hero) {
    if (hero.__hps) return;
    hero.__hps = true;

    var media = hero.querySelector(MEDIA),
        scrim = hero.querySelector(SCRIM),
        content = hero.querySelector(CONTENT);
    if (!media && !scrim && !content) return;

    var tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: hero,
        start: "top top",
        end: "bottom top",
        scrub: true,
        invalidateOnRefresh: true
      }
    });

    if (scrim) {
      tl.fromTo(scrim,
        { backgroundColor: "rgba(" + SCRIM_RGB + "," + SCRIM_FROM + ")" },
        { backgroundColor: "rgba(" + SCRIM_RGB + "," + SCRIM_TO + ")",
          immediateRender: false, overwrite: "auto" }, 0);
    }
    if (content) {
      tl.to(content, { autoAlpha: CONTENT_TO, overwrite: "auto" }, 0);
    }
    if (media) {
      /* scale the inner img/video so .image-fill's overflow:hidden clips it */
      var target = media.querySelector("img,video") || media;
      tl.to(target, { scale: ZOOM, transformOrigin: "50% 45%", overwrite: "auto" }, 0);
    }
  }

  function buildParallax() {
    each(document.querySelectorAll("[data-parallax]"), function (el) {
      if (isHeroFurniture(el) || el.__hps) return;
      el.__hps = true;

      var speed = parseFloat(el.getAttribute("data-parallax"));
      if (!speed || isNaN(speed)) speed = PX_DEFAULT;
      var half = (speed * PX_AMOUNT) / 2;
      var scope = el.parentElement || el;

      el.style.willChange = "transform";

      gsap.fromTo(el,
        { y: function () { return half; } },
        { y: function () { return -half; },
          ease: "none",
          immediateRender: false,
          overwrite: "auto",
          scrollTrigger: {
            trigger: scope,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
            invalidateOnRefresh: true
          }
        });
    });
  }

  ready(function () {
    var heroes = document.querySelectorAll(HERO);
    each(heroes, disarm);

    /* graceful no-op: CSS alone still gives the sticky freeze + base scrim */
    if (REDUCED || !window.gsap || !window.ScrollTrigger) return;

    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    each(heroes, buildHero);
    buildParallax();

    window.addEventListener("load", function () { ScrollTrigger.refresh(); });
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
    }
  });
})();

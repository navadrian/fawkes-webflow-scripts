/* Fawkes nav disclosure v1.0.0
 * One desktop disclosure at a time, with keyboard/touch support and the
 * existing mobile hamburger/accordion contract preserved.
 */
(function () {
  'use strict';

  if (window.__fkNavDisclosureV1) return;
  window.__fkNavDisclosureV1 = true;

  var style = document.createElement('style');
  style.setAttribute('data-fk-nav-disclosure', '1');
  style.textContent = [
    '@media (min-width:768px){',
    '.fk-nav-pill{transition:background-color .2s ease,border-color .2s ease,padding-bottom .2s ease}',
    '.fk-nav-pill:not([data-nav-open]){padding-bottom:13px!important}',
    '.fk-nav-pill .fk-nav-links{column-gap:clamp(28px,3.2vw,52px)!important}',
    '.fk-nav-pill .fk-nav-dropdown-wrapper{margin-right:0!important;position:relative;min-width:0}',
    '.fk-nav-pill[data-nav-open]{padding-bottom:calc(13px + var(--fk-nav-open-height,110px))!important;background-color:rgba(6,7,9,.92);border-color:rgba(255,255,255,.18)}',
    '.fk-nav-pill .fk-nav-dropdown-panel{display:none!important}',
    '.fk-nav-pill .fk-nav-dropdown-wrapper.is-open>.fk-nav-dropdown-panel{display:flex!important;width:max-content!important;min-width:220px;max-width:calc(100vw - 48px);white-space:nowrap;padding-top:18px;row-gap:10px}',
    '.fk-nav-pill .fk-nav-dropdown-wrapper>.fk-nav-link{position:relative;transition:font-weight .15s ease,opacity .15s ease}',
    '.fk-nav-pill .fk-nav-dropdown-wrapper.is-open>.fk-nav-link,.fk-nav-pill .fk-nav-dropdown-wrapper>.fk-nav-link.is-current-section{font-weight:600}',
    '.fk-nav-pill .fk-nav-dropdown-wrapper.is-open>.fk-nav-link:after,.fk-nav-pill .fk-nav-dropdown-wrapper>.fk-nav-link.is-current-section:after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:1px;background:rgba(255,255,255,.58)}',
    '.fk-nav-pill .fk-nav-dropdown-item{color:#fff;font-weight:300;white-space:nowrap!important;transition:opacity .15s ease}',
    '.fk-nav-pill .fk-nav-dropdown-item:hover,.fk-nav-pill .fk-nav-dropdown-item:focus-visible{opacity:.72}',
    '.fk-nav-pill .fk-nav-dropdown-item.is-coming-soon:hover,.fk-nav-pill .fk-nav-dropdown-item.is-coming-soon:focus-visible{opacity:1!important;cursor:default}',
    '.fk-nav-pill .fk-nav-links>.fk-nav-link{position:relative}',
    '.fk-nav-pill .fk-nav-links>.fk-nav-link:hover:after,.fk-nav-pill .fk-nav-links>.fk-nav-link:focus-visible:after,.fk-nav-pill .fk-nav-links>.fk-nav-link.w--current:after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:1px;background:rgba(255,255,255,.58)}',
    '.fk-nav-pill .fk-nav-dropdown-wrapper>.fk-nav-link:focus-visible,.fk-nav-pill .fk-nav-dropdown-item:focus-visible{outline:2px solid rgba(242,151,31,.85);outline-offset:4px}',
    '.fk-nav-pill[data-nav-open] .fk-nav-cta-button{background-color:#000;border-color:#fff}',
    '}',
    '.fk-nav-pill .fk-nav-cta-button{transition:background-color .2s ease,border-color .2s ease,color .2s ease}',
    '.fk-nav-pill .fk-nav-cta-button:hover,.fk-nav-pill .fk-nav-cta-button:focus-visible{background-color:#f2971f!important;border-color:#f2971f!important;color:#111217!important}',
    '@media (prefers-reduced-motion:reduce){.fk-nav-pill,.fk-nav-pill .fk-nav-dropdown-wrapper>.fk-nav-link{transition:none!important}}'
  ].join('');
  document.head.appendChild(style);

  function initPill(pill, pillIndex) {
    // Move the actual node so visual, keyboard and mobile reading order agree.
    var links = pill.querySelector('.fk-nav-links');
    var about = links && links.querySelector(':scope > a.fk-nav-link[href="/about"]');
    if (about) links.appendChild(about);
    var wrappers = Array.prototype.slice.call(pill.querySelectorAll('.fk-nav-dropdown-wrapper'));
    var closeTimer = 0;

    function isDesktop() {
      return window.matchMedia('(min-width:768px)').matches;
    }

    function closeDesktop(restoreFocus) {
      window.clearTimeout(closeTimer);
      wrappers.forEach(function (wrapper) {
        var trigger = wrapper.querySelector(':scope > .fk-nav-link');
        wrapper.classList.remove('is-open');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      });
      pill.removeAttribute('data-nav-open');
      pill.style.removeProperty('--fk-nav-open-height');
      if (restoreFocus && restoreFocus.focus) restoreFocus.focus();
    }

    function openDesktop(wrapper) {
      if (!isDesktop()) return;
      window.clearTimeout(closeTimer);
      wrappers.forEach(function (candidate) {
        var candidateTrigger = candidate.querySelector(':scope > .fk-nav-link');
        var active = candidate === wrapper;
        candidate.classList.toggle('is-open', active);
        if (candidateTrigger) candidateTrigger.setAttribute('aria-expanded', active ? 'true' : 'false');
      });
      pill.setAttribute('data-nav-open', 'true');
      var panel = wrapper.querySelector(':scope > .fk-nav-dropdown-panel');
      if (panel) {
        panel.style.left = '0px';
        var bounds = panel.getBoundingClientRect();
        var shift = Math.min(0, window.innerWidth - 24 - bounds.right);
        shift = Math.max(shift, 24 - bounds.left);
        panel.style.left = shift + 'px';
      }
      var openHeight = panel ? Math.ceil(panel.scrollHeight) : 110;
      pill.style.setProperty('--fk-nav-open-height', openHeight + 'px');
    }

    wrappers.forEach(function (wrapper, wrapperIndex) {
      var trigger = wrapper.querySelector(':scope > .fk-nav-link');
      var panel = wrapper.querySelector(':scope > .fk-nav-dropdown-panel');
      if (!trigger || !panel) return;

      var panelId = panel.id || 'fk-nav-panel-' + pillIndex + '-' + wrapperIndex;
      panel.id = panelId;
      trigger.setAttribute('role', 'button');
      trigger.setAttribute('aria-haspopup', 'true');
      trigger.setAttribute('aria-controls', panelId);
      trigger.setAttribute('aria-expanded', 'false');

      if (panel.querySelector('a.w--current,[aria-current="page"]')) {
        trigger.classList.add('is-current-section');
      }

      wrapper.addEventListener('pointerenter', function () {
        if (window.matchMedia('(min-width:768px) and (hover:hover) and (pointer:fine)').matches) openDesktop(wrapper);
      });
      wrapper.addEventListener('focusin', function () { openDesktop(wrapper); });

      trigger.addEventListener('click', function (event) {
        if (!isDesktop()) return;
        event.preventDefault();
        event.stopImmediatePropagation();
        if (wrapper.classList.contains('is-open')) closeDesktop();
        else openDesktop(wrapper);
      }, true);

      trigger.addEventListener('keydown', function (event) {
        if (!isDesktop() || (event.key !== ' ' && event.key !== 'Enter')) return;
        event.preventDefault();
        if (wrapper.classList.contains('is-open')) closeDesktop();
        else openDesktop(wrapper);
      });
    });

    pill.querySelectorAll(':scope > .fk-nav-links > .fk-nav-link, :scope > .fk-nav-logo, :scope > .fk-nav-cta-button').forEach(function (item) {
      item.addEventListener('pointerenter', function () {
        if (isDesktop()) closeDesktop();
      });
    });

    pill.addEventListener('pointerleave', function () {
      if (!isDesktop()) return;
      closeTimer = window.setTimeout(function () {
        if (!pill.matches(':focus-within')) closeDesktop();
      }, 150);
    });
    pill.addEventListener('pointerenter', function () { window.clearTimeout(closeTimer); });
    pill.addEventListener('focusout', function (event) {
      if (isDesktop() && !pill.contains(event.relatedTarget)) closeDesktop();
    });
    pill.addEventListener('keydown', function (event) {
      if (event.key !== 'Escape') return;
      var activeTrigger = pill.querySelector('.fk-nav-dropdown-wrapper.is-open > .fk-nav-link');
      if (activeTrigger) {
        event.preventDefault();
        closeDesktop(activeTrigger);
      }
    });

    document.addEventListener('pointerdown', function (event) {
      if (isDesktop() && !pill.contains(event.target)) closeDesktop();
    });
    window.addEventListener('resize', function () {
      if (!isDesktop()) closeDesktop();
      else {
        var active = pill.querySelector('.fk-nav-dropdown-wrapper.is-open');
        if (active) openDesktop(active);
      }
    });
  }

  function init() {
    document.querySelectorAll('.fk-nav-pill').forEach(initPill);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
;
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
;
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
;
/*! fk-site-interactions — Fawkes site-header registered script — v1.7.0
 *  Freeform Part 4, reduced. Independent blocks, no shared state:
 *    1. Empty-slot hiding for .fk-visual-card, .fk-process-tile and .fk-faq-item
 *    2. Mobile nav hamburger toggle
 *    3. Mobile nav dropdown expand
 *    4. Home industries content and controls are native Webflow Tabs.
 *       Autoplay/progress is provided by the behavior-only native Tabs controller.
 *    5. Home hero KPI reveal — slow sequenced intro: dot scales up, connector
 *       line wipes toward the cards, the KPI plate wipes in from the top, then
 *       the three stat cards rise + fade in staggered (~3.8s total). Inline
 *       styles primed without a transition then revealed (real from-frame);
 *       4.4s failsafe force-shows. Plate uses clip-path, not opacity, because
 *       heropinv3.js owns .hero-stat-row's opacity.
 *    6. Home case-study cards — auto-scroll marquee: wrap children (+1 clone
 *       set) in a flex track, animate translateX. Pause on hover/focus,
 *       respects prefers-reduced-motion.
 *  Pairs with fk-mobilenav.css: the .mobile-menu-open / .is-active /
 *  .dropdown-expanded class names written here are the ones that file
 *  styles — keep them identical in both.
 *  Load in the site HEADER (block 1 should run before first paint so
 *  empty cards never flash), applied last. No GSAP dependency.
 */
(function () {
  "use strict";

  function init() {
    // Hide empty cross-link/visual cards and empty process-tile slots: Webflow's
    // Data API cannot bind element visibility to CMS field emptiness on template
    // pages, so a small runtime check hides slots with blank CMS content (e.g.
    // FawkesLink/FawkesArc's unused 2nd cross-link slot, or a process-tile with
    // no title).
    document.querySelectorAll('.fk-visual-card').forEach(function (card) {
      var title = card.querySelector('.fk-visual-card-title');
      if (title && title.textContent.trim() === '') {
        card.style.display = 'none';
      }
    });
    document.querySelectorAll('.fk-process-tile').forEach(function (tile) {
      var heading = tile.querySelector('.wb-tags-24');
      if (heading && heading.textContent.trim() === '') {
        tile.style.display = 'none';
      }
    });
    // Hide FAQ slots with no question — a CMS template has a fixed number of
    // faq-N-question fields and some pages populate fewer than the maximum.
    // The IX2 accordion handles open/close; this only removes the empty rows.
    document.querySelectorAll('.fk-faq-item').forEach(function (item) {
      var q = item.querySelector('.fk-faq-question-text');
      if (q && q.textContent.trim() === '') {
        item.style.display = 'none';
      }
    });

    // Mobile nav menu toggle. Driven by JS rather than the usual checkbox-hack
    // because the platform rejects <input>/<label> elements outside a Form.
    document.querySelectorAll('.fk-nav-hamburger').forEach(function (burger) {
      burger.addEventListener('click', function () {
        var pill = burger.closest('.fk-nav-pill');
        if (!pill) return;
        var open = pill.classList.toggle('mobile-menu-open');
        burger.classList.toggle('is-active');
        // NAV-8 body scroll lock. position:fixed + top:-scrollY save/restore is
        // required for iOS Safari; do NOT use height:100% on <body> (it clamps
        // scrollTop to 0 and the page sticks at the top on close). Read the
        // scroll offset BEFORE adding .fk-nav-open — once body is position:fixed
        // pageYOffset reads 0.
        if (open) {
          window.__fkScrollY = window.pageYOffset || 0;
          document.documentElement.classList.add('fk-nav-open');
          document.body.classList.add('fk-nav-open');
          document.body.style.top = (-window.__fkScrollY) + 'px';
        } else {
          document.documentElement.classList.remove('fk-nav-open');
          document.body.classList.remove('fk-nav-open');
          document.body.style.top = '';
          window.scrollTo(0, window.__fkScrollY || 0);
        }
      });
    });

    // Inside the mobile menu, tapping an Industries/Products/Resources link
    // expands its submenu instead of navigating (since '#' links do nothing
    // useful); About Us and other real links navigate normally.
    document.querySelectorAll('.fk-nav-dropdown-wrapper > .fk-nav-link').forEach(function (link) {
      link.addEventListener('click', function (e) {
        if (window.innerWidth > 767) return;
        e.preventDefault();
        var open = link.closest('.fk-nav-dropdown-wrapper').classList.toggle('dropdown-expanded');
        link.setAttribute('aria-expanded', String(open));
      });
    });

    // Home industries: native Tabs and native component props own all slide content.

    // 5. Home hero KPI reveal — a slow, sequenced intro:
    //    (a) the pulse dot scales up
    //    (b) the connector line draws toward the cards (clip-path wipe L->R)
    //    (c) the KPI plate/background wipes in from the top (clip-path)
    //    (d) the three stat cards rise + fade in, staggered
    // Each element is primed WITHOUT a transition, the hidden state is forced
    // to lay out, THEN the transition is added and the target set — otherwise
    // setting the prop and the transition together only animates the way OUT.
    // The plate uses clip-path (NOT opacity) because heropinv3.js owns
    // .hero-stat-row's opacity for its scroll-scrub fade. rAF + timeout
    // trigger; failsafe force-shows if a throttled tab never runs it.
    var kpiRow = document.querySelector('.hero-stat-row');
    if (kpiRow && !document.querySelector('.home-hero-state-b') &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        window.matchMedia('(min-width: 768px)').matches) {
      var kpiTarget = document.querySelector('.fk-hero-target');
      var dotLg = kpiTarget ? kpiTarget.querySelector('.fk-hero-dot-lg') : null;
      var connector = kpiTarget ? kpiTarget.querySelector('.fk-hero-connector') : null;
      var statCards = Array.prototype.slice.call(kpiRow.querySelectorAll('.fk-stat-card'));

      // { el, prime:{prop:val}, reveal:{prop:val}, trans, delay(seconds) }
      var kpiSteps = [];
      if (dotLg) kpiSteps.push({
        el: dotLg,
        prime: { opacity: '0', transform: 'scale(.35)' },
        reveal: { opacity: '1', transform: 'scale(1)' },
        trans: 'opacity .8s ease, transform .9s cubic-bezier(.18,.7,.3,1)',
        delay: 0.25
      });
      if (connector) kpiSteps.push({
        el: connector,
        prime: { opacity: '0', 'clip-path': 'inset(0 100% 0 0)', '-webkit-clip-path': 'inset(0 100% 0 0)' },
        reveal: { opacity: '1', 'clip-path': 'inset(0 0 0 0)', '-webkit-clip-path': 'inset(0 0 0 0)' },
        trans: 'opacity .35s ease, clip-path .85s ease, -webkit-clip-path .85s ease',
        delay: 0.95
      });
      kpiSteps.push({ // the plate / backing card — clip-path, not opacity
        el: kpiRow,
        prime: { 'clip-path': 'inset(0 0 100% 0)', '-webkit-clip-path': 'inset(0 0 100% 0)' },
        reveal: { 'clip-path': 'inset(0 0 0% 0)', '-webkit-clip-path': 'inset(0 0 0% 0)' },
        trans: 'clip-path .9s ease, -webkit-clip-path .9s ease',
        delay: 1.7
      });
      statCards.forEach(function (c, i) {
        kpiSteps.push({
          el: c,
          prime: { opacity: '0', transform: 'translateY(18px)' },
          reveal: { opacity: '1', transform: 'translateY(0)' },
          trans: 'opacity .8s ease, transform .8s ease',
          delay: 2.4 + i * 0.28
        });
      });

      function kpiApply(step, map) {
        for (var k in map) {
          if (map.hasOwnProperty(k)) step.el.style.setProperty(k, map[k]);
        }
      }
      // prime: no transition yet
      kpiSteps.forEach(function (s) {
        s.el.style.setProperty('transition', 'none');
        kpiApply(s, s.prime);
      });
      void kpiRow.offsetWidth; // force the hidden state to lay out

      function revealKPI() {
        kpiSteps.forEach(function (s) {
          s.el.style.setProperty('transition', s.trans);
          s.el.style.setProperty('transition-delay', s.delay + 's');
          kpiApply(s, s.reveal);
        });
      }
      if (typeof window.requestAnimationFrame === 'function' && !document.hidden) {
        window.requestAnimationFrame(function () { window.requestAnimationFrame(revealKPI); });
      }
      window.setTimeout(revealKPI, 90);
      // failsafe: after the whole sequence would have finished, hard-clear
      window.setTimeout(function () {
        kpiSteps.forEach(function (s) {
          s.el.style.setProperty('transition', 'none');
          s.el.style.setProperty('transition-delay', '0s');
          s.el.style.removeProperty('clip-path');
          s.el.style.removeProperty('-webkit-clip-path');
          if (s.el !== kpiRow) {
            // leave .hero-stat-row's opacity to heropinv3's scroll-scrub
            s.el.style.opacity = '1';
            s.el.style.transform = 'none';
          }
        });
      }, 4400);
    }

    // Manual case-study navigation is initialized below; no autoplay or clones.
  }

  function initReviewInteractions() {
    var row = document.querySelector('.fk-home-case-section-exact .case-study-row');
    if (row && !row.dataset.fkManualCases) {
      row.dataset.fkManualCases = 'true';
      row.classList.add('fk-manual-cases');
      row.setAttribute('aria-label', 'Case studies');
      var cards = Array.prototype.slice.call(row.children);
      var heading = row.parentElement.querySelector('.home-case-label-exact');
      var controls = document.createElement('div');
      controls.className = 'fk-case-controls';
      var index = 0;
      function button(label, glyph, delta) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'fk-case-control';
        b.setAttribute('aria-label', label);
        b.textContent = glyph;
        b.addEventListener('click', function () {
          index = Math.max(0, Math.min(cards.length - 1, index + delta));
          show(true);
        });
        controls.appendChild(b);
        return b;
      }
      var previous = button('Previous case study', '\u2190', -1);
      var next = button('Next case study', '\u2192', 1);
      if (heading) {
        var head = document.createElement('div');
        head.className = 'fk-case-heading-row';
        heading.parentElement.insertBefore(head, heading);
        head.appendChild(heading);
        head.appendChild(controls);
      } else row.parentElement.insertBefore(controls, row);
      function alignTrack() {
        var inset = heading ? heading.getBoundingClientRect().left : row.parentElement.getBoundingClientRect().left;
        row.style.setProperty('--fk-case-inset', Math.max(0, inset) + 'px');
        var parent = row.parentElement;
        row.style.setProperty('--fk-case-origin', (parent.getBoundingClientRect().left + parseFloat(window.getComputedStyle(parent).paddingLeft)) + 'px');
        row.style.setProperty('--fk-case-viewport', document.documentElement.clientWidth + 'px');
      }
      function updateButtons() {
        previous.disabled = index === 0;
        next.disabled = index === cards.length - 1;
      }
      function show(smooth) {
        if (!cards.length) return;
        var target = cards[index].offsetLeft - cards[0].offsetLeft;
        row.scrollTo({left: target, behavior: smooth && !window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'smooth' : 'instant'});
        updateButtons();
      }
      var scrollTimer;
      row.addEventListener('scroll', function () {
        window.clearTimeout(scrollTimer);
        scrollTimer = window.setTimeout(function () {
          var closest = Infinity;
          cards.forEach(function (card, i) {
            var distance = Math.abs(card.offsetLeft - cards[0].offsetLeft - row.scrollLeft);
            if (distance < closest) { closest = distance; index = i; }
          });
          updateButtons();
        }, 150);
      }, {passive:true});
      window.addEventListener('resize', function () { alignTrack(); show(false); });
      alignTrack();
      show(false);
    }

    var toc = document.querySelector('.article-toc-rt');
    if (toc && !toc.dataset.fkActiveContents) {
      toc.dataset.fkActiveContents = 'true';
      var entries = Array.prototype.map.call(toc.querySelectorAll('a[href^="#"]'), function (link) {
        var id;
        try { id = decodeURIComponent(link.hash.slice(1)); } catch (_) { id = link.hash.slice(1); }
        return {link: link, section: document.getElementById(id)};
      }).filter(function (entry) { return entry.section; });
      // Keep CMS anchors reliable after the article header joins the content column.
      // Webflow's delegated smooth-scroll handler can cancel these clicks.
      entries.forEach(function (entry) {
        entry.link.addEventListener('click', function (event) {
          if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          event.stopPropagation();
          window.scrollTo({top: Math.max(0, window.scrollY + entry.section.getBoundingClientRect().top - 120), behavior: 'instant'});
          history.replaceState(null, '', entry.link.hash);
          updateContents();
        });
      });
      var pending = false;
      var active;
      function updateContents() {
        pending = false;
        if (!entries.length) return;
        var current = entries[0];
        entries.forEach(function (entry) { if (entry.section.getBoundingClientRect().top <= 150) current = entry; });
        if (current === active) return;
        active = current;
        entries.forEach(function (entry) {
          var selected = entry === current;
          entry.link.classList.toggle('is-current-section', selected);
          if (selected) entry.link.setAttribute('aria-current', 'location');
          else entry.link.removeAttribute('aria-current');
        });
        var linkBox = current.link.getBoundingClientRect();
        var tocBox = toc.getBoundingClientRect();
        if (linkBox.top < tocBox.top || linkBox.bottom > tocBox.bottom) {
          toc.scrollTop += linkBox.top - tocBox.top - 12;
        }
      }
      window.addEventListener('scroll', function () {
        if (!pending) { pending = true; window.requestAnimationFrame(updateContents); }
      }, {passive: true});
      window.addEventListener('resize', updateContents);
      window.addEventListener('hashchange', updateContents);
      updateContents();
    }
  }

  // The original relied on DOMContentLoaded. A registered script can be injected
  // after that event has already fired, in which case the listener would never
  // run — so dispatch immediately when the document is already parsed.
  if (document.readyState !== 'loading') {
    init();
    initReviewInteractions();
  } else {
    document.addEventListener('DOMContentLoaded', function () { init(); initReviewInteractions(); }, { once: true });
  }
})();
;
/*! fk-home-hero-rotation — homepage A/B hero stage
 *
 * This deliberately owns only a hero that has the authored `.home-hero-state-b`
 * wrapper. It leaves every other `.hero-wrapper` (and their normal parallax)
 * alone. `window.FKHomeHeroRotation` is a small public pause/resume hook for an
 * optional authored control; buttons with `[data-fk-home-hero-pause]` are wired
 * automatically when present.
 */
(function () {
  "use strict";

  var ROOT_CLASS = "fk-home-hero-rotation";
  var REDUCED_QUERY = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)");

  function reducedMotion() {
    return !!(REDUCED_QUERY && REDUCED_QUERY.matches);
  }

  function addStyles() {
    if (document.getElementById("fk-home-hero-rotation-css")) return;
    var style = document.createElement("style");
    style.id = "fk-home-hero-rotation-css";
    style.textContent =
      "." + ROOT_CLASS + "{position:relative;isolation:isolate;}" +
      "." + ROOT_CLASS + " .home-hero-state-b{position:absolute;inset:0;z-index:2;overflow:hidden;opacity:0;visibility:hidden;pointer-events:none;}" +
      "." + ROOT_CLASS + " .home-hero-state-b.is-fk-visible{visibility:visible;}" +
      // Transform/overscan are intentionally not set here: heropinv3 owns both
      // state images' parallax transforms and their 132vw responsive footprint.
      "." + ROOT_CLASS + " .home-hero-media-b{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover;object-position:50% 61.6%;}" +
      "." + ROOT_CLASS + " .home-hero-scrim-b{position:absolute;inset:0;background:linear-gradient(90deg,rgba(17,18,23,.72) 0%,rgba(17,18,23,.44) 46%,rgba(17,18,23,.12) 100%);}" +
      "." + ROOT_CLASS + " .home-hero-kpi-b{position:absolute;left:45.7%;top:35.9%;width:clamp(280px,24.16vw,430px);z-index:2;display:flex;gap:9px;padding:10px;background:rgba(0,0,0,.1);border:1px solid rgba(255,255,255,.3);border-radius:5px;box-sizing:border-box;}" +
      "." + ROOT_CLASS + " .home-hero-stat-card{flex:1 1 0;min-width:0;min-height:98px;aspect-ratio:110/98;display:grid;grid-template-rows:26px 36px 14px;align-content:center;justify-items:center;align-items:center;text-align:center;gap:2px;padding:7px;color:#fff;background:rgba(0,0,0,.5);border:1px solid rgba(255,255,255,.18);border-radius:5px;box-sizing:border-box;backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);}" +
      "." + ROOT_CLASS + " .home-hero-stat-card .home-hero-stat-label{order:0;text-transform:uppercase;font-size:10px;line-height:1.5;letter-spacing:-.5px;max-width:102px;text-align:center;}" +
      "." + ROOT_CLASS + " .home-hero-stat-card .home-hero-stat-value{order:1;font-size:32px;line-height:1;font-weight:700;}" +
      "." + ROOT_CLASS + " .home-hero-stat-card .home-hero-stat-unit{order:2;font-size:10px;line-height:1.15;}" +
      "." + ROOT_CLASS + " .home-hero-stat-card{font-family:Inter,sans-serif;}" +
      "." + ROOT_CLASS + " .home-hero-target-b{position:absolute;inset:0;z-index:2;pointer-events:none;}" +
      "." + ROOT_CLASS + " .hero-content{z-index:4;}" +
      "." + ROOT_CLASS + " .fk-home-hero-delay{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none;}" +
      "." + ROOT_CLASS + " [data-fk-home-hero-pause]{bottom:64px;}" +
      "@media (max-width:767px){." + ROOT_CLASS + " .home-hero-kpi-b{left:50%;top:auto;bottom:var(--fk-home-copy-clearance,238px);width:min(82vw,320px);transform:translateX(-50%);}" +
      "." + ROOT_CLASS + " .home-hero-stat-card{min-height:76px;aspect-ratio:auto;grid-template-rows:23px 24px 11px;padding:7px;}" +
      "." + ROOT_CLASS + " .home-hero-stat-value{font-size:22px!important;}" +
      "." + ROOT_CLASS + " .home-hero-target-b{display:none;}" +
      "." + ROOT_CLASS + " [data-fk-home-hero-pause]{top:84px;bottom:auto;right:20px;}}";
    document.head.appendChild(style);
  }

  function set(el, map) {
    if (!el) return;
    Object.keys(map).forEach(function (key) { el.style.setProperty(key, map[key]); });
  }

  function decodeImage(image) {
    if (!image) return Promise.resolve(false);
    function loaded() {
      if (image.naturalWidth === 0) return Promise.resolve(false);
      if (typeof image.decode !== "function") return Promise.resolve(true);
      return image.decode().then(function () { return true; }, function () { return true; });
    }
    if (image.complete) return loaded();
    return new Promise(function (resolve) {
      image.addEventListener("load", function onLoad() {
        image.removeEventListener("error", onError);
        loaded().then(resolve);
      }, { once: true });
      function onError() { resolve(false); }
      image.addEventListener("error", onError, { once: true });
    });
  }

  function Rotation(hero, stateB) {
    this.hero = hero;
    this.b = stateB;
    this.aImage = hero.querySelector(":scope > .image-fill") || hero.querySelector(".image-fill");
    this.aScrim = hero.querySelector(":scope > .hero-scrim") || hero.querySelector(".hero-scrim");
    this.aRow = hero.querySelector(":scope > .hero-stat-row") || hero.querySelector(".hero-stat-row");
    this.aTarget = hero.querySelector(":scope > .fk-hero-target") || hero.querySelector(".fk-hero-target");
    this.aDot = this.aTarget && this.aTarget.querySelector(".fk-hero-dot-lg");
    this.aConnector = this.aTarget && this.aTarget.querySelector(".fk-hero-connector");
    this.aCards = this.aRow ? Array.prototype.slice.call(this.aRow.querySelectorAll(".fk-stat-card")) : [];
    this.bKpi = stateB.querySelector(".home-hero-kpi-b");
    this.bTarget = stateB.querySelector(".home-hero-target-b");
    this.bDot = this.bTarget && this.bTarget.querySelector(".home-hero-dot-b");
    this.bConnector = this.bTarget && this.bTarget.querySelector(".home-hero-connector-b");
    this.bCards = this.bKpi ? Array.prototype.slice.call(this.bKpi.querySelectorAll(".home-hero-stat-card")) : [];
    this.pauseButton = hero.querySelector("[data-fk-home-hero-pause]") || document.querySelector("[data-fk-home-hero-pause]");
    this.animations = [];
    this.pauseReasons = {};
    this.destroyed = false;
    this.isRunning = false;
    // Every started sequence has an identity. A cancelled predecessor may have
    // an async `finished` rejection queued after a resize/restart; it must not
    // be able to fall back A over its successor.
    this.runId = 0;
    this.delayNode = document.createElement("span");
    this.delayNode.className = "fk-home-hero-delay";
    this.delayNode.setAttribute("aria-hidden", "true");
    hero.appendChild(this.delayNode);
  }

  Rotation.prototype.isPaused = function () {
    return Object.keys(this.pauseReasons).length > 0;
  };

  Rotation.prototype.track = function (animation) {
    var self = this;
    this.animations.push(animation);
    if (this.isPaused()) animation.pause();
    animation.finished.then(function () { self.untrack(animation); }, function () { self.untrack(animation); });
    return animation;
  };

  Rotation.prototype.untrack = function (animation) {
    var index = this.animations.indexOf(animation);
    if (index !== -1) this.animations.splice(index, 1);
  };

  Rotation.prototype.animate = function (el, frames, options) {
    if (!el || this.destroyed) return null;
    return this.track(el.animate(frames, options));
  };

  // `fill:forwards` is useful while a sequence is in flight, but leaving its
  // effect alive makes it win over the next sequence's inline prime styles.
  // Commit the final computed values, then cancel each completed effect.
  Rotation.prototype.awaitAnimation = function (animation) {
    var self = this;
    return animation.finished.then(function () {
      try {
        if (typeof animation.commitStyles === "function") {
          animation.commitStyles();
        } else if (animation.effect && animation.effect.target) {
          // Older WAAPI implementations lack commitStyles. Persist precisely
          // the few properties this controller animates before dropping fill.
          var target = animation.effect.target;
          var computed = window.getComputedStyle(target);
          set(target, {
            opacity: computed.opacity,
            transform: computed.transform,
            "clip-path": computed.getPropertyValue("clip-path"),
            "-webkit-clip-path": computed.getPropertyValue("-webkit-clip-path")
          });
        }
        animation.cancel();
      } catch (ignore) {}
      self.untrack(animation);
      return true;
    }, function () {
      self.untrack(animation);
      return false;
    });
  };

  Rotation.prototype.wait = function (milliseconds) {
    var animation = this.animate(this.delayNode, [{ opacity: 0 }, { opacity: 0 }], {
      duration: milliseconds, fill: "both", easing: "linear"
    });
    return animation ? this.awaitAnimation(animation) : Promise.resolve(false);
  };

  Rotation.prototype.pause = function (reason) {
    if (this.destroyed || this.pauseReasons[reason]) return;
    this.pauseReasons[reason] = true;
    this.animations.slice().forEach(function (animation) { animation.pause(); });
    if (reason === "user") this.syncPauseControl();
  };

  Rotation.prototype.resume = function (reason) {
    var self = this;
    if (this.destroyed || !this.pauseReasons[reason]) return;
    delete this.pauseReasons[reason];
    if (!this.isPaused()) this.animations.slice().forEach(function (animation) { animation.play(); });
    // A pause can occur between animation construction and its first frame.
    // Re-asserting play here lets WAAPI own elapsed time, rather than a timer.
    window.requestAnimationFrame(function () {
      if (!self.isPaused()) self.animations.slice().forEach(function (animation) { animation.play(); });
    });
    if (reason === "user") this.syncPauseControl();
  };

  Rotation.prototype.setPauseControlVisible = function (visible) {
    if (!this.pauseButton) return;
    this.pauseButton.style.display = visible ? "inline-flex" : "none";
    if (!visible) {
      this.pauseButton.setAttribute("aria-pressed", "false");
      this.pauseButton.setAttribute("aria-label", "Pause background rotation");
      this.pauseButton.textContent = "Pause";
    }
  };

  Rotation.prototype.syncPauseControl = function () {
    if (!this.pauseButton) return;
    var paused = !!this.pauseReasons.user;
    this.pauseButton.setAttribute("aria-pressed", paused ? "true" : "false");
    this.pauseButton.setAttribute("aria-label", paused ? "Resume background rotation" : "Pause background rotation");
    this.pauseButton.textContent = paused ? "Resume" : "Pause";
  };

  Rotation.prototype.cancelAll = function () {
    this.animations.slice().forEach(function (animation) { animation.cancel(); });
    this.animations = [];
  };

  Rotation.prototype.setBActive = function (active) {
    this.b.classList.toggle("is-fk-visible", active);
    this.b.setAttribute("aria-hidden", active ? "false" : "true");
    if (active) this.b.removeAttribute("inert");
    else this.b.setAttribute("inert", "");
    [this.aRow, this.aTarget].forEach(function (el) {
      if (!el) return;
      el.setAttribute("aria-hidden", active ? "true" : "false");
      if (active) el.setAttribute("inert", "");
      else el.removeAttribute("inert");
    });
  };

  Rotation.prototype.primeA = function () {
    set(this.aTarget, { opacity: "0" });
    set(this.aDot, { opacity: "0", transform: "scale(.35)" });
    set(this.aConnector, { opacity: "0", "clip-path": "inset(0 100% 0 0)", "-webkit-clip-path": "inset(0 100% 0 0)" });
    set(this.aRow, { opacity: "0", "clip-path": "inset(0 0 100% 0)", "-webkit-clip-path": "inset(0 0 100% 0)" });
    this.aCards.forEach(function (card) { set(card, { opacity: "0", transform: "translateY(18px)" }); });
  };

  Rotation.prototype.primeB = function () {
    set(this.bKpi, { opacity: "1", "clip-path": "inset(0 0 100% 0)", "-webkit-clip-path": "inset(0 0 100% 0)" });
    set(this.bDot, { opacity: "0", transform: "scale(.35)" });
    set(this.bConnector, { opacity: "0", "clip-path": "inset(0 0 100% 0)", "-webkit-clip-path": "inset(0 0 100% 0)" });
    this.bCards.forEach(function (card) { set(card, { opacity: "0", transform: "translateY(14px)" }); });
  };

  Rotation.prototype.revealA = function () {
    var self = this, jobs = [], mobile = window.matchMedia("(max-width:767px)").matches;
    if (!mobile) {
      // The children own the delayed entrance. A 1ms parent fade can commit
      // a near-zero opacity at the animation boundary in Chromium.
      set(this.aTarget, { opacity: "1" });
      if (this.aDot) jobs.push(this.animate(this.aDot,
        [{ opacity: 0, transform: "scale(.35)" }, { opacity: 1, transform: "scale(1)" }],
        { duration: 900, delay: 250, fill: "forwards", easing: "cubic-bezier(.18,.7,.3,1)" }));
      if (this.aConnector) jobs.push(this.animate(this.aConnector,
        [{ opacity: 0, clipPath: "inset(0 100% 0 0)", webkitClipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)", webkitClipPath: "inset(0 0 0 0)" }],
        { duration: 850, delay: 950, fill: "forwards", easing: "ease" }));
      if (this.aRow) jobs.push(this.animate(this.aRow,
        [{ opacity: 1, clipPath: "inset(0 0 100% 0)", webkitClipPath: "inset(0 0 100% 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)", webkitClipPath: "inset(0 0 0 0)" }],
        { duration: 900, delay: 1700, fill: "forwards", easing: "ease" }));
    } else if (this.aRow) {
      jobs.push(this.animate(this.aRow, [{ opacity: 0 }, { opacity: 1 }], { duration: 250, fill: "forwards", easing: "ease-out" }));
    }
    this.aCards.forEach(function (card, index) {
      jobs.push(self.animate(card,
        [{ opacity: 0, transform: "translateY(" + (mobile ? 10 : 18) + "px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: mobile ? 500 : 800, delay: (mobile ? 180 : 2400) + index * (mobile ? 120 : 280), fill: "forwards", easing: "ease-out" }));
    });
    return Promise.all(jobs.filter(Boolean).map(function (animation) { return self.awaitAnimation(animation); })).then(function (results) {
      return results.every(function (ok) { return ok; });
    });
  };

  Rotation.prototype.revealB = function () {
    var self = this, mobile = window.matchMedia("(max-width:767px)").matches, jobs = [];
    if (!mobile && this.bDot) jobs.push(this.animate(this.bDot,
      [{ opacity: 0, transform: "scale(.35)" }, { opacity: 1, transform: "scale(1)" }],
      { duration: 900, delay: 250, fill: "forwards", easing: "cubic-bezier(.18,.7,.3,1)" }));
    if (!mobile && this.bConnector) jobs.push(this.animate(this.bConnector,
      [{ opacity: 0, clipPath: "inset(0 0 100% 0)", webkitClipPath: "inset(0 0 100% 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)", webkitClipPath: "inset(0 0 0 0)" }],
      { duration: 850, delay: 950, fill: "forwards", easing: "ease" }));
    if (this.bKpi) jobs.push(this.animate(this.bKpi,
      [{ opacity: 1, clipPath: "inset(0 0 100% 0)", webkitClipPath: "inset(0 0 100% 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)", webkitClipPath: "inset(0 0 0 0)" }],
      { duration: 900, delay: 1700, fill: "forwards", easing: "ease" }));
    this.bCards.forEach(function (card, index) {
      jobs.push(self.animate(card,
        [{ opacity: 0, transform: "translateY(" + (mobile ? 10 : 16) + "px)" }, { opacity: 1, transform: "translateY(0)" }],
        { duration: mobile ? 450 : 800, delay: (mobile ? 100 : 2400) + index * (mobile ? 120 : 280), fill: "forwards", easing: "ease-out" }));
    });
    return Promise.all(jobs.filter(Boolean).map(function (animation) { return self.awaitAnimation(animation); })).then(function (results) {
      return results.every(function (ok) { return ok; });
    });
  };

  Rotation.prototype.crossfade = function (toB) {
    var self = this;
    // B must be exposed to assistive technology only for its active stage.
    // It is still pointer-events:none because all hero annotation/KPI content
    // is decorative; shared hero copy remains the single readable heading.
    this.setBActive(true);
    if (!toB) {
      set(this.aImage, { opacity: "0" });
      set(this.aScrim, { opacity: "0" });
      this.primeA();
    } else {
      this.primeB();
    }
    var leaving = toB ? [this.aImage, this.aScrim, this.aTarget, this.aRow] : [this.b];
    var entering = toB ? [this.b] : [this.aImage, this.aScrim];
    var jobs = [];
    leaving.forEach(function (el) { if (el) jobs.push(self.animate(el, [{ opacity: 1 }, { opacity: 0 }], { duration: 800, fill: "forwards", easing: "ease-in-out" })); });
    entering.forEach(function (el) { if (el) jobs.push(self.animate(el, [{ opacity: 0 }, { opacity: 1 }], { duration: 800, fill: "forwards", easing: "ease-in-out" })); });
    return Promise.all(jobs.filter(Boolean).map(function (animation) { return self.awaitAnimation(animation); })).then(function (results) {
      if (toB) {
        set(self.aImage, { opacity: "0" });
        set(self.aScrim, { opacity: "0" });
      } else {
        self.setBActive(false);
        set(self.b, { opacity: "0" });
      }
      return results.every(function (ok) { return ok; });
    });
  };

  Rotation.prototype.fallbackA = function () {
    this.runId += 1;
    this.isRunning = false;
    this.cancelAll();
    this.setPauseControlVisible(false);
    this.setBActive(false);
    set(this.b, { opacity: "0", visibility: "hidden" });
    set(this.aImage, { opacity: "1" });
    set(this.aScrim, { opacity: "1" });
    set(this.aTarget, { opacity: "1" });
    set(this.aDot, { opacity: "1", transform: "scale(1)" });
    set(this.aConnector, { opacity: "1", "clip-path": "inset(0)", "-webkit-clip-path": "inset(0)" });
    set(this.aRow, { opacity: "1", "clip-path": "inset(0)", "-webkit-clip-path": "inset(0)" });
    this.aCards.forEach(function (card) { set(card, { opacity: "1", transform: "translateY(0)" }); });
  };

  Rotation.prototype.run = function () {
    var self = this;
    if (this.destroyed || this.isRunning) return;
    var runId = ++this.runId;
    this.isRunning = true;
    this.primeA();
    set(this.aImage, { opacity: "1" });
    set(this.aScrim, { opacity: "1" });
    this.setBActive(false);
    this.b.style.removeProperty("visibility");
    set(this.b, { opacity: "0" });
    this.setPauseControlVisible(true);
    this.syncPauseControl();
    function requireComplete(value) {
      if (!value || self.destroyed || !self.isRunning || runId !== self.runId) {
        throw new Error("hero rotation interrupted");
      }
    }
    (async function () {
      try {
        while (!self.destroyed && self.isRunning && runId === self.runId) {
          requireComplete(await self.revealA());
          requireComplete(await self.wait(5000));
          requireComplete(await self.crossfade(true));
          requireComplete(await self.revealB());
          requireComplete(await self.wait(5000));
          requireComplete(await self.crossfade(false));
        }
      } catch (error) {
        // Do not let a cancelled, older loop reset a newer desktop restart.
        if (!self.destroyed && runId === self.runId) self.fallbackA();
      }
    })();
  };

  Rotation.prototype.destroy = function () {
    this.destroyed = true;
    this.cancelAll();
    if (this.delayNode.parentNode) this.delayNode.parentNode.removeChild(this.delayNode);
  };

  function init() {
    var hero = null;
    // `:has` is not supported in a few older embedded browsers; use a safe
    // parent lookup if selector parsing rejects it.
    try { hero = document.querySelector(".hero-wrapper:has(.home-hero-state-b)"); } catch (ignore) {}
    if (!hero) {
      var b = document.querySelector(".home-hero-state-b");
      hero = b && b.closest(".hero-wrapper");
    }
    if (!hero || hero.__fkHomeHeroRotation) return;
    var stateB = hero.querySelector(".home-hero-state-b");
    if (!stateB) return;

    addStyles();
    hero.classList.add(ROOT_CLASS);
    // Webflow keeps the drafted B wrapper display:none until this controller is
    // present. It remains visually hidden by the scoped opacity/visibility CSS
    // above until its photo is decoded and the crossfade begins.
    stateB.style.display = "block";
    hero.__fkHomeHeroRotation = true;
    // This is also the integration gate for the legacy KPI transition block.
    window.__FK_HOME_HERO_ROTATION_ACTIVE__ = true;

    var controller = new Rotation(hero, stateB);
    controller.setBActive(false);
    window.FKHomeHeroRotation = controller;
    window.__FK_HOME_HERO_ROTATION__ = controller;

    var media = stateB.querySelector("img.home-hero-media-b, .home-hero-media-b img");
    if (media) media.setAttribute("sizes", "132vw");
    stateB.querySelectorAll(".home-hero-media-b img").forEach(function (image) { image.setAttribute("sizes", "132vw"); });

    document.addEventListener("visibilitychange", function () {
      if (document.hidden) controller.pause("visibility");
      else controller.resume("visibility");
    });
    if (document.hidden) controller.pause("visibility");
    var pauseButtons = hero.querySelectorAll("[data-fk-home-hero-pause]");
    if (!pauseButtons.length && controller.pauseButton) pauseButtons = [controller.pauseButton];
    Array.prototype.forEach.call(pauseButtons, function (button) {
      button.addEventListener("click", function () {
        if (controller.pauseReasons.user) {
          controller.resume("user");
        } else {
          controller.pause("user");
        }
      });
    });

    // Measure the copy rather than guessing a phone offset: headline wrapping
    // and short viewports must never put the KPI plate on top of the text.
    var mobileQuery = window.matchMedia("(max-width:767px)");
    var sharedCopy = hero.querySelector(':scope > .hero-content');
    function syncCopyClearance() {
      if (!sharedCopy) return;
      var clearance = hero.getBoundingClientRect().bottom - sharedCopy.getBoundingClientRect().top + 24;
      hero.style.setProperty('--fk-home-copy-clearance', Math.max(200, clearance) + 'px');
    }
    syncCopyClearance();
    if (window.ResizeObserver) {
      var copyObserver = new ResizeObserver(syncCopyClearance);
      copyObserver.observe(hero);
      if (sharedCopy) copyObserver.observe(sharedCopy);
    }
    function syncViewport() {
      if (controller.destroyed) return;
      syncCopyClearance();
      if (reducedMotion()) {
        controller.fallbackA();
        return;
      }
      if (controller.isRunning) return;
      decodeImage(media).then(function (ready) {
        if (ready && !controller.destroyed && !reducedMotion()) controller.run();
        else if (!ready) controller.fallbackA();
      }, function () { controller.fallbackA(); });
    }
    var viewportListener = function () { syncViewport(); };
    if (mobileQuery.addEventListener) mobileQuery.addEventListener("change", viewportListener);
    else if (mobileQuery.addListener) mobileQuery.addListener(viewportListener);
    if (REDUCED_QUERY) {
      if (REDUCED_QUERY.addEventListener) REDUCED_QUERY.addEventListener("change", viewportListener);
      else if (REDUCED_QUERY.addListener) REDUCED_QUERY.addListener(viewportListener);
    }
    if (reducedMotion()) {
      controller.fallbackA();
      return;
    }
    // Do not reveal B until its authored photo has decoded. Route the initial
    // load through the same viewport guard as later media-query changes, so a
    // late decode cannot restart rotation after the viewport becomes mobile.
    syncViewport();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
;
/* Home carousel: stretch the existing native destination anchor over the card.
   The carousel's own controller continues to update that anchor's href. */
(function () {
  "use strict";

  function labelForHref(href) {
    var path = (href || "").split("?")[0].replace(/\/$/, "");
    var slug = path.split("/").pop() || "industry";
    return "Explore " + slug.replace(/-/g, " ");
  }

  function init() {
    document.querySelectorAll(".fk-visual-card").forEach(function (card) {
      if (card.classList.contains("fk-home-industry-slide")) return;
      var link = card.querySelector(".fk-vc-arrow[href]");
      if (!link) return;
      card.classList.add("is-full-card-link");
      function syncLabel() {
        link.setAttribute("aria-label", labelForHref(link.getAttribute("href")));
      }
      syncLabel();
      if (window.MutationObserver) {
        new MutationObserver(syncLabel).observe(link, { attributes: true, attributeFilter: ["href"] });
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();
;
/* CMS option presentation and dynamic current-item exclusion in existing bundle. */
(function () {
 'use strict';
 function text(tag, cls, value) { var e=document.createElement(tag); e.className=cls; e.textContent=value; return e; }
 function syncMoreCases() {
  document.querySelectorAll('[data-fk-more-cases] .w-dyn-item').forEach(function(item) {
   var marker=item.querySelector('[data-fk-case-slug]'); var slug=marker&&marker.textContent.trim(); if(!slug) return;
   var path='/case-studies/'+slug;
   item.hidden=location.pathname.replace(/\/$/,'')===path;
   item.querySelectorAll('a.fk-cs-card-link').forEach(function(a){if(a.getAttribute('href')!==path)a.href=path;});
  });
 }
 function watchMoreCases() {
  var host=document.querySelector('[data-fk-more-cases]'); if(!host) return;
  syncMoreCases();
  if(host.__fkMoreCasesObserver) return;
  host.setAttribute('data-fk-more-cases-ready','true');
  host.__fkMoreCasesObserver=new MutationObserver(syncMoreCases);
  host.__fkMoreCasesObserver.observe(host,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
 }
 function run() {
  // Exact line endings from the main Figma product frames. Phone/tablet wrapping remains natural.
  var featureLines = [
   ['Continuous health tracking, degradation velocity and','remaining useful life across your assets.'],
   ['Early identification of thermal risk, cell imbalance and anomalies','before they affect operations.'],
   ['Usage behaviour, degradation drivers and','economic impact across the asset lifecycle.'],
   ['Independent measure of battery condition relative to when it was new, based','on electrochemical data rather than age or odometer reading.'],
   ['Physics-based valuation of remaining battery worth, giving financiers and','resellers an independent, data-backed basis for pricing decisions.'],
   ['Current and projected range based on real battery condition today and','degradation trajectory over time, delivered as a visual output.'],
   ['Size the system against real battery ageing behaviour with CapEx calculated','directly from the configuration output.'],
   ['Compare sizing configurations, cell chemistries, SoC windows, dispatch','strategies and thermal conditions side by side before committing capital.'],
   ['Model how much energy the system will actually deliver across its full','operational lifetime under your specific operating conditions.']
  ];
  document.querySelectorAll('.fk-product-feature-right > .wb-body-large-24-light').forEach(function(e){
   var lines=featureLines.find(function(lines){return lines.join(' ')===e.textContent.trim();});
   if(!lines)return;
   e.replaceChildren(document.createTextNode(lines[0]+' '),text('span','fk-figma-feature-line',lines[1]));
  });
  // The article CTA is native Webflow markup with CMS-bound image, copy, link,
  // and product choice. Runtime only formats the product label and button copy;
  // it no longer replaces the card or stores product associations in code.
  document.querySelectorAll('.article-inline-cta').forEach(function(host) {
   var marker=host.querySelector('[data-fk-product-choice]');
   var link=host.querySelector('.article-inline-cta-link');
   var name=marker&&marker.textContent.trim();
   if(!name) return;
   var prefix='Fawkes';
   if(name.indexOf(prefix)===0) {
    marker.replaceChildren(document.createTextNode(prefix),text('span','fk-product-name-accent',name.slice(prefix.length)));
   }
   if(link) link.textContent='Explore '+name;
  });
  watchMoreCases();
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
 window.Webflow=window.Webflow||[];
 window.Webflow.push(watchMoreCases);
 window.setTimeout(watchMoreCases,0);
})();
;
/* Mobile-only enhancement. Restores original attributes/state on leaving <=767px. */
(function () {
 'use strict';
 function run() {
  var media=window.matchMedia('(max-width:767px)'), cleanup=[];
  function sync() {
   cleanup.forEach(function(stop){stop();}); cleanup=[];
   if(!media.matches) return;
   document.querySelectorAll('.fk-nav-hamburger').forEach(function(burger) {
    var pill=burger.closest('.fk-nav-pill'); if(!pill) return;
    var saved={}; ['role','tabindex','aria-label','aria-expanded'].forEach(function(key){saved[key]=burger.getAttribute(key);});
    burger.setAttribute('role','button'); burger.setAttribute('tabindex','0');
    function update() { var open=pill.classList.contains('mobile-menu-open'); burger.setAttribute('aria-expanded',String(open)); burger.setAttribute('aria-label',open?'Close navigation':'Open navigation'); }
    function click() { update(); }
    function key(event) {
     if(!media.matches) return;
     if(event.target===burger && (event.key==='Enter'||event.key===' ')) { event.preventDefault(); burger.click(); }
     if(!pill.classList.contains('mobile-menu-open')) return;
     if(event.key==='Escape') { event.preventDefault(); event.stopPropagation(); burger.click(); burger.focus(); }
     if(event.key==='Tab') {
      var focusable=Array.prototype.filter.call(pill.querySelectorAll('a[href],button,[tabindex="0"]'),function(e){return e.getClientRects().length && window.getComputedStyle(e).visibility!=='hidden';});
      var first=focusable[0], last=focusable[focusable.length-1];
      if(event.shiftKey && (document.activeElement===first||!pill.contains(document.activeElement))) {event.preventDefault(); last.focus();}
      else if(!event.shiftKey && (document.activeElement===last||!pill.contains(document.activeElement))) {event.preventDefault(); first.focus();}
     }
    }
    burger.addEventListener('click',click); document.addEventListener('keydown',key,true); update();
    cleanup.push(function() {
     if(pill.classList.contains('mobile-menu-open')) burger.click();
     burger.removeEventListener('click',click); document.removeEventListener('keydown',key,true);
     Object.keys(saved).forEach(function(k){if(saved[k]===null) burger.removeAttribute(k);else burger.setAttribute(k,saved[k]);});
    });
   });
  }
  media.addEventListener('change',sync); sync();
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);else run();
})();
;
/*
 * F8 Home native Tabs behavior — offline integration artifact.
 *
 * Contract:
 *   .fk-home-industry-carousel.w-tabs       native Webflow Tabs root
 *   .fk-home-industry-tab.w-tab-link        native Webflow tab links
 *   .w-tab-pane                             existing native slide records
 *
 * Webflow owns tab display, current-state classes, focus, and keyboard
 * activation. This controller owns only one autoplay clock and its active-tab
 * progress fill. It never writes slide content, image src/crop, href, markup,
 * pane visibility, or tab ARIA state.
 *
 * Source behavior retained from the read-only runtime audit:
 *   fk-site-interactions.js:214-247  5s order / hover / hidden / manual reset
 *   fk-industry-carousel-progress-v1.js:1  active-tab gradient appearance
 *
 * Native tab transitions remain Webflow-owned. Do not add a second fade here;
 * the parent-owned native Tabs attributes are expected to be 300ms/300ms.
 */
(function () {
  "use strict";

  var ROOT_SELECTOR = ".fk-home-industry-carousel.w-tabs";
  var LINK_SELECTOR = ".fk-home-industry-tab.w-tab-link";
  var ACTIVE_CLASS = "w--current";
  var AUTOPLAY_MS = 5000;
  var PROGRESS_COLOR = "rgb(226, 226, 236)";

  function ready(fn) {
    if (document.readyState !== "loading") fn();
    else document.addEventListener("DOMContentLoaded", fn, { once: true });
  }

  function reducedMotion() {
    return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  function activeLink(links) {
    for (var i = 0; i < links.length; i += 1) {
      if (links[i].classList.contains(ACTIVE_CLASS) || links[i].getAttribute("aria-selected") === "true") {
        return links[i];
      }
    }
    return links[0] || null;
  }

  function clearProgress(link) {
    if (!link) return;
    link.style.removeProperty("background-color");
    link.style.removeProperty("background-image");
    link.style.removeProperty("background-position");
    link.style.removeProperty("background-size");
    link.style.removeProperty("background-repeat");
  }

  function paintProgress(link, fraction) {
    if (!link || reducedMotion()) {
      clearProgress(link);
      return;
    }
    var percent = Math.max(0, Math.min(100, fraction * 100));
    // Native .w--current owns black text on a transparent background. Keep
    // that baseline while the progress image fills from left to right.
    link.style.backgroundColor = "transparent";
    link.style.backgroundImage = "linear-gradient(" + PROGRESS_COLOR + " 0 0)";
    link.style.backgroundPosition = "0 center";
    link.style.backgroundRepeat = "no-repeat";
    link.style.backgroundSize = percent + "% 100%";
  }

  function init(root) {
    if (root.__fkHomeTabsNative) return;

    var links = Array.prototype.slice.call(root.querySelectorAll(LINK_SELECTOR));
    if (links.length !== 3) return;

    var state = {
      elapsed: 0,
      lastTime: null,
      frame: 0,
      hovering: false,
      hidden: document.hidden,
      keyboardPause: false,
      active: null,
      destroyed: false
    };

    function paused() {
      return state.hovering || state.hidden || state.keyboardPause || reducedMotion();
    }

    function syncActive(resetClock) {
      var next = activeLink(links);
      if (!next) return;
      var changed = next !== state.active;
      state.active = next;
      links.forEach(function (link) {
        if (link !== next) clearProgress(link);
      });
      if (changed || resetClock) state.elapsed = 0;
      if (reducedMotion()) clearProgress(next);
      else paintProgress(next, state.elapsed / AUTOPLAY_MS);
    }

    function stopFrame() {
      if (state.frame) {
        window.cancelAnimationFrame(state.frame);
        state.frame = 0;
      }
    }

    function tick(now) {
      if (state.destroyed) return;
      if (reducedMotion()) {
        clearProgress(activeLink(links));
        stopFrame();
        return;
      }
      if (state.lastTime === null) state.lastTime = now;
      var delta = Math.max(0, now - state.lastTime);
      state.lastTime = now;

      if (!paused()) {
        state.elapsed += delta;
        if (state.elapsed >= AUTOPLAY_MS) {
          state.elapsed = 0;
          syncActive(false);
          var index = links.indexOf(state.active);
          var next = links[(index + 1) % links.length];
          if (next) {
          // Native Webflow Tabs receives the click and owns display/focus/ARIA.
          // Restore the user's prior focus so autoplay never moves focus.
          var priorFocus = document.activeElement;
          next.click();
          if (priorFocus && priorFocus !== document.body && typeof priorFocus.focus === "function") {
            priorFocus.focus({ preventScroll: true });
          } else if (document.activeElement === next && typeof next.blur === "function") {
            next.blur();
          }
          }
        }
        paintProgress(activeLink(links), state.elapsed / AUTOPLAY_MS);
      }

      state.frame = window.requestAnimationFrame(tick);
    }

    function resetManual() {
      state.elapsed = 0;
      state.lastTime = window.performance.now();
      syncActive(true);
    }

    function onVisibility() {
      state.hidden = document.hidden;
      state.lastTime = window.performance.now();
    }

    function onMediaChange() {
      state.lastTime = window.performance.now();
      syncActive(true);
      if (reducedMotion()) {
        stopFrame();
        clearProgress(activeLink(links));
      } else if (!state.frame) {
        state.frame = window.requestAnimationFrame(tick);
      }
    }

    function onMouseEnter() { state.hovering = true; }
    function onMouseLeave() {
      state.hovering = false;
      state.lastTime = window.performance.now();
    }
    function onKeydown() {
      // A keyboard user may be moving through native tabs; leave focus and
      // selection ownership to Webflow and stop autoplay until pointer use or
      // an explicit controller teardown.
      state.keyboardPause = true;
      state.lastTime = window.performance.now();
    }
    function onPointerDown() { state.keyboardPause = false; }
    function onLinkClick() {
      resetManual();
      window.requestAnimationFrame(function () { syncActive(false); });
    }
    root.addEventListener("mouseenter", onMouseEnter, false);
    root.addEventListener("mouseleave", onMouseLeave, false);
    root.addEventListener("pointerdown", onPointerDown, false);
    links.forEach(function (link) {
      link.addEventListener("keydown", onKeydown, false);
      link.addEventListener("click", onLinkClick, false);
    });
    document.addEventListener("visibilitychange", onVisibility, false);

    var media = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (media) {
      if (media.addEventListener) media.addEventListener("change", onMediaChange);
      else if (media.addListener) media.addListener(onMediaChange);
    }

    var observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i += 1) {
        if (records[i].attributeName === "class" || records[i].attributeName === "aria-selected") {
          syncActive(false);
          break;
        }
      }
    });
    observer.observe(root, { subtree: true, attributes: true, attributeFilter: ["class", "aria-selected"] });

    function destroy() {
      if (state.destroyed) return;
      state.destroyed = true;
      stopFrame();
      observer.disconnect();
      root.removeEventListener("mouseenter", onMouseEnter, false);
      root.removeEventListener("mouseleave", onMouseLeave, false);
      root.removeEventListener("pointerdown", onPointerDown, false);
      links.forEach(function (link) {
        link.removeEventListener("keydown", onKeydown, false);
        link.removeEventListener("click", onLinkClick, false);
      });
      document.removeEventListener("visibilitychange", onVisibility, false);
      if (media) {
        if (media.removeEventListener) media.removeEventListener("change", onMediaChange);
        else if (media.removeListener) media.removeListener(onMediaChange);
      }
      links.forEach(clearProgress);
    }

    root.__fkHomeTabsNative = { destroy: destroy };

    syncActive(true);
    state.lastTime = window.performance.now();
    if (!reducedMotion()) state.frame = window.requestAnimationFrame(tick);
  }

  ready(function () {
    document.querySelectorAll(ROOT_SELECTOR).forEach(init);
  });
}());
;
/*! Product Feature Section behavior retained after native consolidation. */
(function () {
  "use strict";

  function initializeProductFeatureDetails() {
    document.querySelectorAll('.fk-product-feature-left > .fk-product-name-dark').forEach(function (heading) {
      if (heading.textContent.trim() === 'Residual Asset Value') {
        heading.setAttribute('data-fk-wrap-residual', '');
      }
    });

    /* A slash-separated audience name is one editable component value. Add a
       soft wrap opportunity without changing that value or breaking a word. */
    document.querySelectorAll('.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label').forEach(function (label) {
      if (label.querySelector('wbr') || !label.textContent.includes('/')) return;
      label.innerHTML = label.innerHTML.replace(/\//g, '/<wbr>');
    });
  }

  function initializeWhenReady() {
    initializeProductFeatureDetails();
    setTimeout(initializeProductFeatureDetails, 500);
    setTimeout(initializeProductFeatureDetails, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady, { once: true });
  } else {
    initializeWhenReady();
  }
})();
;
(function (window, document) {
  "use strict";

  if (!window || !document || window.FqNativeFAQ) return;

  var ITEM_SELECTOR = ".fk-faq-item";
  var ROW_SELECTOR = ".fk-faq-question-row";
  var WRAPPER_SELECTOR = ".fk-faq-answer-wrapper";
  var ANSWER_SELECTOR = ".fk-faq-answer-text";
  var CHEVRON_SELECTOR = ".fk-faq-chevron";
  var OPEN_ITEM_CLASS = "faq-open";
  var OPEN_WRAPPER_CLASS = "fk-faq-answer-open";
  var OPEN_CHEVRON_CLASS = "fk-faq-chevron-open";
  var REDUCED_CLASS = "fk-faq-reduced-motion";
  var HEIGHT_PROPERTY = "--fk-faq-answer-height";
  var HEIGHT_ALLOWANCE = 40;

  var states = new WeakMap();
  var pending = new Set();
  var frame = 0;
  var sequence = 0;
  var mutationObserver = null;
  var resizeObserver = null;
  var globalListenersStarted = false;
  var reducedMotion = null;

  function requestFrame(callback) {
    if (window.requestAnimationFrame) return window.requestAnimationFrame(callback);
    return window.setTimeout(callback, 16);
  }

  function clearKeyboardClickGuard(state) {
    (window.setTimeout || setTimeout)(function () {
      state.suppressKeyboardClick = false;
    }, 0);
  }

  function idIsUnique(element, id) {
    if (!id) return false;
    var matches = document.querySelectorAll("[id]");
    var count = 0;
    for (var index = 0; index < matches.length; index += 1) {
      if (matches[index].id === id) {
        count += 1;
        if (matches[index] !== element || count > 1) return false;
      }
    }
    return count === 1;
  }

  function ensureUniqueId(element, stem) {
    if (idIsUnique(element, element.id)) return element.id;
    var candidate;
    do {
      sequence += 1;
      candidate = "fq-native-" + stem + "-" + sequence;
    } while (document.getElementById(candidate));
    element.id = candidate;
    return candidate;
  }

  function isNativeButton(element) {
    var tag = String(element.tagName || "").toLowerCase();
    if (tag === "button") return true;
    if (tag !== "input") return false;
    var type = String(element.getAttribute("type") || "").toLowerCase();
    return type === "button" || type === "submit" || type === "reset";
  }

  function isFragmentAnchor(element) {
    if (String(element.tagName || "").toLowerCase() !== "a") return false;
    var href = String(element.getAttribute("href") || "").trim();
    return href === "" || href.charAt(0) === "#";
  }

  function applyReducedMotion(state) {
    var reduced = Boolean(reducedMotion && reducedMotion.matches);
    state.wrapper.classList.toggle(REDUCED_CLASS, reduced);
    if (state.chevron) state.chevron.classList.toggle(REDUCED_CLASS, reduced);
  }

  function measure(state) {
    if (!state || !state.wrapper) return;
    var measured = Math.max(0, Number(state.wrapper.scrollHeight) || 0);
    state.wrapper.style.setProperty(HEIGHT_PROPERTY, measured + HEIGHT_ALLOWANCE + "px");
  }

  function flushMeasurements() {
    frame = 0;
    var work = Array.from(pending);
    pending.clear();
    for (var index = 0; index < work.length; index += 1) measure(work[index]);
  }

  function scheduleMeasurement(state) {
    if (!state) return;
    pending.add(state);
    if (!frame) frame = requestFrame(flushMeasurements);
  }

  function setOpen(state, open) {
    state.item.classList.toggle(OPEN_ITEM_CLASS, open);
    state.wrapper.classList.toggle(OPEN_WRAPPER_CLASS, open);
    if (state.chevron) state.chevron.classList.toggle(OPEN_CHEVRON_CLASS, open);
    state.row.setAttribute("aria-expanded", open ? "true" : "false");
    state.wrapper.setAttribute("aria-hidden", open ? "false" : "true");

    if (open) {
      state.wrapper.removeAttribute("inert");
      try { state.wrapper.inert = false; } catch (_) {}
      scheduleMeasurement(state);
    } else {
      state.wrapper.setAttribute("inert", "");
      try { state.wrapper.inert = true; } catch (_) {}
    }
  }

  function toggle(state) {
    setOpen(state, !state.item.classList.contains(OPEN_ITEM_CLASS));
  }

  function handleClick(state, event) {
    if (isFragmentAnchor(state.row) && event && event.preventDefault) event.preventDefault();
    if (state.suppressKeyboardClick && (!event || event.detail === 0 || event.detail == null)) {
      state.suppressKeyboardClick = false;
      return;
    }
    state.suppressKeyboardClick = false;
    toggle(state);
  }

  function handleKeydown(state, event) {
    var key = event && event.key;
    if (key !== "Enter" && key !== " " && key !== "Spacebar") return;
    if (event.repeat) return;
    if (event.preventDefault) event.preventDefault();
    state.suppressKeyboardClick = true;
    toggle(state);
    clearKeyboardClickGuard(state);
  }

  function observeSize(state) {
    if (!resizeObserver) return;
    var target = state.wrapper.querySelector(ANSWER_SELECTOR) || state.wrapper.firstElementChild || state.wrapper;
    if (state.resizeTarget === target) return;
    if (state.resizeTarget && resizeObserver.unobserve) resizeObserver.unobserve(state.resizeTarget);
    state.resizeTarget = target;
    resizeObserver.observe(target);
  }

  function initializeItem(item) {
    var row = item.querySelector(ROW_SELECTOR);
    var wrapper = item.querySelector(WRAPPER_SELECTOR);
    if (!row || !wrapper) return null;

    var state = states.get(item);
    if (!state) {
      state = {
        item: item,
        row: row,
        wrapper: wrapper,
        chevron: item.querySelector(CHEVRON_SELECTOR),
        suppressKeyboardClick: false,
        resizeTarget: null
      };
      states.set(item, state);

      row.addEventListener("click", function (event) { handleClick(state, event); });
      row.addEventListener("keydown", function (event) { handleKeydown(state, event); });
    } else {
      state.chevron = item.querySelector(CHEVRON_SELECTOR);
    }

    if (!isNativeButton(row)) {
      row.setAttribute("role", "button");
      if (!row.hasAttribute("tabindex")) row.setAttribute("tabindex", "0");
    }

    var rowId = ensureUniqueId(row, "question");
    var wrapperId = ensureUniqueId(wrapper, "answer");
    row.setAttribute("aria-controls", wrapperId);
    wrapper.setAttribute("role", "region");
    wrapper.setAttribute("aria-labelledby", rowId);

    applyReducedMotion(state);
    setOpen(state, item.classList.contains(OPEN_ITEM_CLASS));
    scheduleMeasurement(state);
    observeSize(state);
    return state;
  }

  function itemsWithin(root) {
    var items = [];
    if (root && root.matches && root.matches(ITEM_SELECTOR)) items.push(root);
    if (root && root.querySelectorAll) {
      var descendants = root.querySelectorAll(ITEM_SELECTOR);
      for (var index = 0; index < descendants.length; index += 1) items.push(descendants[index]);
    }
    return items;
  }

  function initializeWithin(root) {
    var items = itemsWithin(root || document);
    for (var index = 0; index < items.length; index += 1) initializeItem(items[index]);
    return items.length;
  }

  function scheduleWithin(root) {
    var items = itemsWithin(root || document);
    for (var index = 0; index < items.length; index += 1) {
      scheduleMeasurement(states.get(items[index]) || initializeItem(items[index]));
    }
  }

  function startResizeObserver() {
    if (resizeObserver || !window.ResizeObserver) return;
    resizeObserver = new window.ResizeObserver(function (entries) {
      for (var index = 0; index < entries.length; index += 1) {
        var target = entries[index].target;
        var item = target.closest ? target.closest(ITEM_SELECTOR) : null;
        if (item) scheduleMeasurement(states.get(item));
      }
    });
  }

  function startGlobalListeners() {
    if (globalListenersStarted) return;
    globalListenersStarted = true;

    reducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    if (reducedMotion) {
      var onMotionChange = function () {
        var items = itemsWithin(document);
        for (var index = 0; index < items.length; index += 1) {
          var state = states.get(items[index]);
          if (state) applyReducedMotion(state);
        }
      };
      if (reducedMotion.addEventListener) reducedMotion.addEventListener("change", onMotionChange);
      else if (reducedMotion.addListener) reducedMotion.addListener(onMotionChange);
    }

    window.addEventListener("resize", function () { scheduleWithin(document); });

    if (document.fonts) {
      if (document.fonts.ready && document.fonts.ready.then) {
        document.fonts.ready.then(function () { scheduleWithin(document); });
      }
      if (document.fonts.addEventListener) {
        document.fonts.addEventListener("loadingdone", function () { scheduleWithin(document); });
      }
    }
  }

  function startMutationObserver() {
    if (mutationObserver || !window.MutationObserver) return;
    mutationObserver = new window.MutationObserver(function (records) {
      for (var index = 0; index < records.length; index += 1) {
        var record = records[index];
        if (record.type === "childList") {
          for (var added = 0; added < record.addedNodes.length; added += 1) {
            var node = record.addedNodes[added];
            if (node && node.nodeType === 1) initializeWithin(node);
          }
        }
        var item = record.target && record.target.closest ? record.target.closest(ITEM_SELECTOR) : null;
        if (item) scheduleMeasurement(states.get(item) || initializeItem(item));
      }
    });
    mutationObserver.observe(document.body || document.documentElement, {
      childList: true,
      characterData: true,
      subtree: true
    });
  }

  function init(options) {
    options = options || {};
    startResizeObserver();
    startGlobalListeners();
    var count = initializeWithin(options.root || document);
    if (options.observe !== false) startMutationObserver();
    return count;
  }

  function update(root) {
    initializeWithin(root || document);
    scheduleWithin(root || document);
  }

  window.FqNativeFAQ = {
    init: init,
    update: update
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { init(); }, { once: true });
  } else {
    init();
  }
})(window, document);

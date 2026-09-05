/*! fk-site-interactions — Fawkes site-header registered script — v1.5.0
 *  Freeform Part 4, reduced. Independent blocks, no shared state:
 *    1. Empty-slot hiding for .fk-visual-card, .fk-process-tile and .fk-faq-item
 *    2. Mobile nav hamburger toggle
 *    3. Mobile nav dropdown expand
 *    4. Home industries tab switcher — fades the card background image and
 *       swaps headline (with orange accent spans) + a 3-item feature list per
 *       tab, matching the Figma card (v1.2.0)
 *    4b. Home industries carousel AUTOPLAY — advances a tab every 5s; pauses on
 *        hover / backgrounded tab; any manual pill click resets the clock.
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
        link.closest('.fk-nav-dropdown-wrapper').classList.toggle('dropdown-expanded');
      });
    });

    // Home page industries tab switcher. Figma designed this as a 3-slide carousel
    // but defined no transition. The existing `.image-fill` remains the only
    // background layer so an outgoing slide can never reappear over the selected
    // image. Each target image is preloaded, then the base image fades out, swaps
    // source, and fades back in while preserving its parallax behavior.
    var CDN = 'https://cdn.prod.website-files.com/6a8826652e72a7fcc7c3bf57/';
    var INDUSTRY_DATA = {
      fleets: {
        headlineHTML: 'Protect <span class="fk-hl-accent">EV fleet economics</span> through continuous battery intelligence',
        features: ['Reduce Downtime', 'Preventive Maintenance', 'Resale Value'],
        href: '/industries/ev-fleets',
        img: CDN + '6a88772c3c2f1ca033218736_home-hero-bus.png'
      },
      financiers: {
        headlineHTML: '<span class="fk-hl-accent">De-risk EV lending</span> with data-backed residual value forecasting',
        features: ['Residual Value Estimate', 'Asset Categorization', 'Financial Modelling'],
        href: '/industries/ev-financiers',
        img: CDN + '6a96287b31837461f1a07309_home-carousel-financiers.jpg'
      },
      bess: {
        headlineHTML: 'Protect <span class="fk-hl-accent">contracted revenue</span> across full BESS system lifetime',
        features: ['Degradation Modelling', 'Safety Risk Management', 'Predictive Maintenance'],
        href: '/industries/bess',
        img: CDN + '6a96287c6f1d9c22615b98d4_home-carousel-bess.jpg'
      }
    };
    var tabRow = document.querySelector('.tab-row');
    if (tabRow) {
      var visualCard = document.querySelector('.fk-visual-card');
      var baseImg = visualCard ? visualCard.querySelector('.image-fill') : null;
      var headlineEl = visualCard ? visualCard.querySelector('.fk-vc-headline') : null;
      var titleWrap = visualCard ? visualCard.querySelector('.fk-visual-card-title') : null;
      var bottomRow = visualCard ? visualCard.querySelector('.fk-vc-bottom') : null;
      var featureEls = visualCard ? visualCard.querySelectorAll('.fk-vc-feature-item') : [];
      var arrowLink = visualCard ? visualCard.querySelector('.fk-vc-arrow') : null;
      var scrimEl = visualCard ? visualCard.querySelector('.fk-vc-scrim') : null;
      var current = 'fleets';

      // Preload the other two backgrounds so the first crossfade is instant.
      Object.keys(INDUSTRY_DATA).forEach(function (k) {
        var p = new Image();
        p.src = INDUSTRY_DATA[k].img;
      });

      if (baseImg) baseImg.style.transition = 'opacity .3s ease';
      [titleWrap, bottomRow].forEach(function (el) {
        if (el) { el.style.transition = 'opacity .25s ease'; }
      });

      var busy = false;
      function activate(key, pill) {
        var data = INDUSTRY_DATA[key];
        if (!data || key === current || busy) {
          if (data && key === current) {
            tabRow.querySelectorAll('.tab-pill').forEach(function (p) { p.classList.remove('is-active'); });
            pill.classList.add('is-active');
          }
          return;
        }
        busy = true;
        tabRow.querySelectorAll('.tab-pill').forEach(function (p) { p.classList.remove('is-active'); });
        pill.classList.add('is-active');

        // Copy swaps behind a short fade of the headline plate + feature row.
        if (titleWrap) titleWrap.style.opacity = '0';
        if (bottomRow) bottomRow.style.opacity = '0';
        window.setTimeout(function () {
          if (headlineEl) headlineEl.innerHTML = data.headlineHTML;
          for (var i = 0; i < featureEls.length; i++) {
            featureEls[i].textContent = data.features[i] || '';
          }
          if (arrowLink) arrowLink.setAttribute('href', data.href);
          if (scrimEl) scrimEl.classList.toggle('is-bright', key === 'bess');
          if (titleWrap) titleWrap.style.opacity = '1';
          if (bottomRow) bottomRow.style.opacity = '1';
        }, 200);

        // Swap the single background layer after the target asset is ready.
        if (baseImg) {
          baseImg.style.opacity = '0';
          var nextImg = new Image();
          var swapped = false;
          var reveal = function () {
            if (swapped) return;
            swapped = true;
            baseImg.setAttribute('src', data.img);
            baseImg.removeAttribute('srcset');
            window.requestAnimationFrame(function () {
              window.requestAnimationFrame(function () { baseImg.style.opacity = '1'; });
            });
            current = key;
            busy = false;
          };
          nextImg.onload = reveal;
          nextImg.onerror = function () {
            baseImg.style.opacity = '1';
            busy = false;
          };
          nextImg.src = data.img;
          if (nextImg.complete) reveal();
        } else {
          current = key;
          busy = false;
        }
      }

      // Paint the initial (fleets) state: the Webflow-rendered headline is plain
      // text, so apply the accent markup + feature labels once on load.
      (function () {
        var d = INDUSTRY_DATA[current];
        if (headlineEl && d) headlineEl.innerHTML = d.headlineHTML;
        for (var i = 0; i < featureEls.length; i++) {
          featureEls[i].textContent = (d && d.features[i]) || '';
        }
        if (arrowLink && d) arrowLink.setAttribute('href', d.href);
        if (scrimEl) scrimEl.classList.toggle('is-bright', current === 'bess');
      })();

      // 4b. Autoplay — advance to the next tab every 5s. Figma drew this as a
      // rotating 3-slide carousel; the crossfade above is the transition. The
      // timer is paused while the pointer is over the card or the tab row and
      // while the tab is backgrounded; a manual pill click restarts the clock.
      var AUTOPLAY_MS = 5000;
      var order = ['fleets', 'financiers', 'bess'];
      var autoTimer = null;
      var hovering = false;
      function stopAuto() { if (autoTimer) { window.clearTimeout(autoTimer); autoTimer = null; } }
      function scheduleAuto() {
        stopAuto();
        autoTimer = window.setTimeout(function () {
          if (!hovering && !document.hidden && !busy) {
            var i = order.indexOf(current);
            var nextKey = order[(i + 1) % order.length];
            var nextPill = tabRow.querySelector('.tab-pill[data-industry="' + nextKey + '"]');
            if (nextPill) activate(nextKey, nextPill);
          }
          scheduleAuto();
        }, AUTOPLAY_MS);
      }
      [visualCard, tabRow].forEach(function (el) {
        if (!el) return;
        el.addEventListener('mouseenter', function () { hovering = true; });
        el.addEventListener('mouseleave', function () { hovering = false; });
      });

      tabRow.querySelectorAll('.tab-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
          activate(pill.getAttribute('data-industry'), pill);
          scheduleAuto();
        });
      });

      scheduleAuto();
    }

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

    // 6. Home case-study cards — auto-scroll marquee. Wrap the row's children
    // (+ one cloned set) in a flex track and drive it with translateX — a
    // transform takes sub-pixel values and is GPU-composited, unlike
    // element.scrollLeft which several browsers round to whole pixels (so a
    // <1px/frame step never moves). Pause on hover/focus; respect
    // prefers-reduced-motion.
    var csRow = document.querySelector('.case-study-row');
    if (csRow && csRow.children.length &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        csRow.scrollWidth > csRow.clientWidth + 4) {
      var csGap = getComputedStyle(csRow).columnGap;
      if (!csGap || csGap === 'normal') csGap = getComputedStyle(csRow).gap;
      if (!csGap || csGap === 'normal') csGap = '24px';
      var csTrack = document.createElement('div');
      csTrack.style.cssText = 'display:flex;flex:0 0 auto;column-gap:' + csGap + ';will-change:transform';
      var csOriginals = Array.prototype.slice.call(csRow.children);
      var csCardW = csOriginals[0].getBoundingClientRect().width;
      while (csRow.firstChild) { csTrack.appendChild(csRow.firstChild); }
      csOriginals.forEach(function (card) {
        var clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        clone.tabIndex = -1;
        csTrack.appendChild(clone);
      });
      // keep each card at its natural width inside the track (guard against a
      // flex:1 basis collapsing them now that the track has no fixed width)
      Array.prototype.forEach.call(csTrack.children, function (card) {
        card.style.flex = '0 0 ' + Math.round(csCardW) + 'px';
      });
      csRow.appendChild(csTrack);
      csRow.style.overflow = 'hidden';
      // loop period = left edge of the first clone minus left edge of the first card
      var firstCardLeft = csTrack.children[0].getBoundingClientRect().left;
      var csLoop = csTrack.children[csOriginals.length].getBoundingClientRect().left - firstCardLeft;
      var CS_SPEED = 0.5; // px per frame ≈ 30px/s at 60fps
      var csPos = 0;
      var csPaused = false;
      ['mouseenter', 'focusin'].forEach(function (ev) {
        csRow.addEventListener(ev, function () { csPaused = true; });
      });
      ['mouseleave', 'focusout'].forEach(function (ev) {
        csRow.addEventListener(ev, function () { csPaused = false; });
      });
      (function csTick() {
        if (!csPaused && !document.hidden && csLoop > 0) {
          csPos -= CS_SPEED;
          if (csPos <= -csLoop) { csPos += csLoop; }
          csTrack.style.transform = 'translateX(' + csPos + 'px)';
        }
        window.requestAnimationFrame(csTick);
      })();
    }
  }

  // The original relied on DOMContentLoaded. A registered script can be injected
  // after that event has already fired, in which case the listener would never
  // run — so dispatch immediately when the document is already parsed.
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init, { once: true });
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
    set(this.bConnector, { opacity: "0", "clip-path": "inset(0 100% 0 0)", "-webkit-clip-path": "inset(0 100% 0 0)" });
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
      [{ opacity: 0, clipPath: "inset(0 100% 0 0)", webkitClipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)", webkitClipPath: "inset(0 0 0 0)" }],
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

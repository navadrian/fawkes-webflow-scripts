/*! fk-site-interactions — Fawkes site-header registered script — v1.5.0
 *  Freeform Part 4, reduced. Independent blocks, no shared state:
 *    1. Empty-slot hiding for .fk-visual-card, .fk-process-tile and .fk-faq-item
 *    2. Mobile nav hamburger toggle
 *    3. Mobile nav dropdown expand
 *    4. Home industries tab switcher — crossfades the card background image and
 *       swaps headline (with orange accent spans) + a 3-item feature list per
 *       tab, matching the Figma card (v1.2.0)
 *    4b. Home industries carousel AUTOPLAY — advances a tab every 5s; pauses on
 *        hover / backgrounded tab; any manual pill click resets the clock.
 *    5. Home hero KPI reveal — pulse dot + connector draw in, then the three
 *       stat cards rise in staggered. Inline styles + transitionDelay (not a
 *       rAF tween) so it can't stick invisible when throttled; 2.6s failsafe.
 *    6. Home case-study cards — gentle auto-scroll marquee (clone + scrollLeft),
 *       pause on hover/focus, respects prefers-reduced-motion.
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
    // but defined no transition — the product decision is a CROSSFADE of the card
    // background image + copy on tab click. Implementation: the existing
    // `.image-fill` <img> is layer A (keeps its parallax); JS adds a static layer B
    // on top and fades opacity between the two so the swap never flashes blank.
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

      // Build the crossfade layer stacked over the base image.
      var fadeImg = null;
      if (visualCard && baseImg) {
        if (getComputedStyle(visualCard).position === 'static') {
          visualCard.style.position = 'relative';
        }
        fadeImg = document.createElement('img');
        fadeImg.setAttribute('aria-hidden', 'true');
        fadeImg.style.cssText =
          'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;' +
          'opacity:0;transition:opacity .5s ease;pointer-events:none;z-index:1';
        baseImg.parentNode.insertBefore(fadeImg, baseImg.nextSibling);
        [titleWrap, bottomRow].forEach(function (el) {
          if (el) { el.style.transition = 'opacity .25s ease'; }
        });
      }

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

        // Background crossfade.
        if (fadeImg) {
          fadeImg.src = data.img;
          var reveal = function () {
            fadeImg.style.opacity = '1';
            window.setTimeout(function () {
              if (baseImg) { baseImg.setAttribute('src', data.img); baseImg.removeAttribute('srcset'); }
              fadeImg.style.opacity = '0';
              current = key;
              busy = false;
            }, 520);
          };
          if (fadeImg.complete) { reveal(); }
          else { fadeImg.onload = reveal; fadeImg.onerror = function () { busy = false; }; }
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

    // 5. Home hero KPI reveal — dot + connector first, then the three stat
    // cards staggered. Priming is done WITHOUT a transition, forced to paint,
    // then the transition is added and the reveal set — so the browser has a
    // real "from" frame and actually animates (setting opacity:0 and the
    // transition in one go just animates the fade-OUT). rAF-free trigger +
    // 2.4s failsafe force-show. No-op under reduced-motion or <=767 (KPI row
    // is display:none there).
    var kpiRow = document.querySelector('.hero-stat-row');
    if (kpiRow &&
        !window.matchMedia('(prefers-reduced-motion: reduce)').matches &&
        window.matchMedia('(min-width: 768px)').matches) {
      var kpiTarget = document.querySelector('.fk-hero-target');
      var dotLg = kpiTarget ? kpiTarget.querySelector('.fk-hero-dot-lg') : null;
      var connector = kpiTarget ? kpiTarget.querySelector('.fk-hero-connector') : null;
      var statCards = Array.prototype.slice.call(kpiRow.querySelectorAll('.fk-stat-card'));
      var kpiEls = [];
      if (dotLg) kpiEls.push([dotLg, 'scale(.4)', '0.10s']);
      if (connector) kpiEls.push([connector, 'none', '0.42s']);
      statCards.forEach(function (c, i) {
        kpiEls.push([c, 'translateY(16px)', (0.58 + i * 0.14).toFixed(2) + 's']);
      });
      // prime: hidden, NO transition yet
      kpiEls.forEach(function (e) {
        e[0].style.transition = 'none';
        e[0].style.opacity = '0';
        e[0].style.transform = e[1];
      });
      void kpiRow.offsetWidth; // force the hidden state to lay out
      function revealKPI() {
        kpiEls.forEach(function (e) {
          e[0].style.transition = 'opacity .6s ease, transform .6s ease';
          e[0].style.transitionDelay = e[2];
          e[0].style.opacity = '1';
          e[0].style.transform = e[0] === dotLg ? 'scale(1)' : 'translateY(0)';
        });
      }
      // two rAFs if we can (cleanest), else a short timeout — the tab may be
      // backgrounded (rAF frozen) at load.
      if (typeof window.requestAnimationFrame === 'function' && !document.hidden) {
        window.requestAnimationFrame(function () { window.requestAnimationFrame(revealKPI); });
      }
      window.setTimeout(revealKPI, 90);
      window.setTimeout(function () {
        kpiEls.forEach(function (e) {
          e[0].style.transition = 'none';
          e[0].style.transitionDelay = '0s';
          e[0].style.opacity = '1';
          e[0].style.transform = 'none';
        });
      }, 2400);
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

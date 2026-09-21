/*! fk-site-interactions — Fawkes site-header registered script — v1.5.0
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

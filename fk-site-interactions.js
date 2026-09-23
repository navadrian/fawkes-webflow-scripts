/*! fk-site-interactions — Fawkes site-header registered script — v1.7.0
 *  Freeform Part 4, reduced. Independent blocks, no shared state:
 *    1. Empty-slot hiding for .fk-visual-card, .fk-process-tile and .fk-faq-item
 *    2. Mobile nav hamburger toggle
 *    3. Mobile nav dropdown expand
 *    4. Home industries content and controls are native Webflow Tabs.
 *       Autoplay/progress is provided by the behavior-only native Tabs controller.
 *    5. Home case-study cards — auto-scroll marquee: wrap children (+1 clone
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

    // Manual case-study navigation is initialized below; no autoplay or clones.
  }

  function initReviewInteractions() {
    var row = document.querySelector('.fk-home-case-section-exact .case-study-row');
    if (row && !row.dataset.fkManualCases) {
      var heading = row.parentElement.querySelector('.home-case-label-exact');
      var head = row.parentElement.querySelector('.fk-case-heading-row');
      var controls = head && head.querySelector('.fk-case-controls');
      if (!head) {
        head = document.createElement('div');
        head.className = 'fk-case-heading-row';
        row.parentElement.insertBefore(head, heading || row);
        if (heading) head.appendChild(heading);
      }
      if (!controls) {
        controls = document.createElement('div');
        controls.className = 'fk-case-controls';
        head.appendChild(controls);
      }
      var previous = controls.querySelector('[data-fk-case-control="previous"]');
      var next = controls.querySelector('[data-fk-case-control="next"]');
      var index = 0;
      var cards = Array.prototype.slice.call(row.children);
      function button(label, glyph, delta) {
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'fk-case-control';
        b.setAttribute('aria-label', label);
        b.setAttribute('data-fk-case-control', delta < 0 ? 'previous' : 'next');
        b.textContent = glyph;
        controls.appendChild(b);
        return b;
      }
      if (!previous) previous = button('Previous case study', '\u2190', -1);
      if (!next) next = button('Next case study', '\u2192', 1);
      if (!previous || !next || previous.tagName !== 'BUTTON' || next.tagName !== 'BUTTON') return;
      row.dataset.fkManualCases = 'true';
      row.classList.add('fk-manual-cases');
      row.setAttribute('aria-label', 'Case studies');
      previous.type = 'button';
      next.type = 'button';
      previous.setAttribute('aria-label', 'Previous case study');
      next.setAttribute('aria-label', 'Next case study');
      previous.addEventListener('click', function () {
        index = Math.max(0, Math.min(cards.length - 1, index - 1));
        show(true);
      });
      next.addEventListener('click', function () {
        index = Math.max(0, Math.min(cards.length - 1, index + 1));
        show(true);
      });
      function alignTrack() {
        var inset = heading ? heading.getBoundingClientRect().left : row.parentElement.getBoundingClientRect().left;
        row.style.setProperty('--fk-case-inset', Math.max(0, inset) + 'px');
        var parent = row.parentElement;
        row.style.setProperty('--fk-case-origin', (parent.getBoundingClientRect().left + parseFloat(window.getComputedStyle(parent).paddingLeft)) + 'px');
        row.style.setProperty('--fk-case-viewport', document.documentElement.clientWidth + 'px');
      }
      function updateButtons() {
        previous.disabled = cards.length === 0 || index <= 0;
        next.disabled = cards.length === 0 || index >= cards.length - 1;
      }
      function show(smooth) {
        if (!cards.length) { updateButtons(); return; }
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

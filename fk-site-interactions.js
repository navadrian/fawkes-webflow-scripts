/*! fk-site-interactions — Fawkes site-header registered script — v1.0.0
 *  Freeform Part 4, reduced. Four independent blocks, no shared state:
 *    1. Empty-slot hiding for .fk-visual-card and .fk-process-tile
 *    2. Mobile nav hamburger toggle
 *    3. Mobile nav dropdown expand
 *    4. Home industries tab switcher
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

    // Mobile nav menu toggle. Driven by JS rather than the usual checkbox-hack
    // because the platform rejects <input>/<label> elements outside a Form.
    document.querySelectorAll('.fk-nav-hamburger').forEach(function (burger) {
      burger.addEventListener('click', function () {
        var pill = burger.closest('.fk-nav-pill');
        if (!pill) return;
        pill.classList.toggle('mobile-menu-open');
        burger.classList.toggle('is-active');
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

    // Home page industries tab switcher: Figma never designed alternate in-place
    // content for the Financiers/BESS tabs (only EV Fleets exists), so this pulls
    // each industry's REAL live headline copy from its own page rather than
    // inventing new text.
    var INDUSTRY_DATA = {
      fleets: { chip: 'EV Fleets', headline: 'Protect EV fleet economics through continuous battery intelligence', href: '/industries/ev-fleets' },
      financiers: { chip: 'EV Financiers', headline: 'Unknown battery variables in EV financial modelling compound risk', href: '/industries/ev-financiers' },
      bess: { chip: 'BESS Owners & Operators', headline: 'The largest energy storage investments depend on their least predictable asset', href: '/industries/bess' }
    };
    var tabRow = document.querySelector('.tab-row');
    if (tabRow) {
      var visualCard = document.querySelector('.fk-visual-card');
      var chipEl = visualCard ? visualCard.querySelector('.fk-tag-chip') : null;
      var headlineEl = visualCard ? visualCard.querySelector('.wb-desc-heading-44') : null;
      var arrowLink = visualCard ? visualCard.querySelector('.fk-visual-card-arrow-btn') : null;
      tabRow.querySelectorAll('.tab-pill').forEach(function (pill) {
        pill.addEventListener('click', function () {
          var key = pill.getAttribute('data-industry');
          var data = INDUSTRY_DATA[key];
          if (!data) return;
          tabRow.querySelectorAll('.tab-pill').forEach(function (p) { p.classList.remove('is-active'); });
          pill.classList.add('is-active');
          if (chipEl) chipEl.textContent = data.chip;
          if (headlineEl) headlineEl.textContent = data.headline;
          if (arrowLink) arrowLink.setAttribute('href', data.href);
        });
      });
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

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
    '.fk-nav-pill .fk-nav-links>.fk-nav-link{position:relative}',
    '.fk-nav-pill .fk-nav-links>.fk-nav-link:hover:after,.fk-nav-pill .fk-nav-links>.fk-nav-link:focus-visible:after,.fk-nav-pill .fk-nav-links>.fk-nav-link.w--current:after{content:"";position:absolute;left:0;right:0;bottom:-7px;height:1px;background:rgba(255,255,255,.58)}',
    '.fk-nav-pill .fk-nav-dropdown-wrapper>.fk-nav-link:focus-visible,.fk-nav-pill .fk-nav-dropdown-item:focus-visible{outline:2px solid rgba(242,151,31,.85);outline-offset:4px}',
    '.fk-nav-pill[data-nav-open] .fk-nav-cta-button{background-color:#000;border-color:#fff}',
    '}',
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

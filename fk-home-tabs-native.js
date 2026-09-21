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

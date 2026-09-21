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

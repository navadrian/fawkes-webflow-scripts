/*! fk-hero-sticky — Fawkes site-header registered script — v1.0.0
 *  Webflow's registered "scripts" are injected as <script src>, so a raw .css
 *  file never applies. This JS wrapper injects the hero sticky stylesheet as a
 *  real <style> element at the end of <head> (so it wins over Webflow's own
 *  .hero-wrapper rule on equal specificity).
 *
 *  Pairs with heropinsimple.js. Without the JS you still get the frozen hero +
 *  base scrim from this CSS alone, just no scrub.
 *
 *  Markup contract: .hero-scrim / .image-fill / .hero-content (and, Home only,
 *  .hero-stat-row) are DIRECT children of .hero-wrapper, and no ancestor of
 *  .hero-wrapper sets overflow:hidden|auto|scroll.
 */
(function () {
  "use strict";
  if (document.getElementById("fk-hero-sticky-style")) return;

  var css = [
    ".hero-wrapper{",
      "--hero-vh:100vh;--hero-freeze:60vh;",
      "position:relative;display:block;box-sizing:border-box;overflow:visible;",
      "padding-top:var(--hero-vh);padding-bottom:var(--hero-freeze);",
      "min-height:0;background-color:#111217;isolation:isolate;",
    "}",
    "@supports (height:100svh){.hero-wrapper{--hero-vh:100svh;--hero-freeze:60svh;}}",

    ".hero-wrapper>.image-fill,",
    ".hero-wrapper>.hero-scrim,",
    ".hero-wrapper>.hero-content,",
    ".hero-wrapper>.hero-stat-row{",
      "position:sticky;top:0;width:100%;height:var(--hero-vh);",
      "margin:calc(-1 * var(--hero-vh)) 0 0 0;",
    "}",

    ".hero-wrapper>.hero-stat-row{",
      "right:auto;left:0;z-index:2;display:flex;flex-direction:row;",
      "justify-content:flex-end;align-items:flex-start;",
      "padding:160px 48px 0 0;column-gap:12px;pointer-events:none;will-change:opacity;",
    "}",

    ".hero-wrapper>.image-fill{z-index:0;overflow:hidden;background-color:#111217;}",
    ".hero-wrapper>.image-fill>img,",
    ".hero-wrapper>.image-fill>video,",
    ".hero-wrapper>img.image-fill{",
      "width:100%;height:100%;display:block;object-fit:cover;object-position:center;will-change:transform;",
    "}",

    ".hero-wrapper>.hero-scrim{",
      "z-index:1;pointer-events:none;background-color:rgba(17,18,23,.55);",
      "background-image:linear-gradient(180deg,rgba(11,12,16,.42) 0%,rgba(11,12,16,.14) 36%,rgba(11,12,16,.04) 60%,rgba(11,12,16,.34) 100%);",
    "}",

    ".hero-wrapper>.hero-content{z-index:2;display:flex;flex-direction:column;justify-content:center;will-change:opacity;}",
    ".hero-wrapper>.hero-content h1,",
    ".hero-wrapper>.hero-content h2,",
    ".hero-wrapper>.hero-content .hero-eyebrow{text-shadow:0 1px 28px rgba(0,0,0,.38);}",

    ".navbar,.nav-bar,.site-nav,.w-nav{z-index:1000;}",

    "@media (prefers-reduced-motion:reduce){",
      ".hero-wrapper{--hero-freeze:0px;padding-bottom:0;}",
      ".hero-wrapper>.image-fill,",
      ".hero-wrapper>.hero-scrim,",
      ".hero-wrapper>.hero-content,",
      ".hero-wrapper>.hero-stat-row{position:relative;margin:0;height:auto;}",
    "}"
  ].join("");

  var style = document.createElement("style");
  style.id = "fk-hero-sticky-style";
  style.textContent = css;
  (document.head || document.documentElement).appendChild(style);
})();

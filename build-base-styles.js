/* Regenerate fk-base-styles.js from the raw CSS sources.
 * Run:  node build-base-styles.js
 * Webflow injects registered scripts as <script src>, so raw .css files never
 * apply — the base stylesheet ships as a JS <style> injector instead.
 */
const fs = require("fs");

const contrast = fs.readFileSync("fk-contrast.css", "utf8");
const mobile = fs.readFileSync("fk-mobilenav.css", "utf8");
const css = contrast + "\n\n/* ===== fk-mobilenav ===== */\n" + mobile;

const out = `/*! fk-base-styles — Fawkes site-header registered script — v1.0.0
 *  Webflow injects registered "scripts" as <script src>, so a raw .css file
 *  never applies. This wrapper injects the base stylesheet (contrast fixes +
 *  fixed-nav anchor offset + mobile-nav menu) as a real <style> at the end of
 *  <head>. Generated from fk-contrast.css + fk-mobilenav.css — edit those, then
 *  rebuild:  node build-base-styles.js
 */
(function () {
  "use strict";
  if (document.getElementById("fk-base-styles")) return;
  var s = document.createElement("style");
  s.id = "fk-base-styles";
  s.textContent = ${JSON.stringify(css)};
  (document.head || document.documentElement).appendChild(s);
})();
`;

fs.writeFileSync("fk-base-styles.js", out);
console.log("wrote fk-base-styles.js (" + out.length + " bytes)");

/* Home carousel: stretch the existing native destination anchor over the card.
   The carousel's own controller continues to update that anchor's href. */
(function () {
  "use strict";

  function labelForHref(href) {
    var path = (href || "").split("?")[0].replace(/\/$/, "");
    var slug = path.split("/").pop() || "industry";
    return "Explore " + slug.replace(/-/g, " ");
  }

  function init() {
    document.querySelectorAll(".fk-visual-card").forEach(function (card) {
      var link = card.querySelector(".fk-vc-arrow[href]");
      if (!link) return;
      card.classList.add("is-full-card-link");
      function syncLabel() {
        link.setAttribute("aria-label", labelForHref(link.getAttribute("href")));
      }
      syncLabel();
      if (window.MutationObserver) {
        new MutationObserver(syncLabel).observe(link, { attributes: true, attributeFilter: ["href"] });
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init, { once: true });
  else init();
})();

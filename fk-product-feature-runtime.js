/*! Product Feature Section behavior retained after native consolidation. */
(function () {
  "use strict";

  function initializeProductFeatureDetails() {
    document.querySelectorAll('.fk-product-feature-left > .fk-product-name-dark').forEach(function (heading) {
      if (heading.textContent.trim() === 'Residual Asset Value') {
        heading.setAttribute('data-fk-wrap-residual', '');
      }
    });

    /* A slash-separated audience name is one editable component value. Add a
       soft wrap opportunity without changing that value or breaking a word. */
    document.querySelectorAll('.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label').forEach(function (label) {
      if (label.querySelector('wbr') || !label.textContent.includes('/')) return;
      label.innerHTML = label.innerHTML.replace(/\//g, '/<wbr>');
    });
  }

  function initializeWhenReady() {
    initializeProductFeatureDetails();
    setTimeout(initializeProductFeatureDetails, 500);
    setTimeout(initializeProductFeatureDetails, 2000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeWhenReady, { once: true });
  } else {
    initializeWhenReady();
  }
})();


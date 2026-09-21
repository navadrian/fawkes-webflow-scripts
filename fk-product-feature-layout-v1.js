/*! fk-product-feature-layout — Fawkes site-header registered script — v1.3.0
   Shared Product Feature Section layout for FawkesCore, FawkesLink and
   FawkesArc. The component deliberately keeps its existing prop-bound nodes;
   CSS grid places those nodes into the two independently paced Figma columns.
   Rules are limited to the native is-product-feature-section scope class.
*/
(()=>{const s=document.createElement("style");s.textContent=`
.fk-product-feature-left > .fk-product-name-dark[data-fk-wrap-residual] {
  max-width:10ch !important;
}
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label:empty { display:none; }
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label:empty + .is-product-feature-rows { grid-column:1 / -1 !important; }
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-group:not(:has(> .is-product-feature-label:not(.w-condition-invisible))) > .is-product-feature-rows { grid-column:1 / -1 !important; }
.fk-product-block-visual.is-product-dashboard > img {
  transform:scale(1.006);
  transform-origin:50% 50%;
}
.fk-product-block-visual.is-product-dashboard > img[src*="fawkes-product-link-"] {
  transform:scale(1.025);
}
`;document.head.appendChild(s);
function initializeFeatureLabels(){
document.querySelectorAll('.fk-product-feature-left > .fk-product-name-dark').forEach((heading)=>{
  if(heading.textContent.trim()==='Residual Asset Value') heading.setAttribute('data-fk-wrap-residual','');
});

/* A slash-separated audience name is one text value in the component prop.
   Add a semantic soft wrap point after each slash without changing that value,
   so a narrow label column never breaks "Insurers" through the middle. */
document.querySelectorAll('.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label').forEach((label)=>{
  if(label.querySelector('wbr') || !label.textContent.includes('/')) return;
  label.innerHTML=label.innerHTML.replace(/\//g,'/<wbr>');
});
}
function initializeWhenReady(){
  initializeFeatureLabels();
  // Recheck once hydrated component content has settled; initialization is idempotent.
  setTimeout(initializeFeatureLabels,500);
  setTimeout(initializeFeatureLabels,2000);
}
if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',initializeWhenReady,{once:true});
else initializeWhenReady();
})();

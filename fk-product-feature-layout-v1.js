/*! fk-product-feature-layout — Fawkes site-header registered script — v1.3.0
   Shared Product Feature Section layout for FawkesCore, FawkesLink and
   FawkesArc. The component deliberately keeps its existing prop-bound nodes;
   CSS grid places those nodes into the two independently paced Figma columns.
   Rules are limited to the native is-product-feature-section scope class.
*/
(()=>{const s=document.createElement("style");s.textContent=`
/* The Product Feature Section has explicit left and right native wrappers.
   Their children retain their existing component-prop bindings; the wrappers
   provide independent vertical pacing instead of overlapping grid items. */
.fk-product-block.has-feature-groups.is-product-feature-section {
  display:grid !important;
  grid-template-columns:minmax(280px,min(441px,36%)) minmax(0,1fr) !important;
  column-gap:0 !important;
  align-items:start !important;
  padding:102px 69px 102px 102px !important;
}
.fk-product-block.has-feature-groups.is-product-feature-section > .is-product-content { display:none; }
.fk-product-block.has-feature-groups.is-product-feature-section > .fk-product-feature-left,
.fk-product-block.has-feature-groups.is-product-feature-section > .fk-product-feature-right {
  display:flex;
  flex-direction:column;
  min-width:0;
  width:auto;
  margin:0;
}
.fk-product-block.has-feature-groups.is-product-feature-section > .fk-product-feature-left {
  grid-column:1;
  grid-row:1;
  gap:193px;
}
.fk-product-block.has-feature-groups.is-product-feature-section > .fk-product-feature-right {
  grid-column:2;
  grid-row:1;
  gap:28px;
}
.fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-left > .fk-product-name-dark,
.fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .wb-body-large-24-light {
  min-width:0;
  width:100%;
  margin:0;
  grid-column:auto;
  grid-row:auto;
}
.fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .wb-body-large-24-light {
  font-size:24px !important;
  font-weight:500 !important;
  line-height:1.5 !important;
}
.fk-product-feature-left > .fk-product-name-dark {
  white-space:normal !important;
  overflow-wrap:normal;
  box-sizing:border-box;
  padding-right:32px;
}
.fk-product-feature-left > .fk-product-name-dark[data-fk-wrap-residual] {
  max-width:10ch !important;
}
.fk-product-block-visual.is-product-dashboard {
  overflow:hidden !important;
  border-radius:10px;
}
.fk-product-block-visual.is-product-dashboard > img {
  transform:scale(1.006);
  transform-origin:50% 50%;
}
.fk-product-block-visual.is-product-dashboard > img[src*="fawkes-product-link-health-figma-3x"] {
  transform:scale(1.012);
}
.fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout {
  display:flex !important;
  flex-direction:column !important;
  flex-wrap:nowrap !important;
  width:100%;
  min-width:0;
  margin:0 !important;
  gap:45px !important;
  grid-column:auto;
  grid-row:auto;
}
.fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard {
  flex:0 0 auto !important;
  min-width:0;
  width:100%;
  max-width:900px;
  height:auto !important;
  min-height:0 !important;
  aspect-ratio:auto !important;
  position:relative !important;
  margin:0;
  grid-column:auto;
  grid-row:auto;
}
.fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard > img {
  position:static !important;
  display:block;
  width:100% !important;
  height:auto !important;
  max-width:none;
}
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-group {
  display:grid !important;
  grid-template-columns:var(--fk-audience-label-width,64px) minmax(0,1fr) !important;
  column-gap:42px !important;
  row-gap:0 !important;
  flex:0 0 auto !important;
  width:100%;
  min-width:0;
  margin:0 !important;
}
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label {
  display:block;
  grid-column:1 !important;
  grid-row:1 !important;
  width:100%;
  max-width:none;
  min-width:0;
  margin:0;
  padding-right:0 !important;
  /* A long audience label may wrap after its slash, but never through a word. */
  overflow-wrap:normal;
  word-break:normal;
  white-space:normal !important;
  font-size:16px !important;
  font-weight:500 !important;
  line-height:1.5 !important;
  letter-spacing:.8px !important;
}
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label:empty { display:none; }
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-rows {
  display:flex !important;
  flex-direction:column !important;
  grid-column:2 !important;
  grid-row:1 !important;
  min-width:0;
  gap:10px !important;
  margin:0 !important;
}
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label:empty + .is-product-feature-rows { grid-column:1 / -1 !important; }
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-group:not(:has(> .is-product-feature-label:not(.w-condition-invisible))) > .is-product-feature-rows { grid-column:1 / -1 !important; }
.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-rows .fk-feature-line {
  min-width:0;
  overflow-wrap:anywhere;
  font-size:18px !important;
  font-weight:300 !important;
  line-height:1.5 !important;
}

/* Tablet and phone follow the content reading order: heading, description,
   dashboard, then benefits. display:contents preserves the bound children
   while each gets an explicit flex order. */
@media (max-width:991px) {
  .fk-product-block.has-feature-groups.is-product-feature-section {
    display:flex !important;
    flex-direction:column !important;
    gap:24px !important;
    padding:48px 40px !important;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section > .fk-product-feature-left,
  .fk-product-block.has-feature-groups.is-product-feature-section > .fk-product-feature-right {
    display:contents !important;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-left > .fk-product-name-dark {
    order:1;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .wb-body-large-24-light {
    order:2;
    font-size:20px !important;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard {
    order:3;
    width:100% !important;
    max-width:none !important;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout {
    order:4;
    gap:28px !important;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-group {
    grid-template-columns:minmax(0,1fr) !important;
    row-gap:10px !important;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label {
    grid-column:1 !important;
    grid-row:1 !important;
    max-width:none;
  }
  .fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-rows {
    grid-column:1 !important;
    grid-row:2 !important;
  }
}
@media (max-width:767px) {
  .fk-product-block.has-feature-groups.is-product-feature-section { gap:18px !important; padding:28px 18px !important; }
  .fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .wb-body-large-24-light { font-size:18px !important; }
  .fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout { gap:22px !important; }
}
@media (max-width:479px) {
  .fk-product-block.has-feature-groups.is-product-feature-section { padding:24px 16px !important; }
  .fk-product-block.has-feature-groups.is-product-feature-section .fk-product-feature-right > .wb-body-large-24-light { font-size:17px !important; }
}
`;document.head.appendChild(s);
document.querySelectorAll('.fk-product-feature-left > .fk-product-name-dark').forEach((heading)=>{
  if(heading.textContent.trim()==='Residual Asset Value') heading.setAttribute('data-fk-wrap-residual','');
});
/* One shared label width per section keeps every separator on the same axis.
   Longer audience names use a wider fixed column across that whole section. */
document.querySelectorAll('.fk-feature-groups.is-product-feature-layout').forEach((groups)=>{
  const labels=Array.from(groups.querySelectorAll('.is-product-feature-label'));
  const wide=labels.some(label=>label.textContent.trim().length>8);
  groups.style.setProperty('--fk-audience-label-width',wide?'150px':'64px');
});
/* A slash-separated audience name is one text value in the component prop.
   Add a semantic soft wrap point after each slash without changing that value,
   so a narrow label column never breaks "Insurers" through the middle. */
document.querySelectorAll('.fk-product-block.has-feature-groups.is-product-feature-section .is-product-feature-label').forEach((label)=>{
  if(label.querySelector('wbr') || !label.textContent.includes('/')) return;
  label.innerHTML=label.innerHTML.replace(/\//g,'/<wbr>');
});
})();

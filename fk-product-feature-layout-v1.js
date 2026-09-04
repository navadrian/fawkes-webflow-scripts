/*! fk-product-feature-layout — Fawkes site-header registered script — v1.0.0
   Shared Product Feature Section layout for FawkesCore, FawkesLink and
   FawkesArc. The component deliberately keeps its existing prop-bound nodes;
   CSS grid places those nodes into the two independently paced Figma columns.
*/
(()=>{const s=document.createElement("style");s.textContent=`
/* The Product Feature Section has explicit left and right native wrappers.
   Their children retain their existing component-prop bindings; the wrappers
   provide independent vertical pacing instead of overlapping grid items. */
.fk-product-block.has-feature-groups {
  display:grid !important;
  grid-template-columns:minmax(0,1fr) minmax(0,2fr) !important;
  column-gap:clamp(40px,5.5vw,88px) !important;
  align-items:start !important;
}
.fk-product-block.has-feature-groups > .is-product-content { display:none; }
.fk-product-block.has-feature-groups > .fk-product-feature-left,
.fk-product-block.has-feature-groups > .fk-product-feature-right {
  display:flex;
  flex-direction:column;
  min-width:0;
  width:auto;
  margin:0;
}
.fk-product-block.has-feature-groups > .fk-product-feature-left {
  grid-column:1;
  grid-row:1;
  gap:clamp(76px,12vw,193px);
}
.fk-product-block.has-feature-groups > .fk-product-feature-right {
  grid-column:2;
  grid-row:1;
  gap:28px;
}
.fk-product-block.has-feature-groups .fk-product-feature-left > .fk-product-name-dark,
.fk-product-block.has-feature-groups .fk-product-feature-right > .wb-body-large-24-light {
  min-width:0;
  width:100%;
  margin:0;
  grid-column:auto;
  grid-row:auto;
}
.fk-product-block.has-feature-groups .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout {
  display:flex !important;
  flex-direction:column !important;
  flex-wrap:nowrap !important;
  width:100%;
  min-width:0;
  margin:0 !important;
  gap:42px !important;
  grid-column:auto;
  grid-row:auto;
}
.fk-product-block.has-feature-groups .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard {
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
.fk-product-block.has-feature-groups .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard > img {
  position:static !important;
  display:block;
  width:100% !important;
  height:auto !important;
  max-width:none;
}
.fk-product-block.has-feature-groups .is-product-feature-group {
  display:grid !important;
  grid-template-columns:54px minmax(0,1fr) !important;
  gap:0 42px !important;
  flex:0 0 auto !important;
  width:100%;
  min-width:0;
  margin:0 !important;
}
.fk-product-block.has-feature-groups .is-product-feature-label {
  display:block;
  grid-column:1 !important;
  grid-row:1 !important;
  width:54px;
  min-width:0;
  margin:0;
  padding-right:0 !important;
  font-size:16px !important;
  font-weight:500 !important;
  line-height:1.5 !important;
  letter-spacing:.8px !important;
}
.fk-product-block.has-feature-groups .is-product-feature-label:empty { display:none; }
.fk-product-block.has-feature-groups .is-product-feature-rows {
  display:flex !important;
  flex-direction:column !important;
  grid-column:2 !important;
  grid-row:1 !important;
  min-width:0;
  gap:10px !important;
  margin:0 !important;
}
.fk-product-block.has-feature-groups .is-product-feature-label:empty + .is-product-feature-rows { grid-column:1 / -1 !important; }
.fk-product-block.has-feature-groups .is-product-feature-group:not(:has(> .is-product-feature-label:not(.w-condition-invisible))) > .is-product-feature-rows { grid-column:1 / -1 !important; }
.fk-product-block.has-feature-groups .is-product-feature-rows .fk-feature-line {
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
  .fk-product-block.has-feature-groups {
    display:flex !important;
    flex-direction:column !important;
    gap:24px !important;
  }
  .fk-product-block.has-feature-groups > .fk-product-feature-left,
  .fk-product-block.has-feature-groups > .fk-product-feature-right {
    display:contents !important;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-left > .fk-product-name-dark {
    order:1;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-right > .wb-body-large-24-light {
    order:2;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard {
    order:3;
    width:100% !important;
    max-width:none !important;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout {
    order:4;
    gap:28px !important;
  }
}
@media (max-width:767px) {
  .fk-product-block.has-feature-groups { gap:18px !important; }
  .fk-product-block.has-feature-groups .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout { gap:22px !important; }
  .fk-product-block.has-feature-groups .is-product-feature-group { gap:0 18px !important; }
}
`;document.head.appendChild(s)})();

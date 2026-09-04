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
  display:grid;
  grid-template-columns:minmax(0,1fr) minmax(0,2fr);
  column-gap:clamp(40px,5.5vw,88px);
  align-items:start;
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
  display:flex;
  flex-direction:column;
  flex-wrap:nowrap;
  width:100%;
  min-width:0;
  margin:0;
  gap:42px;
  grid-column:auto;
  grid-row:auto;
}
.fk-product-block.has-feature-groups .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard {
  min-width:0;
  width:100%;
  max-width:900px;
  margin:0;
  grid-column:auto;
  grid-row:auto;
}
.fk-product-block.has-feature-groups .is-product-feature-group {
  display:grid;
  grid-template-columns:54px minmax(0,1fr);
  column-gap:42px;
  row-gap:0;
  flex:0 0 auto;
  width:100%;
  min-width:0;
  margin:0;
}
.fk-product-block.has-feature-groups .is-product-feature-label {
  display:block;
  grid-column:1;
  grid-row:1;
  width:54px;
  min-width:0;
  margin:0;
}
.fk-product-block.has-feature-groups .is-product-feature-label:empty { display:none; }
.fk-product-block.has-feature-groups .is-product-feature-rows {
  display:flex;
  flex-direction:column;
  grid-column:2;
  grid-row:1;
  min-width:0;
  gap:10px;
  margin:0;
}
.fk-product-block.has-feature-groups .is-product-feature-label:empty + .is-product-feature-rows { grid-column:1 / -1; }
.fk-product-block.has-feature-groups .is-product-feature-group:not(:has(> .is-product-feature-label:not(.w-condition-invisible))) > .is-product-feature-rows { grid-column:1 / -1; }
.fk-product-block.has-feature-groups .is-product-feature-rows .fk-feature-line {
  min-width:0;
  overflow-wrap:anywhere;
}

/* Tablet and phone follow the content reading order: heading, description,
   dashboard, then benefits. display:contents preserves the bound children
   while each gets an explicit flex order. */
@media (max-width:991px) {
  .fk-product-block.has-feature-groups {
    display:flex;
    flex-direction:column;
    gap:24px;
  }
  .fk-product-block.has-feature-groups > .fk-product-feature-left,
  .fk-product-block.has-feature-groups > .fk-product-feature-right {
    display:contents;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-left > .fk-product-name-dark {
    order:1;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-right > .wb-body-large-24-light {
    order:2;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-right > .fk-product-block-visual.is-product-dashboard {
    order:3;
    width:100%;
    max-width:none;
  }
  .fk-product-block.has-feature-groups .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout {
    order:4;
    gap:28px;
  }
}
@media (max-width:767px) {
  .fk-product-block.has-feature-groups { gap:18px; }
  .fk-product-block.has-feature-groups .fk-product-feature-left > .fk-feature-groups.is-product-feature-layout { gap:22px; }
  .fk-product-block.has-feature-groups .is-product-feature-group { column-gap:18px; }
}
`;document.head.appendChild(s)})();

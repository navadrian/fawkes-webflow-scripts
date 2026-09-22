/* CMS option presentation and dynamic current-item exclusion in existing bundle. */
(function () {
 'use strict';
 var arcPattern = 'https://cdn.prod.website-files.com/6a8826652e72a7fcc7c3bf57/6a9b9973d005990379f0e585_fawkesarc-pattern-4k.webp';
 var linkPattern = 'https://cdn.prod.website-files.com/6a8826652e72a7fcc7c3bf57/6a9b99732ce0ff1e9454a8fc_fawkeslink-pattern-4k.webp';
 var reviewAssets = 'https://cdn.jsdelivr.net/gh/navadrian/fawkes-webflow-scripts@419078329bb4bbbc260dea3dff5b3342087a4c2b/';
 function text(tag, cls, value) { var e=document.createElement(tag); e.className=cls; e.textContent=value; return e; }
 function syncMoreCases() {
  document.querySelectorAll('[data-fk-more-cases] .w-dyn-item').forEach(function(item) {
   var marker=item.querySelector('[data-fk-case-slug]'); var slug=marker&&marker.textContent.trim(); if(!slug) return;
   var path='/case-studies/'+slug;
   item.hidden=location.pathname.replace(/\/$/,'')===path;
   item.querySelectorAll('a.fk-cs-card-link').forEach(function(a){if(a.getAttribute('href')!==path)a.href=path;});
  });
 }
 function watchMoreCases() {
  var host=document.querySelector('[data-fk-more-cases]'); if(!host) return;
  syncMoreCases();
  if(host.__fkMoreCasesObserver) return;
  host.setAttribute('data-fk-more-cases-ready','true');
  host.__fkMoreCasesObserver=new MutationObserver(syncMoreCases);
  host.__fkMoreCasesObserver.observe(host,{subtree:true,childList:true,attributes:true,attributeFilter:['href']});
 }
 function run() {
  // The source exports previously contained the wrong pre-crop. Preserve card geometry.
  function source(img,url) { if(!img)return; img.removeAttribute('srcset'); img.src=url; }
  if(location.pathname.replace(/\/$/,'')==='/contact') {
   var contactPanel=document.querySelector('.contact-image-panel');
   if(contactPanel) {
    source(contactPanel.querySelector('img'),'https://cdn.jsdelivr.net/gh/navadrian/fawkes-webflow-scripts@3509143294e31e233ae3fb0677ffadd59c507778/contact-panel-figma.png');
    // Exact Figma panel export already includes its 70% dark scrim.
    var contactScrim=contactPanel.querySelector('.hero-scrim');
    if(contactScrim) contactScrim.style.opacity='0';
   }
  }
  document.querySelectorAll('.fk-xlink-card[href="/fawkesarc"] > img').forEach(function(img){source(img,arcPattern);});
  document.querySelectorAll('.fk-xlink-card[href="/fawkeslink"] > img').forEach(function(img){source(img,linkPattern);});
  // Exact line endings from the main Figma product frames. Phone/tablet wrapping remains natural.
  var featureLines = [
   ['Continuous health tracking, degradation velocity and','remaining useful life across your assets.'],
   ['Early identification of thermal risk, cell imbalance and anomalies','before they affect operations.'],
   ['Usage behaviour, degradation drivers and','economic impact across the asset lifecycle.'],
   ['Independent measure of battery condition relative to when it was new, based','on electrochemical data rather than age or odometer reading.'],
   ['Physics-based valuation of remaining battery worth, giving financiers and','resellers an independent, data-backed basis for pricing decisions.'],
   ['Current and projected range based on real battery condition today and','degradation trajectory over time, delivered as a visual output.'],
   ['Size the system against real battery ageing behaviour with CapEx calculated','directly from the configuration output.'],
   ['Compare sizing configurations, cell chemistries, SoC windows, dispatch','strategies and thermal conditions side by side before committing capital.'],
   ['Model how much energy the system will actually deliver across its full','operational lifetime under your specific operating conditions.']
  ];
  document.querySelectorAll('.fk-product-feature-right > .wb-body-large-24-light').forEach(function(e){
   var lines=featureLines.find(function(lines){return lines.join(' ')===e.textContent.trim();});
   if(!lines)return;
   e.replaceChildren(document.createTextNode(lines[0]+' '),text('span','fk-figma-feature-line',lines[1]));
  });
  // The article CTA is native Webflow markup with CMS-bound image, copy, link,
  // and product choice. Runtime only formats the product label and button copy;
  // it no longer replaces the card or stores product associations in code.
  document.querySelectorAll('.article-inline-cta').forEach(function(host) {
   var marker=host.querySelector('[data-fk-product-choice]');
   var link=host.querySelector('.article-inline-cta-link');
   var name=marker&&marker.textContent.trim();
   if(!name) return;
   var prefix='Fawkes';
   if(name.indexOf(prefix)===0) {
    marker.replaceChildren(document.createTextNode(prefix),text('span','fk-product-name-accent',name.slice(prefix.length)));
   }
   if(link) link.textContent='Explore '+name;
  });
  watchMoreCases();
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
 window.Webflow=window.Webflow||[];
 window.Webflow.push(watchMoreCases);
 window.setTimeout(watchMoreCases,0);
})();

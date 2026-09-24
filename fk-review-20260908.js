/* CMS option presentation. Related case exclusion and card links are Webflow-native. */
(function () {
 'use strict';
 function text(tag, cls, value) { var e=document.createElement(tag); e.className=cls; e.textContent=value; return e; }
 function run() {
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
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();

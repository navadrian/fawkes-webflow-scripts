/* CMS option presentation and dynamic current-item exclusion in existing bundle. */
(function () {
 'use strict';
 var pattern = 'https://cdn.prod.website-files.com/6a8826652e72a7fcc7c3bf57/6a9b99724d5a7511f6b50d88_fawkescore-pattern-4k.webp';
 var products = {
  FawkesCore: {suffix:'Core',description:'Battery Observability Platform',url:'/fawkescore'},
  FawkesLink: {suffix:'Link',description:'Quick Battery Health Assessment Device',url:'/fawkeslink'},
  FawkesArc: {suffix:'Arc',description:'Sizing and Simulation Design Platform',url:'/fawkesarc'}
 };
 function text(tag, cls, value) { var e=document.createElement(tag); e.className=cls; e.textContent=value; return e; }
 function productCard(host, name) {
  var p=products[name]; if(!p) return;
  var a=document.createElement('a'); a.className='fk-xlink-card fk-review-product-card w-inline-block'; a.href=p.url;
  var img=document.createElement('img'); img.src=pattern; img.alt=''; img.loading='lazy'; a.appendChild(img);
  a.appendChild(text('div','fk-xlink-eyebrow','Product'));
  var title=text('div','fk-xlink-title fk-xlink-product-title','Fawkes'); title.appendChild(text('span','fk-product-name-accent',p.suffix)); a.appendChild(title);
  a.appendChild(text('div','fk-xlink-description',p.description)); a.appendChild(text('div','fk-xlink-btn','Explore '+name));
  host.replaceWith(a);
 }
 function run() {
  document.querySelectorAll('.article-inline-cta').forEach(function(host) {
   var marker=host.querySelector('[data-fk-product-choice]'); var name=marker&&marker.textContent.trim();
   var ids={'4c926dae7af13ed39304f2a159119fe5':'FawkesCore','9ff66d4b1e83a3bb7d96575da15fb96e':'FawkesLink','fbefedfc11d63b45e77bb2fe75ab5860':'FawkesArc'};
   productCard(host,ids[name]||name);
  });
  document.querySelectorAll('[data-fk-more-cases] .w-dyn-item').forEach(function(item) {
   var marker=item.querySelector('[data-fk-case-slug]'); var slug=marker&&marker.textContent.trim(); if(!slug) return;
   var path='/case-studies/'+slug; if(location.pathname.replace(/\/$/,'')===path) {item.hidden=true;return;}
   item.querySelectorAll('a.fk-cs-card-link').forEach(function(a){a.href=path;});
  });
  var related=document.querySelector('.casestudy-related_inner');
  if(related) {
   // Explicit associations verified against CMS and article content, September 8.
   var mapping={'ev-fleet-false-positive-reduction':'FawkesCore','ev-financier-resale-confidence':'FawkesLink','bess-unplanned-downtime-reduction':'FawkesCore'};
   var name=mapping[location.pathname.split('/').filter(Boolean).pop()];
   var cards=related.querySelectorAll('a');
   cards.forEach(function(card){
    if(/RELATED PRODUCT/i.test(card.textContent)&&name) {card.parentElement.classList.add('fk-review-related-row'); productCard(card,name);}
    else if(/RELATED INDUSTRY/i.test(card.textContent)) {
     var industries={
      'EV Fleets':{url:'/ev-fleets',image:'6a98ffae2efaf3ef3178f187_fawkescore-industry-fleets.png'},
      'EV Financiers':{url:'/ev-financiers',image:'6a98ffaa2efaf3ef3178ee51_fawkeslink-industry-application-card.png'},
      'Battery Energy Storage Systems':{url:'/bess',image:'6a98ffae460b99379e4496ff_fawkescore-industry-bess.png'},
      'BESS':{url:'/bess',image:'6a98ffae460b99379e4496ff_fawkescore-industry-bess.png'}
     };
     var label=Object.keys(industries).find(function(key){return card.textContent.indexOf(key)!==-1;});
     if(label) {
      var industry=industries[label]; card.classList.add('fk-xlink-card','fk-review-product-card'); card.href=industry.url;
      card.replaceChildren(); var image=document.createElement('img'); image.src='https://cdn.prod.website-files.com/6a8826652e72a7fcc7c3bf57/'+industry.image; image.alt=''; image.loading='lazy'; card.appendChild(image);
      card.appendChild(text('div','fk-xlink-eyebrow','Industry application')); card.appendChild(text('div','fk-xlink-title',label)); card.appendChild(text('div','fk-xlink-btn','Explore '+label));
     }
    }
   });
  }
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run); else run();
})();

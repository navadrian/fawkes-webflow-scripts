/* Mobile-only enhancement. Restores original attributes/state on leaving <=767px. */
(function () {
 'use strict';
 function run() {
  var media=window.matchMedia('(max-width:767px)'), cleanup=[];
  function sync() {
   cleanup.forEach(function(stop){stop();}); cleanup=[];
   if(!media.matches) return;
   document.querySelectorAll('.fk-nav-hamburger').forEach(function(burger) {
    var pill=burger.closest('.fk-nav-pill'); if(!pill) return;
    var saved={}; ['role','tabindex','aria-label','aria-expanded'].forEach(function(key){saved[key]=burger.getAttribute(key);});
    burger.setAttribute('role','button'); burger.setAttribute('tabindex','0');
    function update() { var open=pill.classList.contains('mobile-menu-open'); burger.setAttribute('aria-expanded',String(open)); burger.setAttribute('aria-label',open?'Close navigation':'Open navigation'); }
    function click() { update(); }
    function key(event) {
     if(!media.matches) return;
     if(event.target===burger && (event.key==='Enter'||event.key===' ')) { event.preventDefault(); burger.click(); }
     if(!pill.classList.contains('mobile-menu-open')) return;
     if(event.key==='Escape') { event.preventDefault(); event.stopPropagation(); burger.click(); burger.focus(); }
     if(event.key==='Tab') {
      var focusable=Array.prototype.filter.call(pill.querySelectorAll('a[href],button,[tabindex="0"]'),function(e){return e.getClientRects().length && window.getComputedStyle(e).visibility!=='hidden';});
      var first=focusable[0], last=focusable[focusable.length-1];
      if(event.shiftKey && (document.activeElement===first||!pill.contains(document.activeElement))) {event.preventDefault(); last.focus();}
      else if(!event.shiftKey && (document.activeElement===last||!pill.contains(document.activeElement))) {event.preventDefault(); first.focus();}
     }
    }
    burger.addEventListener('click',click); document.addEventListener('keydown',key,true); update();
    cleanup.push(function() {
     if(pill.classList.contains('mobile-menu-open')) burger.click();
     burger.removeEventListener('click',click); document.removeEventListener('keydown',key,true);
     Object.keys(saved).forEach(function(k){if(saved[k]===null) burger.removeAttribute(k);else burger.setAttribute(k,saved[k]);});
    });
   });
  }
  media.addEventListener('change',sync); sync();
 }
 if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',run);else run();
})();

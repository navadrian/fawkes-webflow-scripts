/* Consolidate first-party runtime behavior into the existing interaction slot.
 * Vendor dependencies (GSAP + ScrollTrigger) remain separate and load first.
 */
const fs = require('fs');
const sources = [
  'fk-nav-disclosure-v1.js',
  'heropinv3.js',
  'fk-reveal.js',
  'fk-site-interactions.js',
  'fk-home-hero-rotation.js',
  'fk-home-card-link.js',
  'fk-review-20260908.js',
  'fk-responsive-nav.js',
  'fk-home-tabs-native.js',
  'fk-product-feature-runtime.js',
  'fk-faq-native.js'
];
const bundle = sources.map(path => fs.readFileSync(path, 'utf8').trimEnd()).join('\n;\n') + '\n';
fs.writeFileSync('fk-site-interactions-bundle.js', bundle);
console.log('Built interaction bundle from ' + sources.join(', '));

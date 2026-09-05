/* Keep the home hero controller in the existing interaction script slot. */
const fs = require('fs');
const sources = ['fk-site-interactions.js', 'fk-home-hero-rotation.js', 'fk-home-card-link.js'];
const bundle = sources.map(path => fs.readFileSync(path, 'utf8')).join('\n;\n');
fs.writeFileSync('fk-site-interactions-bundle.js', bundle);
console.log('Built interaction bundle from ' + sources.join(', '));

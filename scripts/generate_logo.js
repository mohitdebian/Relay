const TextToSVG = require('text-to-svg');
const fs = require('fs');

const textToSVG = TextToSVG.loadSync('./Silkscreen-Bold.ttf');

const options = { x: 0, y: 0, fontSize: 64, anchor: 'top' };
let svg = textToSVG.getSVG('RELAY_', options);

// Inject dark/light mode CSS
const style = '<style>path { fill: #1f2328; } @media (prefers-color-scheme: dark) { path { fill: #f0f6fc; } }</style>';
svg = svg.replace(/<svg([^>]*)>/, `<svg$1>${style}`);

fs.writeFileSync('../docs/logo.svg', svg);
console.log('Saved ../docs/logo.svg');

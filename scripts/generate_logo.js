const TextToSVG = require('text-to-svg');
const fs = require('fs');

const textToSVG = TextToSVG.loadSync('./Silkscreen-Bold.ttf');

const attributes = { fill: 'black' };
const options = { x: 0, y: 0, fontSize: 64, anchor: 'top', attributes: attributes };

const svg = textToSVG.getSVG('RELAY_', options);

fs.writeFileSync('../docs/logo.svg', svg);
console.log('Saved ../docs/logo.svg');

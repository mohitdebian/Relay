const TextToSVG = require('text-to-svg');
const fs = require('fs');
const path = require('path');

const textToSVG = TextToSVG.loadSync('./Silkscreen-Bold.ttf');

const optionsLight = { x: 0, y: 0, fontSize: 64, anchor: 'top', attributes: { fill: '#1f2328' } };
const optionsDark = { x: 0, y: 0, fontSize: 64, anchor: 'top', attributes: { fill: '#f0f6fc' } };

const svgLight = textToSVG.getSVG('RELAY_', optionsLight);
const svgDark = textToSVG.getSVG('RELAY_', optionsDark);

fs.writeFileSync('../docs/logo-light.svg', svgLight);
fs.writeFileSync('../docs/logo-dark.svg', svgDark);
console.log('Saved logo light & dark');

const headers = [
  'Documentation',
  'Features',
  'Architecture',
  'Getting Started',
  'Tech Stack',
  'Project Structure',
  'Contributing',
  'License'
];

const headerOptionsLight = { x: 0, y: 0, fontSize: 32, anchor: 'top', attributes: { fill: '#1f2328' } };
const headerOptionsDark = { x: 0, y: 0, fontSize: 32, anchor: 'top', attributes: { fill: '#f0f6fc' } };

headers.forEach(header => {
  const svgLight = textToSVG.getSVG(header, headerOptionsLight);
  const svgDark = textToSVG.getSVG(header, headerOptionsDark);
  
  const baseFilename = header.toLowerCase().replace(/\s+/g, '-');
  fs.writeFileSync(path.join('../docs/headers', `${baseFilename}-light.svg`), svgLight);
  fs.writeFileSync(path.join('../docs/headers', `${baseFilename}-dark.svg`), svgDark);
  console.log('Saved', baseFilename);
});

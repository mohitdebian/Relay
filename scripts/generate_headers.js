const TextToSVG = require('text-to-svg');
const fs = require('fs');
const path = require('path');

const textToSVG = TextToSVG.loadSync('./Silkscreen-Bold.ttf');
const attributes = { fill: 'black' };
const options = { x: 0, y: 0, fontSize: 32, anchor: 'top', attributes: attributes };

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

if (!fs.existsSync('../docs/headers')) {
  fs.mkdirSync('../docs/headers', { recursive: true });
}

headers.forEach(header => {
  const svg = textToSVG.getSVG(header, options);
  const filename = header.toLowerCase().replace(/\s+/g, '-') + '.svg';
  fs.writeFileSync(path.join('../docs/headers', filename), svg);
  console.log('Saved', filename);
});

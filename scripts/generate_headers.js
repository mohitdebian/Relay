const TextToSVG = require('text-to-svg');
const fs = require('fs');
const path = require('path');

const textToSVG = TextToSVG.loadSync('./Silkscreen-Bold.ttf');
const options = { x: 0, y: 0, fontSize: 32, anchor: 'top' };

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

const style = '<style>path { fill: #1f2328; } @media (prefers-color-scheme: dark) { path { fill: #f0f6fc; } }</style>';

headers.forEach(header => {
  let svg = textToSVG.getSVG(header, options);
  svg = svg.replace(/<svg([^>]*)>/, `<svg$1>${style}`);
  
  const filename = header.toLowerCase().replace(/\s+/g, '-') + '.svg';
  fs.writeFileSync(path.join('../docs/headers', filename), svg);
  console.log('Saved', filename);
});

const fs = require('fs');
const path = require('path');

const dataDir = path.join(__dirname, 'node_modules', 'postleitzahlen', 'data');
const dataDestDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDestDir)) {
  fs.mkdirSync(dataDestDir);
}
const outputFile = path.join(dataDestDir, 'cityToPlz.json');

const files = fs.readdirSync(dataDir);
const cityToPlz = {};

for (const file of files) {
  if (!file.endsWith('.json')) continue;
  const plz = file.replace('.json', '');
  const content = fs.readFileSync(path.join(dataDir, file), 'utf8');
  try {
    const data = JSON.parse(content);
    for (let city of data) {
      // Normalize city name (lowercase) to make lookup easier
      let cityLower = city.toLowerCase();
      if (!cityToPlz[cityLower]) {
        cityToPlz[cityLower] = { originalName: city, plzs: [] };
      }
      cityToPlz[cityLower].plzs.push(plz);
    }
  } catch(e) {}
}

// Sort PLZs
for (const city in cityToPlz) {
  cityToPlz[city].plzs.sort();
}

fs.writeFileSync(outputFile, JSON.stringify(cityToPlz, null, 2));
console.log('Successfully created data/cityToPlz.json with ' + Object.keys(cityToPlz).length + ' cities.');

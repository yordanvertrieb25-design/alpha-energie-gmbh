const axios = require('axios');
async function test() {
  try {
    const query = `SELECT ?plz WHERE {
      ?city wdt:P17 wd:Q183;
            rdfs:label ?cityLabel.
      FILTER(LANG(?cityLabel) = 'de')
      FILTER(?cityLabel = 'Dortmund'@de)
      ?city wdt:P281 ?plz.
    }`;
    const url = 'https://query.wikidata.org/sparql?format=json&query=' + encodeURIComponent(query);
    const res = await axios.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    console.log(res.data.results.bindings.map(b => b.plz.value));
  } catch(e) {
    console.log(e.message)
  }
}
test();

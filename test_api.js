const axios = require('axios');

async function run() {
  const key = 'AIzaSyDdlESw50qc66MVxdACCfNZiCSuNdqjNik';
  console.log("Key:", key ? "Exists" : "Missing");
  const url1 = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=versicherung+in+dortmund&key=${key}`;
  const res1 = await axios.get(url1);
  console.log('Page 1:', res1.data.status, res1.data.results.length);
  
  if (res1.data.next_page_token) {
    console.log("Sleeping 2s...");
    await new Promise(r => setTimeout(r, 2000));
    const url2 = `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${res1.data.next_page_token}&key=${key}`;
    const res2 = await axios.get(url2);
    console.log('Page 2:', res2.data.status, res2.data.results ? res2.data.results.length : 0);
  }
}

run();

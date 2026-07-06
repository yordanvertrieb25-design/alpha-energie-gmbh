const { crawlWebsiteForEmail } = require('../services/scraperService');
const http = require('http');

const mockHttpServer = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  const chunkSize = 1024 * 1024; // 1MB
  res.write('<html><body>');
  for (let i = 0; i < 10; i++) {
    res.write('a'.repeat(chunkSize));
  }
  // Let's add a space here
  res.end(' info@massive-payload.de</body></html>');
});

mockHttpServer.listen(0, '127.0.0.1', async () => {
  const port = mockHttpServer.address().port;
  console.log(`Server listening on port ${port}`);
  try {
    const email = await crawlWebsiteForEmail(`http://127.0.0.1:${port}`);
    console.log("Crawl Result:", JSON.stringify(email));
  } catch (err) {
    console.error("Crawl Error:", err);
  } finally {
    mockHttpServer.close();
  }
});

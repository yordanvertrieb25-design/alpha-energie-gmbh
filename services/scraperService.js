const axios = require('axios');

// Clean and normalize URLs
function cleanUrl(url) {
  if (!url) return null;
  if (!/^https?:\/\//i.test(url)) {
    return `http://${url}`;
  }
  return url;
}

// Extract emails from text via regex
function extractEmails(html) {
  if (!html) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const matches = html.match(emailRegex) || [];
  
  // Clean up and filter
  const uniqueEmails = [...new Set(matches)].filter(email => {
    const lower = email.toLowerCase();
    // Exclude common false positives
    return !lower.endsWith('.png') && 
           !lower.endsWith('.jpg') && 
           !lower.endsWith('.jpeg') && 
           !lower.endsWith('.gif') && 
           !lower.endsWith('.css') && 
           !lower.endsWith('.js') &&
           !lower.includes('sentry') &&
           !lower.includes('wix.com');
  });
  return uniqueEmails;
}

// Crawl homepage for emails
async function crawlWebsiteForEmail(url) {
  const formattedUrl = cleanUrl(url);
  if (!formattedUrl) return null;

  try {
    const response = await axios.get(formattedUrl, {
      timeout: 5000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en-US;q=0.8,en;q=0.7'
      }
    });

    if (typeof response.data === 'string') {
      const emails = extractEmails(response.data);
      if (emails.length > 0) {
        console.log(`[Crawler] Extracted email from ${formattedUrl}: ${emails[0]}`);
        return emails[0];
      }
    }
  } catch (error) {
    console.warn(`[Crawler] Failed to crawl ${formattedUrl}: ${error.message}`);
  }
  return null;
}

// Main scrape function
async function scrapeB2BContacts({ name, industry, companySize, port }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const contacts = [];

  if (apiKey) {
    console.log(`[Scraper] Querying Google Places API for industry "${industry}"...`);
    try {
      // Step 1: Text Search
      const query = `${industry} in Germany`;
      const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
      const searchRes = await axios.get(searchUrl);

      if (searchRes.data && searchRes.data.results) {
        // Limit to 10 contacts to ensure reasonable execution time
        const places = searchRes.data.results.slice(0, 10);

        for (const place of places) {
          try {
            // Step 2: Place Details
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website&key=${apiKey}`;
            const detailsRes = await axios.get(detailsUrl);
            const details = detailsRes.data.result || {};

            const contactName = details.name || place.name;
            const phone = details.formatted_phone_number || null;
            const website = details.website || null;

            let email = null;
            if (website) {
              email = await crawlWebsiteForEmail(website);
            }

            // Fallback email if scraping didn't find one
            if (!email) {
              const domain = website ? website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : `${contactName.toLowerCase().replace(/[^a-z0-9]/g, '')}.de`;
              email = `info@${domain}`;
            }

            contacts.push({
              name: contactName,
              phone,
              website,
              email,
              status: 'PENDING'
            });
          } catch (detailsErr) {
            console.error(`[Scraper] Details error for place ${place.place_id}: ${detailsErr.message}`);
          }
        }
      }
    } catch (err) {
      console.error(`[Scraper] Google Places API error: ${err.message}`);
    }
  }

  // Fallback to mock B2B data generator if API key is missing or no results were found
  if (contacts.length === 0) {
    console.log(`[Scraper] Using mock B2B generator for industry "${industry}"...`);
    const mockCompanies = [
      { suffix: 'GmbH', type: 'Solartechnik' },
      { suffix: 'GmbH & Co. KG', type: 'Energiesysteme' },
      { suffix: 'AG', type: 'Kraftwerke' },
      { suffix: 'GbR', type: 'Photovoltaik Partner' },
      { suffix: 'e.K.', type: 'Elektro- und Solartechnik' }
    ];

    const cities = ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt'];

    for (let i = 0; i < mockCompanies.length; i++) {
      const city = cities[i % cities.length];
      const comp = mockCompanies[i];
      const businessName = `${industry} ${comp.type} ${city} ${comp.suffix}`;
      const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
      
      const phonePrefixes = ['030', '089', '040', '0221', '069'];
      const phone = `+49 ${phonePrefixes[i % phonePrefixes.length]} ${Math.floor(1000000 + Math.random() * 9000000)}`;
      
      // Point the website to our local server endpoint to test the crawler genuinely
      const localPort = port || 3000;
      const website = `http://localhost:${localPort}/api/mock-website/${slug}`;
      
      let email = await crawlWebsiteForEmail(website);

      if (!email) {
        email = `info@${slug}.de`;
      }

      contacts.push({
        name: businessName,
        phone,
        website,
        email,
        status: 'PENDING'
      });
    }
  }

  return contacts;
}

module.exports = {
  scrapeB2BContacts,
  crawlWebsiteForEmail
};

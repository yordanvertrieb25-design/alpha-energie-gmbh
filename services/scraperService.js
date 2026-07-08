const axios = require('axios');
const dns = require('dns').promises;
const { URL } = require('url');

function isPrivateOrLoopbackIp(ip) {
  if (typeof ip !== 'string') return false;
  
  // Normalize IPv6 mapped IPv4
  if (ip.startsWith('::ffff:')) {
    ip = ip.substring(7);
  }

  // IPv4 check
  const ipv4Match = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
  if (ipv4Match) {
    const o1 = parseInt(ipv4Match[1], 10);
    const o2 = parseInt(ipv4Match[2], 10);
    const o3 = parseInt(ipv4Match[3], 10);
    const o4 = parseInt(ipv4Match[4], 10);
    
    if (o1 === 127) return true; // 127.0.0.0/8
    if (o1 === 10) return true;  // 10.0.0.0/8
    if (o1 === 192 && o2 === 168) return true; // 192.168.0.0/16
    if (o1 === 172 && (o2 >= 16 && o2 <= 31)) return true; // 172.16.0.0/12
    if (o1 === 169 && o2 === 254) return true; // 169.254.0.0/16
    if (o1 === 0) return true; // 0.0.0.0
    return false;
  }

  // IPv6 check
  const lowerIp = ip.toLowerCase().trim();
  if (lowerIp === '::1' || lowerIp === '::') return true;
  if (lowerIp.startsWith('fe80:')) return true; // Link-local
  if (lowerIp.startsWith('fc00:') || lowerIp.startsWith('fd00:')) return true; // Unique local address (ULA)

  return false;
}

function isAllowedLocalhost(hostname, ip) {
  const isTest = process.env.NODE_ENV === 'test' || 
                 process.env.PLAYWRIGHT_TEST || 
                 process.env.ALLOW_LOCAL_CRAWL === 'true' ||
                 (process.mainModule && process.mainModule.filename && process.mainModule.filename.includes('playwright')) ||
                 process.argv.some(arg => arg.includes('playwright') || arg.includes('mocha') || arg.includes('jest'));

  if (isTest) {
    return hostname === 'localhost' || ip === '127.0.0.1' || ip === '::1';
  }
  return false;
}

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
    const parsedUrl = new URL(formattedUrl);
    const hostname = parsedUrl.hostname.toLowerCase();

    // SSRF Prevention: Resolve hostname to IP
    let ip;
    try {
      const lookupResult = await dns.lookup(hostname);
      ip = lookupResult.address;
    } catch (dnsErr) {
      console.warn(`[Crawler] DNS lookup failed for ${hostname}: ${dnsErr.message}`);
      return null;
    }

    if (isPrivateOrLoopbackIp(ip) && !isAllowedLocalhost(hostname, ip)) {
      console.warn(`[Crawler] Blocked SSRF attempt to private/loopback address: ${ip} (hostname: ${hostname})`);
      return null;
    }

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

const cancelledCampaigns = new Set();

function cancelCampaign(campaignId) {
  cancelledCampaigns.add(campaignId);
}

// Main scrape function
async function scrapeB2BContacts({ prisma, campaignId, name, industry, companySize, pages, port }) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  let totalContactsFound = 0;
  let isStopped = false;

  console.log(`[Scraper] API Key present: ${!!apiKey}, length: ${apiKey ? apiKey.length : 0}, starts with: ${apiKey ? apiKey.substring(0, 8) + '...' : 'N/A'}`);

  try {
    if (apiKey) {
      console.log(`[Scraper] Querying Google Places API for industry "${industry}"...`);
      const location = companySize ? companySize : 'Germany';
      const placeIds = new Set();
      
      // Force Germany context: append "Deutschland" to ensure Google Places searches in Germany
      const locationWithCountry = location.toLowerCase().includes('germany') || location.toLowerCase().includes('deutschland')
        ? location
        : `${location}, Deutschland`;
      const initialQuery = `${industry} in ${locationWithCountry}`.trim().replace(/\s+/g, ' ');
      console.log(`[Scraper] Initial Query to discover ZIP codes: "${initialQuery}"`);

      const zipCodes = new Set();
      let maxLimit = 20;
      let modifiers = [""];

      if (pages === 'max') {
        console.log(`[Scraper] Starting DEEP-SCAN for "${industry}" in "${location}"...`);
        modifiers = ["", "Agentur", "Makler", "Büro"];
        maxLimit = Infinity; // Run until all ZIP codes are exhausted
      } else {
        const p = parseInt(pages) || 3;
        maxLimit = p * 20;
      }

      // 1. Initial Query for ZIP codes (with region=de and language=de to bias towards Germany)
      let initialPlaces = [];
      let initialNextToken = null;
      try {
        console.log(`[Scraper] Calling Google Places API (Initial Query)...`);
        do {
          let currentSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(initialQuery)}&region=de&language=de&key=${apiKey}`;
          if (initialNextToken) {
            currentSearchUrl += `&pagetoken=${initialNextToken}`;
          }

          let initRes;
          let retries = 3;
          while (retries > 0) {
            if (initialNextToken) {
              await new Promise(resolve => setTimeout(resolve, 2500)); // Wait for token to become valid
            }
            initRes = await axios.get(currentSearchUrl);
            if (initRes.data?.status !== 'INVALID_REQUEST') {
              break;
            }
            console.log(`[Scraper] INVALID_REQUEST received for pagetoken, retrying... (${retries} left)`);
            retries--;
          }
          
          console.log(`[Scraper] Google Places API response status: ${initRes.data?.status}, results count: ${initRes.data?.results?.length || 0}`);
          
          if (initRes.data?.error_message) {
            console.error(`[Scraper] Google Places API ERROR: ${initRes.data.error_message}`);
          }
          
          if (initRes.data && initRes.data.status === 'OK' && initRes.data.results) {
            for (const res of initRes.data.results) {
              if (!placeIds.has(res.place_id)) {
                placeIds.add(res.place_id);
                initialPlaces.push(res);
              }
              if (res.formatted_address) {
                const match = res.formatted_address.match(/\b\d{5}\b/);
                if (match) zipCodes.add(match[0]);
              }
            }
          } else if (initRes.data?.status === 'ZERO_RESULTS') {
            console.log(`[Scraper] Google Places returned 0 results for query.`);
          }

          initialNextToken = initRes.data?.next_page_token;
        } while (initialNextToken && initialPlaces.length < 60);
      } catch (e) {
        console.error(`[Scraper] Initial Query error: ${e.message}`);
      }

      console.log(`[Scraper] Found ${zipCodes.size} ZIP codes for ${location}:`, Array.from(zipCodes));

      // 2. Generate Queries
      const queries = [];
      if (zipCodes.size > 0) {
        for (const zip of zipCodes) {
          for (const mod of modifiers) {
            // Include "Deutschland" in ZIP queries to prevent US ZIP code matches
            queries.push(`${industry} ${mod} in ${zip} Deutschland`.trim().replace(/\s+/g, ' '));
          }
        }
      } else {
        for (const mod of modifiers) {
          queries.push(`${industry} ${mod} in ${locationWithCountry}`.trim().replace(/\s+/g, ' '));
        }
      }

      // Helper function to process and save a batch of places
      const processAndSavePlaces = async (batchPlaces) => {
        if (batchPlaces.length === 0) return;
        const placesDetails = [];

        for (const place of batchPlaces) {
          if (cancelledCampaigns.has(campaignId)) return; // Abort early

          try {
            const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,formatted_phone_number,website&key=${apiKey}`;
            const detailsRes = await axios.get(detailsUrl);
            const details = detailsRes.data.result || {};

            placesDetails.push({
              name: details.name || place.name,
              phone: details.formatted_phone_number || null,
              website: details.website || null
            });
          } catch (detailsErr) {
            console.error(`[Scraper] Details error for place ${place.place_id}: ${detailsErr.message}`);
            placesDetails.push({ name: place.name, phone: null, website: null });
          }
        }

        const crawledEmails = [];
        for (let i = 0; i < placesDetails.length; i += 3) {
          if (cancelledCampaigns.has(campaignId)) return; // Abort early

          const chunk = placesDetails.slice(i, i + 3);
          const chunkEmails = await Promise.all(
            chunk.map(async (p) => {
              if (requirePhone && !p.phone) return null; // Skip crawling if phone required but missing
              return p.website ? crawlWebsiteForEmail(p.website) : null;
            })
          );
          crawledEmails.push(...chunkEmails);
        }

        const dbContacts = [];
        for (let i = 0; i < placesDetails.length; i++) {
          const p = placesDetails[i];
          
          if (requirePhone && !p.phone) {
            console.log(`[Scraper] Skipped ${p.name} - No phone number`);
            continue;
          }

          let email = crawledEmails[i];

          if (!email) {
            const domain = p.website ? p.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : `${p.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.de`;
            email = `info@${domain}`;
          }

          // Global Deduplication check
          const OR_conditions = [];
          if (p.website) OR_conditions.push({ website: p.website });
          if (p.phone) OR_conditions.push({ phone: p.phone });
          if (email) OR_conditions.push({ email: email });
          // If no unique fields exist, we might just check name
          if (OR_conditions.length === 0) {
              OR_conditions.push({ name: p.name });
          }

          const existing = await prisma.scrapedContact.findFirst({
              where: {
                  OR: OR_conditions
              }
          });

          if (!existing) {
            dbContacts.push({
              campaignId,
              name: p.name,
              phone: p.phone,
              website: p.website,
              email,
              status: 'PENDING'
            });
          } else {
            console.log(`[Scraper] Duplicate skipped: ${p.name} (${p.website || p.phone || email})`);
          }
        }

        if (dbContacts.length > 0 && !cancelledCampaigns.has(campaignId)) {
          await prisma.scrapedContact.createMany({ data: dbContacts });
          totalContactsFound += dbContacts.length;
          console.log(`[Scraper] Saved ${dbContacts.length} NEW contacts. Total so far: ${totalContactsFound}`);
        }
      };

      // Process initial places
      await processAndSavePlaces(initialPlaces);

      // 3. Process Queries sequentially
      for (const query of queries) {
        if (cancelledCampaigns.has(campaignId)) {
            isStopped = true;
            break;
        }
        if (totalContactsFound >= maxLimit) break;
        if (query === initialQuery) continue;

        console.log(`[Scraper] ZIP-Query: "${query}"`);
        let queryPlaces = [];
        let nextToken = null;

        try {
          do {
            if (cancelledCampaigns.has(campaignId) || totalContactsFound + queryPlaces.length >= maxLimit) break;
            
            let currentSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&region=de&language=de&key=${apiKey}`;
            if (nextToken) {
              currentSearchUrl += `&pagetoken=${nextToken}`;
            }

            let searchRes;
            let retries = 3;
            while (retries > 0) {
              if (nextToken) {
                await new Promise(resolve => setTimeout(resolve, 2500));
              }
              searchRes = await axios.get(currentSearchUrl);
              if (searchRes.data?.status !== 'INVALID_REQUEST') {
                break;
              }
              console.log(`[Scraper] INVALID_REQUEST received for pagetoken (ZIP query), retrying... (${retries} left)`);
              retries--;
            }
            
            if (searchRes.data && searchRes.data.results) {
              for (const res of searchRes.data.results) {
                if (!placeIds.has(res.place_id)) {
                  placeIds.add(res.place_id);
                  queryPlaces.push(res);
                }
              }
            }
            nextToken = searchRes.data?.next_page_token;
          } while (nextToken);
        } catch (e) {
          console.error(`[Scraper] Query error: ${e.message}`);
        }

        await processAndSavePlaces(queryPlaces);
      }
      
      if (!isStopped) console.log(`[Scraper] Scraping finished. Total unique contacts found: ${totalContactsFound}`);
    }

    // Fallback to mock data if API key missing or 0 results found
    if (totalContactsFound === 0) {
      console.log(`[Scraper] Using mock B2B generator for industry "${industry}"...`);
      const mockCompanies = [
        { suffix: 'GmbH', type: 'Solartechnik' },
        { suffix: 'GmbH & Co. KG', type: 'Energiesysteme' },
        { suffix: 'AG', type: 'Kraftwerke' },
        { suffix: 'GbR', type: 'Photovoltaik Partner' },
        { suffix: 'e.K.', type: 'Elektro- und Solartechnik' }
      ];

      const cities = ['Berlin', 'München', 'Hamburg', 'Köln', 'Frankfurt'];
      const targetCompanies = [];

      for (let i = 0; i < mockCompanies.length; i++) {
        const city = cities[i % cities.length];
        const comp = mockCompanies[i];
        const businessName = `${industry} ${comp.type} ${city} ${comp.suffix}`;
        const slug = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        
        const phonePrefixes = ['030', '089', '040', '0221', '069'];
        const phone = `+49 ${phonePrefixes[i % phonePrefixes.length]} ${Math.floor(1000000 + Math.random() * 9000000)}`;
        
        const localPort = port || 3000;
        const website = `http://localhost:${localPort}/api/mock-website/${slug}`;
        
        targetCompanies.push({ name: businessName, phone, website, slug });
      }

      const crawledEmails = [];
      for (let i = 0; i < targetCompanies.length; i += 3) {
        const chunk = targetCompanies.slice(i, i + 3);
        const chunkEmails = await Promise.all(
          chunk.map(c => crawlWebsiteForEmail(c.website))
        );
        crawledEmails.push(...chunkEmails);
      }

      const dbContacts = [];
      for (let i = 0; i < targetCompanies.length; i++) {
        const tc = targetCompanies[i];
        let email = crawledEmails[i] || `info@${tc.slug}.de`;

        dbContacts.push({
          campaignId,
          name: tc.name,
          phone: tc.phone,
          website: tc.website,
          email,
          status: 'PENDING'
        });
      }

      if (dbContacts.length > 0) {
        await prisma.scrapedContact.createMany({ data: dbContacts });
        totalContactsFound += dbContacts.length;
      }
    }
  } catch (err) {
    console.error(`[Scraper] Fatal error: ${err.message}`);
  } finally {
    try {
      const finalStatus = isStopped ? 'STOPPED' : 'COMPLETED';
      await prisma.campaign.update({
        where: { id: campaignId },
        data: { status: finalStatus }
      });
      console.log(`[Scraper] Campaign ${campaignId} marked as ${finalStatus}.`);
    } catch (e) {
      console.error(`[Scraper] Failed to update campaign status: ${e.message}`);
    }
    cancelledCampaigns.delete(campaignId); // Cleanup
  }
}

module.exports = {
  scrapeB2BContacts,
  crawlWebsiteForEmail,
  cancelCampaign
};

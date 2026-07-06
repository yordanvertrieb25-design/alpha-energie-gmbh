const str = 'a'.repeat(10 * 1024 * 1024) + 'info@massive-payload.de';

console.log("Testing slice-based regex on 10MB string...");
const startS = Date.now();

function extractEmailsSmart(html) {
  if (!html || !html.includes('@')) return [];
  
  const emails = [];
  const regex = /[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,10}/g;
  
  // Find all indices of '@'
  let idx = html.indexOf('@');
  while (idx !== -1) {
    // Extract a small window around the '@'
    const start = Math.max(0, idx - 256);
    const end = Math.min(html.length, idx + 256);
    const part = html.slice(start, end);
    
    // Match in this window
    const matches = part.match(regex);
    if (matches) {
      emails.push(...matches);
    }
    
    idx = html.indexOf('@', idx + 1);
  }
  
  return [...new Set(emails)];
}

const res = extractEmailsSmart(str);
console.log(`Smart extraction took ${Date.now() - startS}ms. Result:`, res);

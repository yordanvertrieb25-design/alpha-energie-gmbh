const str = 'a'.repeat(1024 * 1024); // 1MB

console.log("Testing bounded regex...");
const startB = Date.now();
const regexB = /[a-zA-Z0-9._%+-]{1,64}@[a-zA-Z0-9.-]{1,255}\.[a-zA-Z]{2,10}/g;
const matchesB = str.match(regexB);
console.log(`Bounded regex took ${Date.now() - startB}ms, matches:`, matchesB);

console.log("Testing unbounded regex on small 10KB string first...");
const smallStr = 'a'.repeat(10000);
const startU = Date.now();
const regexU = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const matchesU = smallStr.match(regexU);
console.log(`Unbounded regex on 10KB took ${Date.now() - startU}ms`);

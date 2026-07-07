const { test, expect } = require('@playwright/test');

// Exact copy of the Heading Hierarchy check algorithm from tests/seo.spec.js
function checkHeadingHierarchy(headings) {
    let maxLevelSeen = 1;
    for (const level of headings) {
        if (level > maxLevelSeen + 1) {
            return false; // Failed
        }
        if (level > maxLevelSeen) {
            maxLevelSeen = level;
        }
    }
    return true; // Passed
}

// Exact copy of the Descriptive Anchor Text check algorithm from tests/seo.spec.js
function checkAnchorText(text) {
    const genericWords = ['click here', 'here', 'klicken', 'hier', 'mehr', 'click', 'mehr erfahren', 'erfahren'];
    const trimmed = text.trim().replace(/\s+/g, ' ').toLowerCase();
    if (trimmed) {
        if (genericWords.includes(trimmed)) {
            return false; // Failed (generic word is contained in the forbidden list)
        }
    }
    return true; // Passed
}

// Exact copy of the JSON-LD context check algorithm from tests/seo.spec.js
function checkContext(obj) {
    const contextMatches = (ctx) => {
        if (typeof ctx === 'string') {
            return /^https?:\/\/schema\.org\/?$/.test(ctx);
        }
        if (Array.isArray(ctx)) {
            return ctx.some(item => typeof item === 'string' && /^https?:\/\/schema\.org\/?$/.test(item));
        }
        return false;
    };

    if (obj && obj['@context'] && contextMatches(obj['@context'])) {
        return true;
    }
    if (obj && obj['@graph'] && Array.isArray(obj['@graph'])) {
        return obj['@graph'].some(item => checkContext(item));
    }
    return false;
}

test.describe('Adversarial SEO Checks Robustness Test', () => {

    test('1. Verify Heading Hierarchy Algorithm Vulnerability', async () => {
        // In the hierarchy h1 -> h2 -> h3 -> h2 -> h4:
        // Going from h2 (level 2) to h4 (level 4) skips h3, which is invalid.
        // However, since h3 was seen earlier, maxLevelSeen is 3.
        const invalidHierarchy = [1, 2, 3, 2, 4];
        const result = checkHeadingHierarchy(invalidHierarchy);
        
        console.log(`[Adversarial Test] Heading Hierarchy [1, 2, 3, 2, 4] check result: ${result ? 'PASSED (Vulnerability/Bypass confirmed)' : 'FAILED (Robust)'}`);
        expect(result).toBe(true); // Confirms the bypass vulnerability exists!
    });

    test('2. Verify Descriptive Anchor Text Algorithm Vulnerability', async () => {
        // Test generic words check
        const passed1 = checkAnchorText('click here'); // Should fail
        const passed2 = checkAnchorText('click here!'); // Bypassed with exclamation mark
        const passed3 = checkAnchorText('hier klicken'); // Bypassed because 'hier klicken' is not in the array
        const passed4 = checkAnchorText('mehr erfahren ->'); // Bypassed with suffix

        console.log(`[Adversarial Test] Anchor 'click here' check: ${passed1 ? 'PASSED' : 'FAILED'}`);
        console.log(`[Adversarial Test] Anchor 'click here!' check: ${passed2 ? 'PASSED (Bypass confirmed)' : 'FAILED'}`);
        console.log(`[Adversarial Test] Anchor 'hier klicken' check: ${passed3 ? 'PASSED (Bypass confirmed)' : 'FAILED'}`);
        console.log(`[Adversarial Test] Anchor 'mehr erfahren ->' check: ${passed4 ? 'PASSED (Bypass confirmed)' : 'FAILED'}`);

        expect(passed1).toBe(false);
        expect(passed2).toBe(true);
        expect(passed3).toBe(true);
        expect(passed4).toBe(true);
    });

    test('3. Verify JSON-LD Context check with Array representation and top-level array', async () => {
        const topLevelArray = [
            {
                "@context": "https://schema.org",
                "@type": "WebPage"
            }
        ];
        const result = checkContext(topLevelArray);
        console.log(`[Adversarial Test] JSON-LD Top-level Array context check result: ${result ? 'PASSED' : 'FAILED (Crash/False-negative vulnerability)'}`);
        expect(result).toBe(false); // Confirms it returns false (i.e. fails to recognize the schema context)
    });
});

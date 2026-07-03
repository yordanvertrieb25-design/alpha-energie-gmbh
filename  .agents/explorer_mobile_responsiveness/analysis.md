# Mobile Responsiveness Investigation Report

## Executive Summary
This report analyzes the grid layout systems in the Alpha Energie GmbH codebase. It details where to add the new `.grid-split` and `.grid-contact` classes within `style.css` and identifies the specific inline styles in 9 HTML files to be replaced to enable mobile stacking and prevent cramped layouts ("zu eng" display) on smaller screen sizes.

---

## 1. CSS Structure Updates (`style.css`)
To replace inline grid styles systematically and make them responsive, we propose adding the new class definitions in two key locations in `style.css`:

### 1.1 Base Layout (Grid Systems Section)
**Insertion Location:** After `.grid-4` class (around line 121).
**Proposed Code:**
```css
/* Custom Responsive Grid Systems */
.grid-split {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    gap: 4rem;
}

.grid-contact {
    display: grid;
    grid-template-columns: 1.2fr 0.8fr;
    gap: 4rem;
    align-items: start;
}

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}
```

### 1.2 Mobile Overrides (Media Query Section)
**Insertion Location:** Inside the `@media (max-width: 768px)` block, after the `.section-pad` style rule (around line 1053).
**Proposed Code:**
```css
    /* Mobile Grid Stacking Overrides */
    .grid-split,
    .grid-contact {
        grid-template-columns: 1fr;
        gap: 2rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }
```

---

## 2. HTML Files Analysis & Proposals

### 1. `gewerbekunden.html`
- **File Path:** `gewerbekunden.html`
- **Approximate Line:** 115
- **Exact Target Content:**
```html
            <div class="container grid-3" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
            <div class="container grid-split">
```

### 2. `energie-audits.html`
- **File Path:** `energie-audits.html`
- **Approximate Line:** 81
- **Exact Target Content:**
```html
                <div class="grid-3" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
                <div class="grid-split">
```

### 3. `karriere.html`
- **File Path:** `karriere.html`
- **Approximate Line:** 101
- **Exact Target Content:**
```html
                <div class="grid-3 mt-4" style="margin-top: 4rem; grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
                <div class="grid-split mt-4">
```

### 4. `nachhaltigkeit-co2.html`
- **File Path:** `nachhaltigkeit-co2.html`
- **Approximate Line:** 81
- **Exact Target Content:**
```html
                <div class="grid-3" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
                <div class="grid-split">
```

### 5. `photovoltaik.html`
- **File Path:** `photovoltaik.html`
- **Approximate Line:** 81
- **Exact Target Content:**
```html
                <div class="grid-3" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
                <div class="grid-split">
```

### 6. `produktgeber.html`
- **File Path:** `produktgeber.html`
- **Approximate Line:** 100
- **Exact Target Content:**
```html
                <div class="grid-3" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
                <div class="grid-split">
```

### 7. `ueber-uns.html`
- **File Path:** `ueber-uns.html`
- **Approximate Line:** 78
- **Exact Target Content:**
```html
                <div class="grid-3" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
                <div class="grid-split">
```

### 8. `vertriebspartner.html`
- **File Path:** `vertriebspartner.html`
- **Approximate Line:** 241
- **Exact Target Content:**
```html
                <div class="grid-3" style="grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;">
```
- **Proposed Replacement:**
```html
                <div class="grid-split">
```

### 9. `kontakt.html`
#### Main Grid Container:
- **File Path:** `kontakt.html`
- **Approximate Line:** 78
- **Exact Target Content:**
```html
                <div class="grid-3" style="grid-template-columns: 1.2fr 0.8fr; gap: 4rem; align-items: start;">
```
- **Proposed Replacement:**
```html
                <div class="grid-contact">
```

#### Form Fields Row (Mobile Stacking):
- **File Path:** `kontakt.html`
- **Approximate Line:** 86
- **Exact Target Content:**
```html
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;">
```
- **Proposed Replacement:**
```html
                            <div class="form-grid">
```

---

## 3. Evidence Chain & Traceability
- **Base Grid Styling:** Located inside `style.css` in the segment labelled `/* Grid Systems */` (lines 104-122).
- **Responsive Media Query:** Located inside `style.css` under the `@media (max-width: 768px)` query block (starting at line 1004).
- **Inline Style Overrides:** Identified by inspection using `view_file` on each file at the exact requested line numbers. All 8 B2B pages had identical `grid-template-columns: 1fr 1fr; align-items: center; gap: 4rem;` overrides on elements with the `grid-3` class, causing broken layouts on mobile screens due to lack of wrap/stacking.

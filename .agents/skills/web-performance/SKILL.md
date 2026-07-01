---
name: Web Performance
description: Triggers when optimizing a website or handling assets to ensure fast load times and smooth rendering.
---

# Web Performance Instructions
- **Assets**: Minify CSS and JS files for production.
- **Images**: Compress images heavily without losing visible quality. Use modern formats like WebP. Implement `loading="lazy"` on off-screen images.
- **Blocking Resources**: Put `<script>` tags at the end of the `<body>` or use `defer` / `async` attributes in the `<head>`.
- **Layout Shifts**: Always define `width` and `height` attributes on images and videos to prevent Cumulative Layout Shift (CLS).
- **Caching**: Ensure assets are set up for proper browser caching when possible.

# System Patterns

## Architecture
- **Frontend-Only**: Static site built with HTML, CSS, and Vanilla JS.
- Python scripts are used locally for image processing (e.g., background removal, smoothing) but are not part of the production web server.

## Design Patterns & UI/UX
- **Glassmorphism**: Used extensively in headers and dropdowns (e.g., `--glass-bg`, `--glass-blur`).
- **Brand Colors**: Primary color is a vibrant orange (`--primary-color: #ef8a00`). Text is dark (`#1f2937`) with a light background (`#ffffff` and `#f8f9fa`).
- **Typography**: Uses 'Outfit' font from Google Fonts.
- **Animations**: Heavy use of CSS animations, including a massive background morph animation (`morphAlpha` and `morphEuro`) in the hero section, fade-ups, and hover effects on cards and buttons.
- **Responsive Grid**: Uses CSS grid (`grid-3`, `grid-4`) and flexbox for layout, with media queries for mobile responsiveness.

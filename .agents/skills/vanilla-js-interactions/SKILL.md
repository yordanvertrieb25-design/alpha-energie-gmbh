---
name: Vanilla JS Interactions
description: Triggers when adding interactive logic to web pages without using frameworks like React or Vue.
---

# Vanilla JS Interactions Instructions
- **DOM Access**: Prefer `document.querySelector` and `document.getElementById` for element selection. Keep references cached if used multiple times.
- **Event Listeners**: Attach event listeners cleanly. Use event delegation for dynamically created elements.
- **State Management**: Keep UI state in sync with DOM updates using clean functions. Avoid massive spaghetti code blocks.
- **Animations**: Use CSS transitions and animations triggered by JavaScript class toggles (`classList.add/remove/toggle`) rather than animating styles directly with JS.
- **Performance**: Use `requestAnimationFrame` for continuous animations or scroll events. Use debouncing for rapid events like resizing or input typing.

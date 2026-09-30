# Alpha Energie GmbH - Three.js WebGL Engine Developer Guide

Welcome to the official developer guide for the **Alpha Energie 3D WebGL Engine**. This production-grade architecture powers high-performance, interactive 3D visualizations across Alpha Energie's digital platforms, representing Germany's decentralized renewable energy network (Photovoltaik, Windkraft, Smart Storage & B2B Partner Hubs).

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Quick Start (Declarative HTML)](#2-quick-start-declarative-html)
3. [Available Built-in Scenes](#3-available-built-in-scenes)
   - [Scene A: Energy Network (`energy-network`)](#scene-a-energy-network-energy-network)
   - [Scene B: Energy Globe (`energy-globe`)](#scene-b-energy-globe-energy-globe)
4. [Live Interactive Showcase](#4-live-interactive-showcase)
5. [Configuration & Options Matrix](#5-configuration--options-matrix)
6. [Programmatic JavaScript API (`window.AlphaThree`)](#6-programmatic-javascript-api-windowalphathree)
7. [Performance & WebGL Best Practices](#7-performance--webgl-best-practices)
8. [Offline & Online Asset Distribution](#8-offline--online-asset-distribution)
9. [How to Create a New Scene](#9-how-to-create-a-new-scene)
10. [Automated Testing & Verification](#10-automated-testing--verification)
11. [Troubleshooting & FAQ](#11-troubleshooting--faq)

---

## 1. Architecture Overview

The Alpha Energie 3D engine is designed around modularity, zero performance waste, and rock-solid reliability:

```
public/js/three/
├── vendor/
│   ├── three.min.js          # Standalone UMD Three.js bundle (669 KB, offline & online)
│   ├── three.module.js       # Modern ES module Three.js
│   └── three.core.js         # Core Three.js dependencies
├── three-manager.js          # WebGLDetector, ThreeSceneBase, SceneController, ThreeManager
├── three-loader.js           # Public API orchestrator & auto-bootstrapper (window.AlphaThree)
├── index.js                  # ESM entry point for bundlers (export { AlphaThree, ... })
└── scenes/
    ├── energy-network.js     # 3D Smart Grid with traveling energy photons
    └── energy-globe.js       # 3D Wireframe Eco-Globe with regional renewable hubs
```

### Key Architectural Highlights:
- **Zero-Config Auto-Discovery**: Containers with `[data-three-scene]` initialize automatically on `DOMContentLoaded`.
- **IntersectionObserver Throttling**: Rendering loops automatically pause (`cancelAnimationFrame`) when scrolled out of view, reducing GPU/CPU consumption to **0%**.
- **Hardware Clamping**: `renderer.setPixelRatio` is clamped to `Math.min(window.devicePixelRatio, 2)` to eliminate thermal throttling and battery drain on high-DPI smartphones.
- **Graceful Degradation**: Automatic WebGL 1/2 capability detection with a styled, accessible CSS/SVG fallback card if WebGL is unavailable.
- **Accessible Motion**: Automatically honors the operating system's `prefers-reduced-motion` settings.

---

## 2. Quick Start (Declarative HTML)

To add a 3D visualization to any page, simply include the scripts and declare a container:

```html
<!-- 1. Include Three.js Scripts -->
<script src="/public/js/three/vendor/three.min.js"></script>
<script src="/public/js/three/three-manager.js"></script>
<script src="/public/js/three/scenes/energy-network.js"></script>
<script src="/public/js/three/three-loader.js" defer></script>

<!-- 2. Add 3D Scene Container -->
<div data-three-scene="energy-network"
     data-three-mode="solar"
     data-three-speed="1.0"
     data-three-interactive="true"
     style="width: 100%; height: 500px; position: relative;">
</div>
```

---

## 3. Available Built-in Scenes

### Scene A: Energy Network (`energy-network`)
A high-tech representation of the German smart energy grid.

- **Visual Features**:
  - Central pulsating luminous nexus (Alpha Energie Core).
  - Organically distributed solar, wind, storage, and consumer nodes.
  - Glowing procedural particle halos (zero external image dependencies).
  - Interconnecting power transmission lines with breathing opacity.
  - Active energy packets (photons) traveling in real time between nodes.
  - Ambient energy dust field providing deep 3D spatial parallax.
  - Shockwave burst rings triggered by user clicks or API calls.
- **Operational Modes**:
  - `balanced`: Default harmonic balance across all energy forms.
  - `solar`: Highlights solar hubs in neon green (`#00E676`) with boosted photon activity.
  - `wind`: Highlights wind parks in electric cyan (`#00D2FF`).
  - `grid`: Boosts battery storage nodes (`#10B981`) and transmission line density.

### Scene B: Energy Globe (`energy-globe`)
A 3D wireframe eco-grid globe representing decentralized energy networks.

- **Visual Features**:
  - Geodesic wireframe sphere with deep midnight occluder.
  - Glowing latitude/longitude meridian lines.
  - Renewable energy beacon hubs (Frankfurt, Berlin, North Sea Wind, Munich Storage, etc.).
  - Vertical glowing light pillars pointing outward from key hubs.
  - Orbital rings with orbiting energy photon sprites.
  - Natural drag-to-rotate interaction with physics momentum and inertia damping.

---

## 4. Live Interactive Showcase

A complete showcase and testing page is provided at `three-demo.html`:

- Visit: `http://localhost:3000/three-demo.html`
- Includes:
  - Hero interactive 3D Energy Network with live HUD controls.
  - Side-by-side cards with `energy-network` and `energy-globe`.
  - Mode switching buttons, speed sliders, and pulse shockwaves.
  - Real-time memory disposal and re-initialization stress testing.

---

## 5. Configuration & Options Matrix

Scenes can be configured via HTML data attributes or via the JavaScript API:

| HTML Attribute | JS Option Key | Type | Default | Description |
|---|---|---|---|---|
| `data-three-scene` | `sceneName` | String | *(Required)* | Registered scene name (`'energy-network'` or `'energy-globe'`) |
| `data-three-mode` | `mode` | String | `'balanced'` | Operational mode (`'solar'`, `'wind'`, `'grid'`, `'balanced'`) |
| `data-three-speed` | `speed` | Float | `1.0` | Animation velocity multiplier (e.g. `0.5` for slow, `2.0` for fast) |
| `data-three-interactive` | `interactive` | Boolean | `true` | Enables pointer parallax, mouse click bursts, and drag |
| `data-three-pixel-ratio` | `maxPixelRatio` | Number | `2` | Upper clamp for `window.devicePixelRatio` |
| `data-three-camera-z` | `cameraZ` | Number | `25` | Distance of perspective camera along Z axis |
| `data-three-fov` | `fov` | Number | `50` | Camera field of view in degrees |
| `data-three-particles` | `particleMultiplier`| Float | `1.0` | Density multiplier for nodes and ambient particles |
| `data-three-reduced-motion`| `reducedMotionBehavior`| String | `'drift'` | Behavior on reduced-motion preference (`'drift'` or `'static'`) |

---

## 6. Programmatic JavaScript API (`window.AlphaThree`)

The engine exposes the global `window.AlphaThree` controller:

### Initializing a Scene
```javascript
// Mount energy-network into a container
const controller = await window.AlphaThree.init('#hero-container', 'energy-network', {
    mode: 'solar',
    speed: 1.2,
    interactive: true
});
```

### Controlling an Active Scene
```javascript
const scene = window.AlphaThree.getScene('#hero-container');

if (scene) {
    // Switch network focus mode
    scene.setMode('wind');

    // Trigger energy burst shockwave
    scene.pulseBurst();

    // Adjust playback speed
    scene.setSpeed(1.5);
}
```

### Lifecycle Management & GPU Teardown
```javascript
// Destroy a specific scene and free WebGL resources
window.AlphaThree.destroy('#hero-container');

// Pause all rendering loops (e.g. when opening a modal)
window.AlphaThree.pauseAll();

// Resume all loops
window.AlphaThree.resumeAll();

// Destroy all active scenes
window.AlphaThree.destroyAll();
```

### Custom Events
The engine dispatches events on `window`:
- `'alphathree:ready'`: Fired when `autoInit` completes initial discovery.
- `'alphathree:scene-created'`: Fired whenever a scene controller is mounted.
- `'alphathree:scene-destroyed'`: Fired when a scene controller is disposed.

---

## 7. Performance & WebGL Best Practices

### 1. Zero Offscreen GPU Usage (IntersectionObserver)
Every scene controller registers an `IntersectionObserver`. When a canvas is scrolled off-screen:
```
In Viewport   ──> RAF Loop Running (~60 FPS)
Scrolled Away ──> cancelAnimationFrame(rafId) (0% GPU / 0% CPU)
Scrolled Back ──> clock.getDelta() reset + RAF Loop Resumed
```

### 2. DPR Clamping
High-end mobile phones often report a `devicePixelRatio` of 3.0 or 4.0. Rendering a full-screen canvas at 4x resolution pushes 16x more fragments than 1x, causing mobile GPUs to overheat. Alpha Energie clamps this value to **2.0**, preserving crisp retina text while maintaining battery life.

### 3. Procedural Glowing Textures
Instead of loading external `.png` particle textures (which introduce network latency and HTTP 404 risks), the engine uses `createGlowTexture()`:
- Renders radial gradient particle sprites dynamically on an in-memory 2D canvas.
- Transferred to `THREE.CanvasTexture` with zero network overhead.

---

## 8. Offline & Online Asset Distribution

The engine supports dual online/offline distribution:
1. **Local Vendor Assets (Default)**:
   - `public/js/three/vendor/three.min.js`
   - Express serves static assets from `/public` at root, meaning both `/js/three/...` and `/public/js/three/...` resolve immediately.
2. **CDN Automatic Fallback**:
   - If `window.THREE` is not present and the local vendor path is missing, `three-loader.js` automatically requests `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`.

---

## 9. How to Create a New Scene

To add a new scene (e.g., `scenes/solar-panel-3d.js`):

```javascript
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../three-manager'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('../three-manager'));
    } else {
        const SceneClass = factory(root.AlphaThreeManager || {});
        if (root.AlphaThree && root.AlphaThree.registerScene) {
            root.AlphaThree.registerScene('solar-panel-3d', SceneClass);
        }
        root.AlphaSolarPanelScene = SceneClass;
    }
}(typeof self !== 'undefined' ? self : this, function (AlphaThreeManager) {
    'use strict';

    const BaseClass = AlphaThreeManager.ThreeSceneBase || class {};

    class SolarPanelScene extends BaseClass {
        constructor(container, options = {}) {
            super(container, options);
            this.speed = this.options.speed || 1.0;
        }

        init(THREE, scene, camera, renderer) {
            super.init(THREE, scene, camera, renderer);

            // Create your 3D geometry
            const geo = new THREE.PlaneGeometry(6, 4);
            const mat = new THREE.MeshBasicMaterial({
                color: 0x00E676,
                wireframe: true
            });
            this.panel = new THREE.Mesh(geo, mat);
            this.scene.add(this.panel);

            this.camera.position.set(0, 0, 10);
        }

        update(delta, elapsed, pointer) {
            if (this.disposed || !this.panel) return;
            this.panel.rotation.y = pointer.x * 0.5;
            this.panel.rotation.x = -pointer.y * 0.3;
        }

        dispose() {
            // Cleanup custom resources here
            super.dispose();
        }
    }

    return SolarPanelScene;
}));
```

---

## 10. Automated Testing & Verification

The test suite runs with Playwright in headless Chromium:

```bash
# Run Three.js test suite
npx.cmd playwright test tests/threejs_architecture.spec.js
```

### Test Coverage:
1. **Scene Initialization**: Verifies `window.THREE` and `window.AlphaThree` load without runtime exceptions or WebGL errors.
2. **Interactive Controls**: Tests mode switching (`'solar'`), pulse bursts, and speed controls.
3. **Resource Disposal**: Tests `window.AlphaThree.destroy()`, ensuring canvases and WebGL contexts are removed from DOM cleanly.
4. **Pause/Resume Control**: Tests global loop halting and reactivation.

---

## 11. Troubleshooting & FAQ

**Q: My canvas is blank or black.**
- Ensure the container element has an explicit CSS `height` (e.g. `height: 500px` or `min-height: 400px`). A container with `height: 0` will produce a 0-pixel canvas.

**Q: Does it work if the user disables hardware acceleration?**
- Yes. If WebGL is unavailable, `WebGLDetector.isSupported()` returns `false`, and the engine renders an Alpha Energie SVG/CSS eco-grid fallback card with an informative explanation.

**Q: Can I use ES modules with Vite / Webpack / Next.js?**
- Yes! Import directly from `public/js/three/index.js`:
  ```javascript
  import { AlphaThree, EnergyNetworkScene } from '/public/js/three/index.js';
  ```

---

*Alpha Energie GmbH © 2026. All rights reserved.*

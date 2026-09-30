---
name: Three.js 3D Visualizations & WebGL Architecture
description: Triggers when creating, extending, integrating, or debugging 3D WebGL scenes, interactive canvas components, and Three.js animations for Alpha Energie GmbH.
---

# Alpha Energie GmbH - Three.js WebGL Architecture Standard

This skill defines the permanent standard for 3D graphics, particle systems, and WebGL visualizations within the Alpha Energie web ecosystem. All future AI agents and engineers must adhere to these patterns.

---

## 1. Brand Aesthetics & Color Tokens

Alpha Energie visualizes clean, decentralized energy transformation across Germany. All 3D scenes must utilize the official color tokens:

| Token | Hex Code | Purpose & Symbolism |
|---|---|---|
| `greenNeon` | `#00E676` | Solar generation, clean eco photons, primary glowing nexus |
| `blueCyan` | `#00D2FF` | Wind power parks, transmission flow lines, electrical vectors |
| `greenEmerald` | `#10B981` | Smart storage batteries, efficiency metrics, grid resilience |
| `blueElectric` | `#0284C7` | B2B network nodes, corporate partners, infrastructure |
| `slateMidnight` | `#0B132B` | 3D space background, deep depth occluder |
| `slateDark` | `#0F172A` | Card containers and canvas viewports |
| `orangeAccent` | `#FF7A00` | Alpha Energie brand accent for highlighted CTAs |

---

## 2. Core Architecture & Directory Layout

All Three.js assets and code live under `public/js/three/`:

```
public/js/three/
├── vendor/
│   ├── three.min.js      # Production UMD bundle (Global window.THREE fallback)
│   ├── three.module.js   # Official ES module bundle
│   └── three.core.js     # Three.js core bundle
├── three-manager.js      # Engine: WebGLDetector, ThreeSceneBase, SceneController, ThreeManager
├── three-loader.js       # Auto-bootstrapper & Universal Public API (window.AlphaThree)
├── index.js              # ES Module entrypoint for bundlers (export { AlphaThree, ... })
└── scenes/
    ├── energy-network.js # Smart Grid: solar/wind nodes, moving photons, central nexus
    ├── energy-globe.js   # Eco-Globe: 3D wireframe sphere, beacons, orbital rings, drag inertia
    └── versorger-flow.js # 3D Smart Home & Cost Savings Simulator (Solar PV, Heat Pump §14a, Wallbox, EV, Real Savings)
```

---

## 3. The 5 Golden Rules of Alpha Energie WebGL Performance

Every 3D scene **MUST** abide by these 5 rules:

1. **IntersectionObserver Pause (0% GPU Waste)**:
   - When a canvas scrolls out of viewport, its animation loop must immediately pause (`cancelAnimationFrame`).
   - When it re-enters, resume rendering and reset the internal clock so `delta` does not spike.
   - Built into `three-manager.js` by default.

2. **Strict Pixel Ratio Clamping**:
   - Never set `renderer.setPixelRatio(window.devicePixelRatio)` uncapped.
   - Always clamp: `Math.min(window.devicePixelRatio || 1, 2)`.
   - Prevents high-density 3x/4x mobile screens from overheating and throttling.

3. **Delta-Time Driven Physics & Animations**:
   - Never increment rotations with arbitrary constants (e.g., `mesh.rotation.y += 0.01`).
   - Always multiply by delta: `mesh.rotation.y += delta * speed * 0.5`.
   - Delta must be clamped (`Math.min(delta, 0.1)`) to avoid physics tearing after browser tab switches.

4. **Deep Resource Cleanup & Disposal (`dispose()`)**:
   - When tearing down a scene or transitioning pages, recursively traverse all meshes and dispose `BufferGeometry`, `Material`, and `Texture`.
   - Call `renderer.dispose()`, `renderer.forceContextLoss()`, and disconnect observers to prevent memory leaks in Single-Page Applications and dynamic portals.

5. **Accessibility & Reduced Motion (`prefers-reduced-motion`)**:
   - Check `window.matchMedia('(prefers-reduced-motion: reduce)')`.
   - If active, default to `'drift'` (gentle slow ambient movement) or `'static'` (fixed frame).

---

## 4. Declarative HTML Integration

Add any 3D scene to an HTML page with zero JavaScript boilerplate:

```html
<!-- Include Three.js dependencies (or simply three-loader.js) -->
<script src="/public/js/three/vendor/three.min.js"></script>
<script src="/public/js/three/three-manager.js"></script>
<script src="/public/js/three/scenes/energy-network.js"></script>
<script src="/public/js/three/three-loader.js" defer></script>

<!-- Scene 1: Smart Energy Grid Hero -->
<div data-three-scene="energy-network"
     data-three-mode="solar"
     data-three-speed="1.0"
     data-three-interactive="true"
     style="width: 100%; height: 500px;">
</div>

<!-- Scene 2: 3D Eco-Globe -->
<div data-three-scene="energy-globe"
     data-three-speed="1.2"
     style="width: 100%; height: 400px;">
</div>

<!-- Scene 3: 3D Smart Home & Spar-Simulator (Architectural Home, Solar PV, Heat Pump §14a, Wallbox, EV) -->
<div data-three-scene="versorger-flow"
     data-three-mode="strom"
     data-three-consumption="3500"
     data-three-speed="1.0"
     style="width: 100%; height: 450px;">
</div>
```

### Supported Data Attributes:
- `data-three-scene`: Name of the registered scene (`"energy-network"`, `"energy-globe"`, `"versorger-flow"`).
- `data-three-mode`: Initial operational mode:
  - For `energy-network`: `"solar"`, `"wind"`, `"grid"`, `"balanced"`.
  - For `versorger-flow`: `"strom"` / `"oekostrom"` (ok-power), `"waerme"` (§14a EnWG heat pump flexibility), `"gas"` (clean flame + CO2-offset ring tokens).
- `data-three-consumption`: Annual electricity consumption in kWh (e.g. `3500`; scales photon flow velocity and particle density in `versorger-flow`, recalculating annual savings vs Grundversorger).
- `data-three-speed`: Float multiplier for animation velocity (default: `1.0`).
- `data-three-interactive`: `"true"` or `"false"` (enables pointer parallax & click/drag).
- `data-three-pixel-ratio`: Custom max pixel ratio (default: `2`).
- `data-three-camera-z`: Camera distance (default: `25`).
- `data-three-particles`: Particle count multiplier (default: `1.0`).
- `data-three-reduced-motion`: `"drift"` (default) or `"static"`.

---

## 5. Programmatic JavaScript API (`window.AlphaThree`)

```javascript
// 1. Programmatically initialize a scene
const controller = await window.AlphaThree.init('#my-container', 'versorger-flow', {
    mode: 'strom',
    consumption: 4500,
    speed: 1.0,
    interactive: true
});

// 2. Access the active scene instance to trigger interactive features
const scene = window.AlphaThree.getScene('#my-container');
scene.setMode('waerme');          // Switch to 'strom', 'waerme' (§14a EnWG), or 'gas'
scene.setConsumption(6500);       // Dynamically adjust flow velocity, photon density, and emit 'alphathree:savings-update'
scene.setFocus('solar');          // Smoothly pan camera to: 'overview', 'solar', 'waerme', 'wallbox', 'strom'
scene.pulseBurst();               // Trigger radial energy shockwave with exponential decay
scene.setSpeed(1.5);              // Speed up animation

// 3. Pause & Resume rendering
window.AlphaThree.pauseAll();
window.AlphaThree.resumeAll();

// 4. Teardown / Free GPU resources
window.AlphaThree.destroy('#my-container');
```

---

## 6. How to Create and Register a New 3D Scene

When creating a new 3D scene (e.g. `scenes/photovoltaik-flow.js`):

```javascript
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../three-manager'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('../three-manager'));
    } else {
        const SceneClass = factory(root.AlphaThreeManager || {});
        if (root.AlphaThree && root.AlphaThree.registerScene) {
            root.AlphaThree.registerScene('photovoltaik-flow', SceneClass);
        }
        root.AlphaPhotovoltaikScene = SceneClass;
    }
}(typeof self !== 'undefined' ? self : this, function (AlphaThreeManager) {
    'use strict';

    const BaseClass = AlphaThreeManager.ThreeSceneBase || class {};

    class PhotovoltaikScene extends BaseClass {
        constructor(container, options = {}) {
            super(container, options);
            this.speed = this.options.speed || 1.0;
        }

        init(THREE, scene, camera, renderer) {
            super.init(THREE, scene, camera, renderer);
            
            // 1. Create your 3D geometry & materials
            const geo = new THREE.BoxGeometry(2, 2, 2);
            const mat = new THREE.MeshBasicMaterial({ color: 0x00E676, wireframe: true });
            this.cube = new THREE.Mesh(geo, mat);
            this.scene.add(this.cube);

            // 2. Camera positioning
            this.camera.position.set(0, 0, 10);
        }

        update(delta, elapsed, pointer) {
            if (this.disposed || !this.cube) return;
            // Frame update using delta
            this.cube.rotation.y += delta * this.speed;
            this.cube.rotation.x = pointer.y * 0.5;
        }

        dispose() {
            // Scene-specific cleanup before base disposal
            super.dispose();
        }
    }

    return PhotovoltaikScene;
}));
```

---

## 7. Automated Testing & Verification

All Three.js components have automated Playwright tests in `tests/threejs_architecture.spec.js`.
To verify changes:
```bash
npx.cmd playwright test tests/threejs_architecture.spec.js
```
The test suite validates:
- Autonomous canvas creation and zero console errors
- Mode switching and burst effects
- Memory teardown and recreation without leaks
- Offscreen pause and resume

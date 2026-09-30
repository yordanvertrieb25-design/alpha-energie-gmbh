/**
 * Alpha Energie GmbH - 3D Smart Home & Cost Savings Visualization ("Alpha Spar- & Energie-Simulator")
 * Premium architectural 3D smart home diorama for German energy utility customers:
 * - High-End Modern Eco-Villa & Landscaping:
 *   * Multi-tiered ground island with beveled architectural charcoal curb.
 *   * Rich, natural green lawn with procedural striped mowing texture.
 *   * Cobblestone driveway for the car with paver textures, and warm timber deck terrace under a modern pergola.
 *   * Rich 3D garden elements: sculpted evergreen boxwood spherical shrubs, 2 modern architectural trees with leafy layered canopies, modern garden bollard lights with warm ground light pools, and ambient occlusion ground contact shadow.
 *   * Modern Luxury Residential Villa:
 *     - Ground floor: Floor-to-ceiling glass curtain walls with warm interior illumination, wooden flooring, and interior ambient glow.
 *     - Cantilevered upper floor: Crisp white architectural stucco finish with warm cedar vertical wood slats (#b45309 / #d97706).
 *     - Glass balcony with stainless steel and tinted glass railing.
 *     - Architectural dark zinc/slate roof with ridge capping, rain gutters, and downpipe.
 *     - 8-panel Monocrystalline Solar Array with aluminum mounting rails, busbar texture, and clearcoat gloss.
 *     - Monobloc Heat Pump with horizontal louvers, copper lines, and an actively spinning 3-blade aerodynamic fan.
 *     - Wallbox EV charger with green glowing status LED halo, coiled charging cable plugged into a sleek metallic electric sports sedan.
 *     - Digital Smart Meter Gateway with pulsing LED telemetry beacon and home storage battery (Speicher).
 * - Scroll-Driven Scrollytelling & Camera Stage Engine:
 *   * Exposes .setScrollProgress(progress) (0.0 to 1.0) and .setStage(stageName)
 *   * Stage 0 (0.00 - 0.15): 'overview' (Cinematic overview of house & garden)
 *   * Stage 1 (0.15 - 0.35): 'strom' (Hausstrom & Digital Smart Meter, single banner: "Wir bieten 100 % Ökostromtarife für Ihren Hausstrom an")
 *   * Stage 2 (0.35 - 0.55): 'waerme' (Heat Pump with spinning fan, single banner: "Wir bieten günstige Stromtarife für Wärmepumpen an")
 *   * Stage 3 (0.55 - 0.75): 'wallbox' (Wallbox & EV charging, single banner: "Wir bieten spezielle Stromtarife für Wallboxen an")
 *   * Stage 4 (0.75 - 0.92): 'solar' (Rooftop Solar PV panels, single banner: "Wir bieten flexible Stromtarife für Solaranlagen & Speicher an")
 *   * Stage 5 (0.92 - 1.00): 'overview' (Smoothly pulls back to overview, allowing seamless scroll exit)
 * - Strict Single-Banner Display:
 *   * When a stage is active, ONLY THE SINGLE CORRESPONDING BANNER IS VISIBLE!
 *   * When stage === 'overview': All 4 banners are in compact pulsing pin dot mode with zero overlapping cards.
 *
 * @license Proprietary - Alpha Energie GmbH 2026
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        const SceneClass = factory();
        root.AlphaVersorgerFlowScene = SceneClass;
        if (root.AlphaThreeManager && typeof root.AlphaThreeManager.registerScene === 'function') {
            root.AlphaThreeManager.registerScene('versorger-flow', SceneClass);
        }
        if (root.AlphaThree && typeof root.AlphaThree.registerScene === 'function') {
            root.AlphaThree.registerScene('versorger-flow', SceneClass);
        }
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const BaseClass = (typeof window !== 'undefined' && window.AlphaThreeSceneBase)
        ? window.AlphaThreeSceneBase
        : class FallbackSceneBase {
            constructor(options = {}) {
                this.options = options;
                this.container = options.container || null;
                this.THREE = null;
                this.scene = null;
                this.camera = null;
                this.renderer = null;
                this.disposed = false;
                this.animFrameId = null;
            }
            init(THREE, scene, camera, renderer) {
                this.THREE = THREE;
                this.scene = scene;
                this.camera = camera;
                this.renderer = renderer;
                this.disposed = false;
            }
            update(delta, elapsed, pointer) {}
            onResize(width, height) {}
            dispose() {
                this.disposed = true;
            }
        };

    class VersorgerFlowScene extends BaseClass {
        constructor(container, options = {}) {
            if (container && !(typeof HTMLElement !== 'undefined' && container instanceof HTMLElement) && typeof container === 'object' && !container.nodeType) {
                options = container;
                container = options.container || null;
            }
            super(container, options);
            this.container = container || null;

            this.rawMode = (this.options && this.options.mode) || (this.container && this.container.getAttribute('data-three-mode')) || 'strom';
            this.consumption = parseInt((this.options && this.options.consumption) || (this.container && this.container.getAttribute('data-three-consumption')) || 2500, 10);
            this.speed = parseFloat((this.options && this.options.speed) || (this.container && this.container.getAttribute('data-three-speed')) || 1.0);

            // Energy Theme Modes
            this.modes = {
                strom: {
                    name: 'strom',
                    label: '100% Ökostrom (ok-power)',
                    primary: 0x00E676,       // Alpha Emerald Green
                    secondary: 0x00D2FF,     // Electric Cyan
                    accent: 0xFFD700,        // Solar Gold
                    core: 0x00E676,
                    light: 0x00E676,
                    lightIntensity: 2.2,
                    thermalGlow: false,
                    gasTokens: false,
                    haloInner: 'rgba(235, 255, 245, 1)',
                    haloOuter: 'rgba(0, 230, 118, 0)'
                },
                waerme: {
                    name: 'waerme',
                    label: 'Wärmestrom (§14a EnWG Flexibel)',
                    primary: 0xFF7A00,       // Warm Amber
                    secondary: 0x10B981,     // Emerald Efficiency
                    accent: 0xF59E0B,        // Golden Amber
                    core: 0xFF7A00,
                    light: 0xFF7A00,
                    lightIntensity: 2.5,
                    thermalGlow: true,
                    gasTokens: false,
                    haloInner: 'rgba(255, 235, 200, 1)',
                    haloOuter: 'rgba(255, 122, 0, 0)'
                },
                gas: {
                    name: 'gas',
                    label: 'Ökogas (100% CO2-Kompensiert)',
                    primary: 0x00B0FF,       // Azure Gas Flame Blue
                    secondary: 0xF59E0B,     // Biogas Warm Gold
                    accent: 0x00E676,        // Certified Eco Green
                    core: 0x00B0FF,
                    light: 0x00B0FF,
                    lightIntensity: 2.2,
                    thermalGlow: false,
                    gasTokens: true,
                    haloInner: 'rgba(220, 245, 255, 1)',
                    haloOuter: 'rgba(0, 176, 255, 0)'
                }
            };

            this.currentMode = this.normalizeMode(this.rawMode);
            this.currentConfig = this.modes[this.currentMode];

            // Consumption Scaling & Real-World Savings
            this.consumptionSpeedMultiplier = 1.0;
            this.savingsData = null;

            // Interactive Physics & Camera Hotspots
            this.burstTime = 0;
            this.burstVelocityBoost = 1.0;
            this.burstRings = [];
            this.co2Tokens = [];

            // Pointer & Camera Tracking
            this.targetRotationY = 0;
            this.targetRotationX = 0;
            this.currentRotationY = 0;
            this.currentRotationX = 0;
            this.isDragging = false;
            this.previousMousePosition = { x: 0, y: 0 };

            // Camera Stages & Coordinates
            this.focusPresets = {
                overview: {
                    position: { x: 14.0, y: 10.0, z: 16.0 },
                    lookAt: { x: 0.0, y: 1.8, z: 0.0 }
                },
                strom: {
                    position: { x: 5.8, y: 3.2, z: 7.2 },
                    lookAt: { x: 2.2, y: 1.3, z: 2.2 }
                },
                waerme: {
                    position: { x: 7.4, y: 2.2, z: 4.2 },
                    lookAt: { x: 4.8, y: 0.85, z: 1.2 }
                },
                wallbox: {
                    position: { x: -7.5, y: 3.2, z: 6.8 },
                    lookAt: { x: -4.5, y: 1.4, z: 1.8 }
                },
                solar: {
                    position: { x: 1.6, y: 7.2, z: 8.6 },
                    lookAt: { x: -0.2, y: 4.2, z: 0.8 }
                }
            };

            this.currentFocus = 'overview';
            this.currentStage = 'overview';
            this.scrollProgress = 0.0;
            this.targetCameraPos = null;
            this.currentCameraPos = null;
            this.targetLookAt = null;
            this.currentLookAt = null;

            // 3D Scene Groups & Dynamic Meshes
            this.rootGroup = null;
            this.houseGroup = null;
            this.solarArrayGroup = null;
            this.solarWaferMat = null;
            this.heatPumpGroup = null;
            this.heatPumpFan = null;
            this.heatPumpLedMat = null;
            this.wallboxGroup = null;
            this.wallboxStatusMat = null;
            this.wallboxStatusRing = null;
            this.evGroup = null;
            this.evStatusRing = null;
            this.evPortMat = null;
            this.smartMeterLed = null;
            this.meterLedMat = null;
            this.batteryGroup = null;
            this.batteryLeds = [];
            this.environmentGroup = null;
            this.flowTracksGroup = null;
            this.photonsMesh = null;
            this.windowMeshes = [];
            this.windowGlassMat = null;
            this.windowLight = null;
            this.sunLight = null;
            this.hemiLight = null;
            this.accentLight = null;
            this.bollardLights = [];

            // Flow trajectories (Splines) & Traveling Photons
            this.curves = [];
            this.curveMeshes = [];
            this.photons = [];
            this.photonCount = 140;

            // Procedural Canvas Textures cache
            this.glowTextures = {};
            this.proceduralTextures = {};

            // 3D Callout Anchors & Floating Banners
            this.anchorDefinitions = [];
            this.anchorElements = new Map();
            this.anchorsLayer = null;
            this.activeAnchorId = null;
            this._tempAnchorWorldVec = null;
            this._lastAnchorsBroadcastTime = 0;

            // Bound event handlers
            this._boundOnScroll = null;
            this._boundOnWheel = null;

            // Initial calculation
            this.updateConsumptionScaling();
        }

        normalizeMode(raw) {
            let m = (raw || 'strom').toLowerCase().trim();
            if (m === 'oekostrom' || m === 'green' || m === 'solar' || m === 'wind' || m === 'stromnetz' || m === 'electricity') {
                return 'strom';
            }
            if (m === 'waermestrom' || m === 'heat' || m === 'waermepumpe' || m === 'heatpump' || m === 'speicher') {
                return 'waerme';
            }
            if (m === 'oekogas' || m === 'biogas' || m === 'gasnetz' || m === 'naturalgas') {
                return 'gas';
            }
            return this.modes[m] ? m : 'strom';
        }

        init(THREE, scene, camera, renderer) {
            super.init(THREE, scene, camera, renderer);

            if (this.renderer) {
                this.renderer.shadowMap.enabled = true;
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
                this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
                this.renderer.toneMappingExposure = 1.12;
            }

            this.rootGroup = new THREE.Group();
            this.scene.add(this.rootGroup);

            // Initialize Camera vectors
            const initialPreset = this.focusPresets[this.currentFocus];
            this.targetCameraPos = new THREE.Vector3(initialPreset.position.x, initialPreset.position.y, initialPreset.position.z);
            this.currentCameraPos = this.targetCameraPos.clone();
            this.targetLookAt = new THREE.Vector3(initialPreset.lookAt.x, initialPreset.lookAt.y, initialPreset.lookAt.z);
            this.currentLookAt = this.targetLookAt.clone();

            this.camera.position.copy(this.currentCameraPos);
            this.camera.lookAt(this.currentLookAt);

            // 1. Lighting setup: Directional sunlight with soft shadows, hemisphere & warm ambient
            this.setupLighting();

            // 2. High-End Landscaping: Paved cobblestone driveway, striped lawn, timber deck, pergola, architectural trees & shrubs
            this.buildEnvironment();

            // 3. Modern Luxury Eco-Villa: Stucco facade, cedar wood slats, curtain walls, glass balcony, pitched slate roof, gutters
            this.buildSmartHome();

            // 4. Rooftop Monocrystalline Photovoltaik Solar Array (8 Panels)
            this.buildSolarArray();

            // 5. Monobloc Outdoor Heat Pump Unit (Wärmepumpe) with actively spinning fan
            this.buildHeatPump();

            // 6. Wallbox EV Charger & Electric Sports Sedan
            this.buildWallboxAndEV();

            // 7. Digital Smart Meter Gateway & Battery Storage (Speicher)
            this.buildSmartMeterAndBattery();

            // 8. Dynamic Energy Trajectories & Luminous Photons
            this.buildFlowTrajectories();
            this.buildTravelingPhotons();

            // 9. Interactive Shockwave Burst Rings & CO2 Tokens
            this.buildBurstRings();
            this.buildCO2Tokens();

            // 10. 3D-to-2D Anchor Tracking & Strictly Single-Visible Floating Banners
            this.initAnchors();
            this.createAnchorBannersDOM();

            // 11. Scroll-Driven Scrollytelling Engine Setup
            this.setupScrollTracker();

            // Initial mode styling
            this.applyModeStyles();

            // Initial cost savings event broadcast
            this.setConsumption(this.consumption, this.currentMode);

            // Pointer drag & hover interaction
            this.setupLocalPointerEvents();
        }

        setupLighting() {
            const THREE = this.THREE;

            // 1. Directional Sun Light with Calibrated Soft Shadows
            this.sunLight = new THREE.DirectionalLight(0xFFFDF5, 1.95);
            this.sunLight.position.set(16, 24, 15);
            this.sunLight.castShadow = true;
            this.sunLight.shadow.mapSize.width = 2048;
            this.sunLight.shadow.mapSize.height = 2048;
            this.sunLight.shadow.camera.near = 0.5;
            this.sunLight.shadow.camera.far = 60;
            this.sunLight.shadow.camera.left = -16;
            this.sunLight.shadow.camera.right = 16;
            this.sunLight.shadow.camera.top = 16;
            this.sunLight.shadow.camera.bottom = -16;
            this.sunLight.shadow.bias = -0.0004;
            this.sunLight.shadow.radius = 2.4;
            this.scene.add(this.sunLight);

            // 2. Sky & Ground Hemisphere Light
            this.hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0x1E293B, 1.1);
            this.hemiLight.position.set(0, 32, 0);
            this.scene.add(this.hemiLight);

            // 3. Warm Interior Point Light for cozy home window illumination
            this.windowLight = new THREE.PointLight(0xFFEDD5, 2.2, 16);
            this.windowLight.position.set(0, 1.8, 0.8);
            this.rootGroup.add(this.windowLight);

            // 4. Accent Light for Smart Energy Infrastructure
            this.accentLight = new THREE.PointLight(this.currentConfig.light, 1.8, 14);
            this.accentLight.position.set(4.8, 1.6, 1.4);
            this.rootGroup.add(this.accentLight);
        }

        /**
         * High-Resolution Procedural Texture Generators
         */
        createStripedLawnTexture(size = 512) {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // Base rich lawn green (#15803D)
            ctx.fillStyle = '#15803D';
            ctx.fillRect(0, 0, size, size);

            // Alternating mowing stripes (subtle tone variation #166534)
            const stripeWidth = size / 8;
            for (let i = 0; i < 8; i += 2) {
                ctx.fillStyle = 'rgba(22, 101, 52, 0.42)';
                ctx.fillRect(i * stripeWidth, 0, stripeWidth, size);
            }

            // High-frequency organic grass blade speckle noise
            const imgData = ctx.getImageData(0, 0, size, size);
            const data = imgData.data;
            for (let i = 0; i < data.length; i += 4) {
                const noise = (Math.random() - 0.5) * 22;
                data[i] = Math.max(0, Math.min(255, data[i] + noise * 0.7));
                data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noise));
                data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noise * 0.5));
            }
            ctx.putImageData(imgData, 0, 0);

            const texture = new this.THREE.CanvasTexture(canvas);
            texture.wrapS = this.THREE.RepeatWrapping;
            texture.wrapT = this.THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            this.proceduralTextures.lawn = texture;
            return texture;
        }

        createCobblestoneTexture(size = 512) {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // Dark mortar background (#1E293B)
            ctx.fillStyle = '#1E293B';
            ctx.fillRect(0, 0, size, size);

            // Interlocking paver blocks
            const rows = 16;
            const cols = 8;
            const blockH = size / rows;
            const blockW = size / cols;

            for (let r = 0; r < rows; r++) {
                const offset = (r % 2 === 0) ? 0 : blockW * 0.5;
                for (let c = -1; c <= cols; c++) {
                    const x = c * blockW + offset + 2;
                    const y = r * blockH + 2;
                    const w = blockW - 4;
                    const h = blockH - 4;

                    const stoneTone = 110 + Math.floor(Math.random() * 45);
                    ctx.fillStyle = `rgb(${stoneTone}, ${stoneTone + 8}, ${stoneTone + 16})`;
                    ctx.beginPath();
                    ctx.roundRect ? ctx.roundRect(x, y, w, h, 3) : ctx.rect(x, y, w, h);
                    ctx.fill();

                    // Subtle paver bevel highlight
                    ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            const texture = new this.THREE.CanvasTexture(canvas);
            texture.wrapS = this.THREE.RepeatWrapping;
            texture.wrapT = this.THREE.RepeatWrapping;
            texture.repeat.set(2, 4);
            this.proceduralTextures.cobblestone = texture;
            return texture;
        }

        createWoodPlankTexture(size = 512) {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            ctx.fillStyle = '#92400E';
            ctx.fillRect(0, 0, size, size);

            // Cedar planks
            const planks = 12;
            const plankH = size / planks;
            for (let p = 0; p < planks; p++) {
                const y = p * plankH;
                const brightness = (Math.random() - 0.5) * 35;
                const r = Math.min(255, Math.max(0, 180 + brightness));
                const g = Math.min(255, Math.max(0, 83 + brightness * 0.7));
                const b = Math.min(255, Math.max(0, 15 + brightness * 0.4));
                ctx.fillStyle = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
                ctx.fillRect(0, y + 1, size, plankH - 2);

                // Wood grain lines
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
                ctx.lineWidth = 1;
                for (let gIdx = 0; gIdx < 4; gIdx++) {
                    const gy = y + Math.random() * (plankH - 2);
                    ctx.beginPath();
                    ctx.moveTo(0, gy);
                    ctx.lineTo(size, gy);
                    ctx.stroke();
                }
            }

            const texture = new this.THREE.CanvasTexture(canvas);
            texture.wrapS = this.THREE.RepeatWrapping;
            texture.wrapT = this.THREE.RepeatWrapping;
            texture.repeat.set(3, 3);
            this.proceduralTextures.wood = texture;
            return texture;
        }

        createSolarWaferTexture(size = 512) {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            // Deep navy-blue monocrystalline silicon background
            ctx.fillStyle = '#0A192F';
            ctx.fillRect(0, 0, size, size);

            // Silicon wafer cells (4x2 grid of cells per texture tile)
            const cellW = size / 4;
            const cellH = size / 2;
            for (let r = 0; r < 2; r++) {
                for (let c = 0; c < 4; c++) {
                    const x = c * cellW + 3;
                    const y = r * cellH + 3;
                    const w = cellW - 6;
                    const h = cellH - 6;

                    // Wafer gradient
                    const grad = ctx.createLinearGradient(x, y, x + w, y + h);
                    grad.addColorStop(0, '#1E3A8A');
                    grad.addColorStop(0.5, '#0F265C');
                    grad.addColorStop(1, '#0A192F');
                    ctx.fillStyle = grad;
                    ctx.beginPath();
                    ctx.roundRect ? ctx.roundRect(x, y, w, h, 6) : ctx.rect(x, y, w, h);
                    ctx.fill();

                    // Micro-busbars (ultra-fine silver conductor lines)
                    ctx.strokeStyle = 'rgba(226, 232, 240, 0.45)';
                    ctx.lineWidth = 1;
                    const fingers = 14;
                    for (let f = 1; f < fingers; f++) {
                        const fy = y + (h / fingers) * f;
                        ctx.beginPath();
                        ctx.moveTo(x + 2, fy);
                        ctx.lineTo(x + w - 2, fy);
                        ctx.stroke();
                    }

                    // Main silver busbar ribbons
                    ctx.strokeStyle = '#E2E8F0';
                    ctx.lineWidth = 2.5;
                    ctx.beginPath();
                    ctx.moveTo(x + w * 0.33, y);
                    ctx.lineTo(x + w * 0.33, y + h);
                    ctx.moveTo(x + w * 0.66, y);
                    ctx.lineTo(x + w * 0.66, y + h);
                    ctx.stroke();
                }
            }

            const texture = new this.THREE.CanvasTexture(canvas);
            this.proceduralTextures.solar = texture;
            return texture;
        }

        createParquetFloorTexture(size = 256) {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            ctx.fillStyle = '#D97706';
            ctx.fillRect(0, 0, size, size);

            const tiles = 8;
            const tSize = size / tiles;
            for (let r = 0; r < tiles; r++) {
                for (let c = 0; c < tiles; c++) {
                    const isAlt = (r + c) % 2 === 0;
                    ctx.fillStyle = isAlt ? 'rgba(180, 83, 9, 0.4)' : 'rgba(254, 240, 138, 0.15)';
                    ctx.fillRect(c * tSize, r * tSize, tSize, tSize);
                }
            }

            const texture = new this.THREE.CanvasTexture(canvas);
            texture.wrapS = this.THREE.RepeatWrapping;
            texture.wrapT = this.THREE.RepeatWrapping;
            texture.repeat.set(4, 4);
            this.proceduralTextures.parquet = texture;
            return texture;
        }

        createProceduralGlowTexture(size = 64, inner = 'rgba(255, 255, 255, 1)', mid = 'rgba(0, 230, 118, 0.8)', outer = 'rgba(0, 230, 118, 0)') {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            const center = size / 2;
            const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
            gradient.addColorStop(0, inner);
            gradient.addColorStop(0.35, mid);
            gradient.addColorStop(1, outer);

            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, size, size);

            const texture = new this.THREE.CanvasTexture(canvas);
            return texture;
        }

        /**
         * 1. High-End Landscaping & Ground Island
         */
        buildEnvironment() {
            const THREE = this.THREE;
            this.environmentGroup = new THREE.Group();
            this.rootGroup.add(this.environmentGroup);

            // A. Beveled Architectural Plinth Island Curb (#1E293B / #334155)
            const curbGeo = new THREE.BoxGeometry(22.4, 0.45, 16.8);
            const curbMat = new THREE.MeshStandardMaterial({
                color: 0x1E293B,
                roughness: 0.65,
                metalness: 0.25
            });
            const curbMesh = new THREE.Mesh(curbGeo, curbMat);
            curbMesh.position.set(0, -0.225, 0.4);
            curbMesh.receiveShadow = true;
            this.environmentGroup.add(curbMesh);

            // B. Rich Manicured Green Lawn with Procedural Striping
            const lawnTex = this.createStripedLawnTexture();
            const lawnGeo = new THREE.BoxGeometry(21.4, 0.16, 15.8);
            const lawnMat = new THREE.MeshStandardMaterial({
                color: 0x15803D,
                map: lawnTex,
                roughness: 0.88,
                metalness: 0.05
            });
            const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
            lawnMesh.position.set(0, 0.08, 0.4);
            lawnMesh.receiveShadow = true;
            this.environmentGroup.add(lawnMesh);

            // C. Soft Radial Ground Contact Shadow Plane
            const shadowCanvas = document.createElement('canvas');
            shadowCanvas.width = 128;
            shadowCanvas.height = 128;
            const sCtx = shadowCanvas.getContext('2d');
            if (sCtx) {
                const grad = sCtx.createRadialGradient(64, 64, 15, 64, 64, 64);
                grad.addColorStop(0, 'rgba(11, 21, 54, 0.75)');
                grad.addColorStop(0.5, 'rgba(11, 21, 54, 0.35)');
                grad.addColorStop(1, 'rgba(11, 21, 54, 0)');
                sCtx.fillStyle = grad;
                sCtx.fillRect(0, 0, 128, 128);
            }
            const shadowTex = new THREE.CanvasTexture(shadowCanvas);
            const shadowGeo = new THREE.PlaneGeometry(18.5, 13.5);
            const shadowMat = new THREE.MeshBasicMaterial({
                map: shadowTex,
                transparent: true,
                depthWrite: false
            });
            const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.position.set(0, 0.165, 0.4);
            this.environmentGroup.add(shadowPlane);

            // D. Interlocking Cobblestone Driveway for the Electric Vehicle
            const cobbleTex = this.createCobblestoneTexture();
            const drivewayGeo = new THREE.BoxGeometry(4.8, 0.08, 9.2);
            const drivewayMat = new THREE.MeshStandardMaterial({
                color: 0x64748B,
                map: cobbleTex,
                roughness: 0.72,
                metalness: 0.18
            });
            const driveway = new THREE.Mesh(drivewayGeo, drivewayMat);
            driveway.position.set(-6.0, 0.17, 1.8);
            driveway.receiveShadow = true;
            this.environmentGroup.add(driveway);

            // Driveway border curb stones
            const curbLeftGeo = new THREE.BoxGeometry(0.12, 0.1, 9.2);
            const stoneCurbMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 });
            const curbLeft = new THREE.Mesh(curbLeftGeo, stoneCurbMat);
            curbLeft.position.set(-8.42, 0.18, 1.8);
            this.environmentGroup.add(curbLeft);
            const curbRight = new THREE.Mesh(curbLeftGeo, stoneCurbMat);
            curbRight.position.set(-3.58, 0.18, 1.8);
            this.environmentGroup.add(curbRight);

            // E. Warm Timber Deck Terrace under Pergola
            const woodTex = this.createWoodPlankTexture();
            const deckGeo = new THREE.BoxGeometry(6.6, 0.08, 5.0);
            const deckMat = new THREE.MeshStandardMaterial({
                color: 0xB45309,
                map: woodTex,
                roughness: 0.65,
                metalness: 0.12
            });
            const deck = new THREE.Mesh(deckGeo, deckMat);
            deck.position.set(3.8, 0.17, 2.6);
            deck.receiveShadow = true;
            this.environmentGroup.add(deck);

            // F. Architectural Anthracite Pergola over Terrace
            const pergolaMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.35,
                metalness: 0.65
            });
            const postGeo = new THREE.BoxGeometry(0.12, 2.9, 0.12);
            const postCoords = [
                [0.8, 1.5, 0.4],
                [0.8, 1.5, 4.8],
                [6.8, 1.5, 0.4],
                [6.8, 1.5, 4.8]
            ];
            postCoords.forEach(([px, py, pz]) => {
                const post = new THREE.Mesh(postGeo, pergolaMat);
                post.position.set(px, py, pz);
                post.castShadow = true;
                this.environmentGroup.add(post);
            });

            // Pergola longitudinal beams
            const beamLongGeo = new THREE.BoxGeometry(6.2, 0.12, 0.12);
            const beamFront = new THREE.Mesh(beamLongGeo, pergolaMat);
            beamFront.position.set(3.8, 2.95, 4.8);
            beamFront.castShadow = true;
            this.environmentGroup.add(beamFront);
            const beamRear = new THREE.Mesh(beamLongGeo, pergolaMat);
            beamRear.position.set(3.8, 2.95, 0.4);
            beamRear.castShadow = true;
            this.environmentGroup.add(beamRear);

            // 7 Angled Sun-Shading Louvers across Pergola Ceiling
            const louverGeo = new THREE.BoxGeometry(0.06, 0.16, 4.5);
            for (let l = 0; l < 7; l++) {
                const lx = 1.3 + l * 0.8;
                const louver = new THREE.Mesh(louverGeo, pergolaMat);
                louver.rotation.x = 0.35; // Angled louver tilt
                louver.position.set(lx, 3.02, 2.6);
                louver.castShadow = true;
                this.environmentGroup.add(louver);
            }

            // G. Architectural Trees & Sculpted Landscaping
            // Tree 1 (Front Right Garden)
            this.buildArchitecturalTree(7.6, 0.16, -1.6, 1.05);
            // Tree 2 (Rear Left Garden)
            this.buildArchitecturalTree(-8.2, 0.16, -4.5, 0.92);

            // 4 Sculpted Evergreen Boxwood Spherical Shrubs
            const shrubCoords = [
                [2.8, 0.45, 5.4, 0.38],
                [1.6, 0.42, 5.4, 0.32],
                [-3.2, 0.48, 5.2, 0.42],
                [-3.2, 0.42, 4.0, 0.34]
            ];
            const shrubMat = new THREE.MeshStandardMaterial({
                color: 0x14532D,
                roughness: 0.92,
                metalness: 0.05
            });
            shrubCoords.forEach(([sx, sy, sz, radius]) => {
                const shrubGeo = new THREE.SphereGeometry(radius, 16, 16);
                const shrub = new THREE.Mesh(shrubGeo, shrubMat);
                shrub.scale.set(1.0, 1.15, 1.0);
                shrub.position.set(sx, sy, sz);
                shrub.castShadow = true;
                shrub.receiveShadow = true;
                this.environmentGroup.add(shrub);
            });

            // Modern Garden Bollard Path Lights with Warm Pools of Light
            const bollardMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.7 });
            const ledSlitMat = new THREE.MeshBasicMaterial({ color: 0xFEF08A });
            const bollardCoords = [
                [-3.4, 0.42, 2.8],
                [-3.4, 0.42, 0.4],
                [0.5, 0.42, 3.8],
                [7.0, 0.42, 2.4]
            ];
            bollardCoords.forEach(([bx, by, bz]) => {
                const bollardGeo = new THREE.CylinderGeometry(0.045, 0.045, 0.55, 12);
                const bollard = new THREE.Mesh(bollardGeo, bollardMat);
                bollard.position.set(bx, by, bz);
                bollard.castShadow = true;
                this.environmentGroup.add(bollard);

                const slitGeo = new THREE.CylinderGeometry(0.048, 0.048, 0.05, 12);
                const slit = new THREE.Mesh(slitGeo, ledSlitMat);
                slit.position.set(bx, by + 0.18, bz);
                this.environmentGroup.add(slit);

                const bLight = new THREE.PointLight(0xFEF08A, 0.45, 3.0);
                bLight.position.set(bx, by + 0.2, bz);
                this.environmentGroup.add(bLight);
                this.bollardLights.push(bLight);
            });
        }

        buildArchitecturalTree(x, y, z, scale = 1.0) {
            const THREE = this.THREE;
            const treeGroup = new THREE.Group();
            treeGroup.position.set(x, y, z);
            treeGroup.scale.set(scale, scale, scale);

            // Trunk with natural organic taper
            const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3E2723, roughness: 0.95 });
            const trunkGeo = new THREE.CylinderGeometry(0.12, 0.22, 2.6, 10);
            const trunk = new THREE.Mesh(trunkGeo, trunkMat);
            trunk.position.set(0, 1.3, 0);
            trunk.castShadow = true;
            treeGroup.add(trunk);

            // Layered Canopy Spheres
            const foliageColors = [0x15803D, 0x166534, 0x14532D, 0x22C55E];
            const clusters = [
                [0, 2.6, 0, 1.25, 0],
                [0.55, 3.1, 0.35, 0.95, 1],
                [-0.45, 2.9, -0.4, 0.9, 2],
                [0, 3.7, 0, 0.8, 3]
            ];
            clusters.forEach(([cx, cy, cz, r, cIdx]) => {
                const geo = new THREE.SphereGeometry(r, 16, 14);
                const mat = new THREE.MeshStandardMaterial({
                    color: foliageColors[cIdx % foliageColors.length],
                    roughness: 0.88,
                    metalness: 0.05
                });
                const mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(cx, cy, cz);
                mesh.scale.set(1.05, 0.9, 1.0);
                mesh.castShadow = true;
                mesh.receiveShadow = true;
                treeGroup.add(mesh);
            });

            this.environmentGroup.add(treeGroup);
        }

        /**
         * 2. Modern Luxury Residential Villa
         */
        buildSmartHome() {
            const THREE = this.THREE;
            this.houseGroup = new THREE.Group();
            this.rootGroup.add(this.houseGroup);

            // High-End Architectural Materials
            const stuccoWhiteMat = new THREE.MeshStandardMaterial({
                color: 0xF8FAFC,       // Crisp architectural white stucco
                roughness: 0.82,
                metalness: 0.04
            });
            const cedarWoodMat = new THREE.MeshStandardMaterial({
                color: 0xB45309,       // Warm cedar siding (#b45309)
                map: this.proceduralTextures.wood || null,
                roughness: 0.65,
                metalness: 0.08
            });
            const darkSlateRoofMat = new THREE.MeshStandardMaterial({
                color: 0x1E293B,       // Standing-seam zinc / dark slate roof
                roughness: 0.42,
                metalness: 0.32
            });
            const frameAnthraciteMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.35,
                metalness: 0.6
            });
            const stainlessMat = new THREE.MeshStandardMaterial({
                color: 0xCBD5E1,
                roughness: 0.2,
                metalness: 0.9
            });

            // Glowing Double-Pane Window Glass Material
            this.windowGlassMat = new THREE.MeshStandardMaterial({
                color: 0xFEF08A,       // Cozy warm interior glow
                emissive: 0xF59E0B,
                emissiveIntensity: 0.52,
                roughness: 0.12,
                metalness: 0.25,
                transparent: true,
                opacity: 0.82
            });

            // Tinted Balcony Glass
            const balconyGlassMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.1,
                metalness: 0.8,
                transparent: true,
                opacity: 0.65
            });

            // A. Villa Plinth Foundation (7.8 x 0.35 x 6.2)
            const plinthGeo = new THREE.BoxGeometry(7.8, 0.35, 6.2);
            const plinthMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.85 });
            const plinth = new THREE.Mesh(plinthGeo, plinthMat);
            plinth.position.set(0, 0.18, 0);
            plinth.receiveShadow = true;
            this.houseGroup.add(plinth);

            // B. Ground Floor Interior Parquet Floor Slab
            const parquetTex = this.createParquetFloorTexture();
            const floorGeo = new THREE.BoxGeometry(7.0, 0.06, 5.4);
            const floorMat = new THREE.MeshStandardMaterial({
                color: 0xD97706,
                map: parquetTex,
                roughness: 0.5
            });
            const floorMesh = new THREE.Mesh(floorGeo, floorMat);
            floorMesh.position.set(0, 0.38, 0);
            this.houseGroup.add(floorMesh);

            // C. Ground Floor Living Space Facade (White Stucco + Panoramic Glass)
            const gfMainGeo = new THREE.BoxGeometry(7.2, 2.7, 5.6);
            const gfMesh = new THREE.Mesh(gfMainGeo, stuccoWhiteMat);
            gfMesh.position.set(0, 1.7, 0);
            gfMesh.castShadow = true;
            gfMesh.receiveShadow = true;
            this.houseGroup.add(gfMesh);

            // Floor-to-Ceiling Front Panoramic Glass Curtain Wall (4.4m wide x 2.3m high)
            const glassWallGeo = new THREE.BoxGeometry(4.4, 2.3, 0.08);
            const glassWall = new THREE.Mesh(glassWallGeo, this.windowGlassMat);
            glassWall.position.set(-0.9, 1.65, 2.82);
            this.houseGroup.add(glassWall);
            this.windowMeshes.push(glassWall);

            // Anthracite Mullions & Frame for Panoramic Glass
            const frameOuterGeo = new THREE.BoxGeometry(4.48, 2.38, 0.06);
            const frameOuter = new THREE.Mesh(frameOuterGeo, frameAnthraciteMat);
            frameOuter.position.set(-0.9, 1.65, 2.81);
            this.houseGroup.add(frameOuter);

            // Vertical mullion dividing sliders
            const mullionGeo = new THREE.BoxGeometry(0.08, 2.3, 0.12);
            for (let m = -1; m <= 1; m++) {
                const mullion = new THREE.Mesh(mullionGeo, frameAnthraciteMat);
                mullion.position.set(-0.9 + m * 1.45, 1.65, 2.84);
                this.houseGroup.add(mullion);
            }

            // Modern Entrance Doorway in Graphite with Stainless Steel Bar Handle
            const doorGeo = new THREE.BoxGeometry(1.15, 2.35, 0.08);
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.35, metalness: 0.4 });
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(2.1, 1.65, 2.82);
            this.houseGroup.add(door);

            const handleGeo = new THREE.CylinderGeometry(0.016, 0.016, 1.2, 12);
            const handle = new THREE.Mesh(handleGeo, stainlessMat);
            handle.position.set(2.55, 1.65, 2.9);
            this.houseGroup.add(handle);

            // Vertical Frosted Glass Side-Lite with Warm Glow
            const sideLiteGeo = new THREE.BoxGeometry(0.35, 2.35, 0.06);
            const sideLite = new THREE.Mesh(sideLiteGeo, this.windowGlassMat);
            sideLite.position.set(2.95, 1.65, 2.82);
            this.houseGroup.add(sideLite);
            this.windowMeshes.push(sideLite);

            // Panoramic Glass Corner on the Side facing Terrace
            const sideWinGeo = new THREE.BoxGeometry(0.08, 2.2, 2.6);
            const sideWin = new THREE.Mesh(sideWinGeo, this.windowGlassMat);
            sideWin.position.set(3.62, 1.65, 1.0);
            this.houseGroup.add(sideWin);
            this.windowMeshes.push(sideWin);

            // D. Cantilevered Upper Floor (Projects 0.8m over ground floor terrace)
            const ufGeo = new THREE.BoxGeometry(7.4, 2.5, 5.4);
            const ufMesh = new THREE.Mesh(ufGeo, stuccoWhiteMat);
            ufMesh.position.set(-0.3, 4.25, 0);
            ufMesh.castShadow = true;
            ufMesh.receiveShadow = true;
            this.houseGroup.add(ufMesh);

            // Upper Floor Vertical Cedar Wood Slat Cladding Accent
            const cedarAccentGeo = new THREE.BoxGeometry(3.2, 2.52, 0.1);
            const cedarAccent = new THREE.Mesh(cedarAccentGeo, cedarWoodMat);
            cedarAccent.position.set(1.7, 4.25, 2.72);
            this.houseGroup.add(cedarAccent);

            // Upper Floor Master Suite Picture Windows
            const ufWin1Geo = new THREE.BoxGeometry(2.8, 1.45, 0.08);
            const ufWin1 = new THREE.Mesh(ufWin1Geo, this.windowGlassMat);
            ufWin1.position.set(-1.4, 4.3, 2.72);
            this.houseGroup.add(ufWin1);
            this.windowMeshes.push(ufWin1);

            const ufWinFrame = new THREE.Mesh(new THREE.BoxGeometry(2.88, 1.53, 0.06), frameAnthraciteMat);
            ufWinFrame.position.set(-1.4, 4.3, 2.71);
            this.houseGroup.add(ufWinFrame);

            // E. Luxury Glass Balcony with Stainless Steel Railing
            const balconyBaseGeo = new THREE.BoxGeometry(3.6, 0.14, 1.8);
            const balconyBase = new THREE.Mesh(balconyBaseGeo, frameAnthraciteMat);
            balconyBase.position.set(2.0, 3.02, 3.6);
            balconyBase.castShadow = true;
            this.houseGroup.add(balconyBase);

            // Balcony Glass Panels (Front & Sides)
            const balcFrontGeo = new THREE.BoxGeometry(3.6, 0.95, 0.04);
            const balcFront = new THREE.Mesh(balcFrontGeo, balconyGlassMat);
            balcFront.position.set(2.0, 3.55, 4.48);
            this.houseGroup.add(balcFront);

            const balcSideGeo = new THREE.BoxGeometry(0.04, 0.95, 1.76);
            const balcSide = new THREE.Mesh(balcSideGeo, balconyGlassMat);
            balcSide.position.set(3.78, 3.55, 3.6);
            this.houseGroup.add(balcSide);

            // Stainless Steel Handrail
            const railGeo = new THREE.BoxGeometry(3.64, 0.05, 0.06);
            const railFront = new THREE.Mesh(railGeo, stainlessMat);
            railFront.position.set(2.0, 4.05, 4.48);
            this.houseGroup.add(railFront);

            // F. Architectural Zinc / Slate Pitched Roof with Ridge Capping & Eaves
            // Front roof slope (Pitch: 0.52 rad ~ 30 deg)
            const roofFrontGeo = new THREE.BoxGeometry(7.8, 0.18, 3.5);
            const roofFront = new THREE.Mesh(roofFrontGeo, darkSlateRoofMat);
            roofFront.position.set(-0.3, 6.15, 1.4);
            roofFront.rotation.x = 0.52;
            roofFront.castShadow = true;
            roofFront.receiveShadow = true;
            this.houseGroup.add(roofFront);

            // Rear roof slope
            const roofRearGeo = new THREE.BoxGeometry(7.8, 0.18, 3.5);
            const roofRear = new THREE.Mesh(roofRearGeo, darkSlateRoofMat);
            roofRear.position.set(-0.3, 6.15, -1.4);
            roofRear.rotation.x = -0.52;
            roofRear.castShadow = true;
            roofRear.receiveShadow = true;
            this.houseGroup.add(roofRear);

            // Ridge capping along apex
            const ridgeGeo = new THREE.BoxGeometry(7.85, 0.1, 0.22);
            const ridge = new THREE.Mesh(ridgeGeo, frameAnthraciteMat);
            ridge.position.set(-0.3, 7.02, 0);
            this.houseGroup.add(ridge);

            // Roof Gutter along Front Eaves
            const gutterGeo = new THREE.CylinderGeometry(0.06, 0.06, 7.82, 12);
            const gutterMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.7 });
            const gutter = new THREE.Mesh(gutterGeo, gutterMat);
            gutter.rotation.z = Math.PI / 2;
            gutter.position.set(-0.3, 5.28, 2.88);
            this.houseGroup.add(gutter);

            // Vertical Downpipe into Drainage Box
            const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 5.1, 10);
            const downpipe = new THREE.Mesh(pipeGeo, gutterMat);
            downpipe.position.set(3.55, 2.75, 2.88);
            this.houseGroup.add(downpipe);

            // Modern Slim Chimney with Stainless Cowl
            const chimneyGeo = new THREE.BoxGeometry(0.65, 1.35, 0.65);
            const chimney = new THREE.Mesh(chimneyGeo, frameAnthraciteMat);
            chimney.position.set(1.8, 7.2, -0.6);
            chimney.castShadow = true;
            this.houseGroup.add(chimney);

            const cowlGeo = new THREE.BoxGeometry(0.85, 0.06, 0.85);
            const cowl = new THREE.Mesh(cowlGeo, stainlessMat);
            cowl.position.set(1.8, 7.9, -0.6);
            this.houseGroup.add(cowl);
        }

        /**
         * 3. Rooftop 8-Panel Monocrystalline Photovoltaik Solar Array
         */
        buildSolarArray() {
            const THREE = this.THREE;
            this.solarArrayGroup = new THREE.Group();
            this.houseGroup.add(this.solarArrayGroup);

            // Position array on front roof pitch
            this.solarArrayGroup.position.set(-0.3, 6.22, 1.42);
            this.solarArrayGroup.rotation.x = 0.52;

            // Aluminum Extruded Mounting Rails
            const railMat = new THREE.MeshStandardMaterial({
                color: 0xCBD5E1,
                roughness: 0.25,
                metalness: 0.85
            });
            const railTop = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.05, 0.05), railMat);
            railTop.position.set(0, 0.05, 0.72);
            const railBot = new THREE.Mesh(new THREE.BoxGeometry(5.8, 0.05, 0.05), railMat);
            railBot.position.set(0, 0.05, -0.72);
            this.solarArrayGroup.add(railTop);
            this.solarArrayGroup.add(railBot);

            // Deep Navy-Blue Monocrystalline Silicon Material with Specular Clearcoat Sheen
            const solarTex = this.proceduralTextures.solar || this.createSolarWaferTexture();
            this.solarWaferMat = new THREE.MeshStandardMaterial({
                color: 0x0A192F,
                map: solarTex,
                emissive: 0x0284C7,
                emissiveIntensity: 0.15,
                roughness: 0.1,
                metalness: 0.85
            });

            // 2 rows of 4 high-efficiency PV panels
            const panelW = 1.32;
            const panelH = 0.04;
            const panelD = 1.15;
            const startX = -2.1;

            for (let r = 0; r < 2; r++) {
                const z = (r === 0) ? -0.65 : 0.65;
                for (let c = 0; c < 4; c++) {
                    const x = startX + c * (panelW + 0.08);

                    // Panel silicon wafer box
                    const panelGeo = new THREE.BoxGeometry(panelW, panelH, panelD);
                    const panelMesh = new THREE.Mesh(panelGeo, this.solarWaferMat);
                    panelMesh.position.set(x, 0.08, z);
                    panelMesh.castShadow = true;
                    panelMesh.receiveShadow = true;
                    this.solarArrayGroup.add(panelMesh);

                    // Silver Aluminum Outer Frame
                    const frameEdges = new THREE.LineSegments(
                        new THREE.EdgesGeometry(panelGeo),
                        new THREE.LineBasicMaterial({ color: 0xE2E8F0, linewidth: 1.5 })
                    );
                    frameEdges.position.copy(panelMesh.position);
                    this.solarArrayGroup.add(frameEdges);
                }
            }

            // Rooftop String Inverter Junction Box with Status Indicator
            const inverterGeo = new THREE.BoxGeometry(0.35, 0.15, 0.25);
            const inverterMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4, metalness: 0.5 });
            const inverter = new THREE.Mesh(inverterGeo, inverterMat);
            inverter.position.set(2.4, 0.12, 0.7);
            this.solarArrayGroup.add(inverter);

            const invLedGeo = new THREE.SphereGeometry(0.025, 8, 8);
            const invLedMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
            const invLed = new THREE.Mesh(invLedGeo, invLedMat);
            invLed.position.set(2.4, 0.21, 0.7);
            this.solarArrayGroup.add(invLed);
        }

        /**
         * 4. Monobloc Outdoor Heat Pump Unit (Wärmepumpe)
         */
        buildHeatPump() {
            const THREE = this.THREE;
            this.heatPumpGroup = new THREE.Group();
            this.rootGroup.add(this.heatPumpGroup);

            // Positioned beside the house on the timber garden terrace
            this.heatPumpGroup.position.set(4.8, 0.18, 1.2);

            // A. Anti-vibration concrete isolation slab
            const slabGeo = new THREE.BoxGeometry(1.5, 0.16, 1.1);
            const slabMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.9 });
            const slab = new THREE.Mesh(slabGeo, slabMat);
            slab.position.set(0, 0.08, 0);
            slab.receiveShadow = true;
            this.heatPumpGroup.add(slab);

            // B. Architectural Matte White Cabinet
            const bodyGeo = new THREE.BoxGeometry(1.35, 1.25, 0.85);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0xF8FAFC,
                roughness: 0.35,
                metalness: 0.15
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.set(0, 0.78, 0);
            body.castShadow = true;
            body.receiveShadow = true;
            this.heatPumpGroup.add(body);

            // C. Front Circular Fan Duct / Shroud
            const ductGeo = new THREE.CylinderGeometry(0.42, 0.42, 0.08, 32);
            const ductMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.6 });
            const duct = new THREE.Mesh(ductGeo, ductMat);
            duct.rotation.x = Math.PI / 2;
            duct.position.set(-0.15, 0.8, 0.43);
            this.heatPumpGroup.add(duct);

            // D. Actively Spinning 3-Blade Aerodynamic Rotor Fan
            this.heatPumpFan = new THREE.Group();
            this.heatPumpFan.position.set(-0.15, 0.8, 0.42);

            const hubGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.06, 16);
            const hubMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.5 });
            const hub = new THREE.Mesh(hubGeo, hubMat);
            hub.rotation.x = Math.PI / 2;
            this.heatPumpFan.add(hub);

            const bladeGeo = new THREE.BoxGeometry(0.09, 0.36, 0.02);
            const bladeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.35, metalness: 0.4 });
            for (let b = 0; b < 3; b++) {
                const blade = new THREE.Mesh(bladeGeo, bladeMat);
                blade.rotation.z = b * (Math.PI * 2 / 3);
                blade.position.set(
                    Math.cos(blade.rotation.z + Math.PI / 2) * 0.18,
                    Math.sin(blade.rotation.z + Math.PI / 2) * 0.18,
                    0
                );
                this.heatPumpFan.add(blade);
            }
            this.heatPumpGroup.add(this.heatPumpFan);

            // E. Acoustic Horizontal Intake Louvers
            const slatMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.5 });
            for (let s = -3; s <= 3; s++) {
                const slatGeo = new THREE.BoxGeometry(0.92, 0.018, 0.02);
                const slat = new THREE.Mesh(slatGeo, slatMat);
                slat.position.set(-0.15, 0.8 + s * 0.09, 0.47);
                this.heatPumpGroup.add(slat);
            }

            // F. Glowing Status LED Ring
            const ringGeo = new THREE.RingGeometry(0.42, 0.45, 32);
            this.heatPumpLedMat = new THREE.MeshBasicMaterial({
                color: this.currentConfig.primary,
                side: THREE.DoubleSide
            });
            const ledRing = new THREE.Mesh(ringGeo, this.heatPumpLedMat);
            ledRing.position.set(-0.15, 0.8, 0.48);
            this.heatPumpGroup.add(ledRing);

            // G. Insulated Copper Refrigerant Lines entering the house wall
            const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.4, 12);
            const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(-0.7, 0.45, -0.1);
            this.heatPumpGroup.add(pipe);
        }

        /**
         * 5. Wallbox EV Charging Station & Electric Sports Sedan
         */
        buildWallboxAndEV() {
            const THREE = this.THREE;
            this.wallboxGroup = new THREE.Group();
            this.rootGroup.add(this.wallboxGroup);

            // A. Wallbox mounted on house facade next to driveway (-3.6, 1.6, 1.8)
            const wbBackGeo = new THREE.BoxGeometry(0.08, 0.6, 0.42);
            const wbMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3, metalness: 0.3 });
            const wbBack = new THREE.Mesh(wbBackGeo, wbMat);
            wbBack.position.set(-3.64, 1.6, 1.8);
            this.wallboxGroup.add(wbBack);

            // Glass Faceplate
            const wbGlassGeo = new THREE.BoxGeometry(0.02, 0.52, 0.36);
            const wbGlassMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1, metalness: 0.8 });
            const wbGlass = new THREE.Mesh(wbGlassGeo, wbGlassMat);
            wbGlass.position.set(-3.59, 1.6, 1.8);
            this.wallboxGroup.add(wbGlass);

            // Glowing Wallbox Status Halo Ring
            const ringGeo = new THREE.RingGeometry(0.075, 0.105, 24);
            this.wallboxStatusMat = new THREE.MeshBasicMaterial({
                color: this.currentConfig.primary,
                side: THREE.DoubleSide
            });
            this.wallboxStatusRing = new THREE.Mesh(ringGeo, this.wallboxStatusMat);
            this.wallboxStatusRing.rotation.y = Math.PI / 2;
            this.wallboxStatusRing.position.set(-3.57, 1.62, 1.8);
            this.wallboxGroup.add(this.wallboxStatusRing);

            // Coiled High-Voltage Charging Cable
            const cablePoints = [];
            for (let t = 0; t <= 1; t += 0.05) {
                const x = -3.6 + t * (-1.4);
                const y = 1.35 - Math.sin(t * Math.PI) * 0.95;
                const z = 1.8 + t * (0.1);
                cablePoints.push(new THREE.Vector3(x, Math.max(0.2, y), z));
            }
            const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
            const cableGeo = new THREE.TubeGeometry(cableCurve, 24, 0.024, 8, false);
            const cableMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.65 });
            const cableMesh = new THREE.Mesh(cableGeo, cableMat);
            this.wallboxGroup.add(cableMesh);

            // B. Sleek Metallic Electric Sports Sedan
            this.evGroup = new THREE.Group();
            this.rootGroup.add(this.evGroup);
            this.evGroup.position.set(-6.0, 0.18, 1.8);

            // Metallic Pearl White Car Paint
            const carPaintMat = new THREE.MeshStandardMaterial({
                color: 0xF8FAFC,
                roughness: 0.18,
                metalness: 0.85
            });

            // Aerodynamic Lower Body Chassis
            const evBodyGeo = new THREE.BoxGeometry(2.05, 0.5, 4.2);
            const evBody = new THREE.Mesh(evBodyGeo, carPaintMat);
            evBody.position.set(0, 0.44, 0);
            evBody.castShadow = true;
            evBody.receiveShadow = true;
            this.evGroup.add(evBody);

            // Sculpted Aerodynamic Hood
            const hoodGeo = new THREE.BoxGeometry(1.95, 0.18, 1.4);
            const hood = new THREE.Mesh(hoodGeo, carPaintMat);
            hood.position.set(0, 0.65, 1.25);
            hood.rotation.x = -0.12;
            this.evGroup.add(hood);

            // Tinted Panoramic Glass Greenhouse Cabin
            const evCabinGeo = new THREE.BoxGeometry(1.72, 0.48, 2.3);
            const evCabinMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.08,
                metalness: 0.92
            });
            const evCabin = new THREE.Mesh(evCabinGeo, evCabinMat);
            evCabin.position.set(0, 0.88, -0.2);
            evCabin.castShadow = true;
            this.evGroup.add(evCabin);

            // Front Signature LED Light Strip
            const headLightGeo = new THREE.BoxGeometry(1.9, 0.06, 0.04);
            const headLightMat = new THREE.MeshBasicMaterial({ color: 0x00D2FF });
            const headLight = new THREE.Mesh(headLightGeo, headLightMat);
            headLight.position.set(0, 0.48, 2.11);
            this.evGroup.add(headLight);

            // Rear Tail Light Bar
            const tailLightGeo = new THREE.BoxGeometry(1.9, 0.06, 0.04);
            const tailLightMat = new THREE.MeshBasicMaterial({ color: 0xEF4444 });
            const tailLight = new THREE.Mesh(tailLightGeo, tailLightMat);
            tailLight.position.set(0, 0.52, -2.11);
            this.evGroup.add(tailLight);

            // EV Charging Port Indicator Ring
            const evPortGeo = new THREE.RingGeometry(0.04, 0.065, 16);
            this.evPortMat = new THREE.MeshBasicMaterial({ color: this.currentConfig.primary, side: THREE.DoubleSide });
            this.evStatusRing = new THREE.Mesh(evPortGeo, this.evPortMat);
            this.evStatusRing.rotation.y = -Math.PI / 2;
            this.evStatusRing.position.set(1.035, 0.56, -1.1);
            this.evGroup.add(this.evStatusRing);

            // 4 Detailed Alloy Wheels (5-Spoke Rims & Brake Calipers)
            const tireMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.88 });
            const rimMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.2, metalness: 0.85 });
            const brakeMat = new THREE.MeshStandardMaterial({ color: 0xEF4444, roughness: 0.4, metalness: 0.7 });

            const wheelOffsets = [
                [-1.02, 0.24, 1.25],
                [1.02, 0.24, 1.25],
                [-1.02, 0.24, -1.25],
                [1.02, 0.24, -1.25]
            ];

            wheelOffsets.forEach(([wx, wy, wz]) => {
                const wheelGeo = new THREE.CylinderGeometry(0.26, 0.26, 0.18, 18);
                const wheel = new THREE.Mesh(wheelGeo, tireMat);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(wx, wy, wz);
                wheel.castShadow = true;

                // Rim
                const rimGeo = new THREE.CylinderGeometry(0.16, 0.16, 0.19, 16);
                const rim = new THREE.Mesh(rimGeo, rimMat);
                wheel.add(rim);

                // Brake Caliper
                const caliperGeo = new THREE.BoxGeometry(0.06, 0.08, 0.04);
                const caliper = new THREE.Mesh(caliperGeo, brakeMat);
                caliper.position.set(0.08, 0.08, 0);
                wheel.add(caliper);

                this.evGroup.add(wheel);
            });
        }

        /**
         * 6. Digital Smart Meter Gateway & Battery Storage (Speicher)
         */
        buildSmartMeterAndBattery() {
            const THREE = this.THREE;

            // A. Digital Smart Meter Gateway Enclosure
            const meterGeo = new THREE.BoxGeometry(0.28, 0.4, 0.1);
            const meterMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.4 });
            const meter = new THREE.Mesh(meterGeo, meterMat);
            meter.position.set(2.85, 1.35, 2.84);
            this.houseGroup.add(meter);

            // Pulsing Green LED Telemetry Beacon
            const ledGeo = new THREE.SphereGeometry(0.028, 10, 10);
            this.meterLedMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
            this.smartMeterLed = new THREE.Mesh(ledGeo, this.meterLedMat);
            this.smartMeterLed.position.set(2.85, 1.45, 2.9);
            this.houseGroup.add(this.smartMeterLed);

            // B. Alpha Home Storage Battery (Speicher)
            this.batteryGroup = new THREE.Group();
            this.houseGroup.add(this.batteryGroup);
            this.batteryGroup.position.set(3.0, 0.72, 2.4);

            const battGeo = new THREE.BoxGeometry(0.32, 1.15, 0.65);
            const battMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.5 });
            const battMesh = new THREE.Mesh(battGeo, battMat);
            battMesh.castShadow = true;
            this.batteryGroup.add(battMesh);

            // Battery LED state-of-charge bars
            this.batteryLeds = [];
            for (let b = 0; b < 4; b++) {
                const barGeo = new THREE.BoxGeometry(0.02, 0.04, 0.35);
                const barMat = new THREE.MeshBasicMaterial({ color: this.currentConfig.primary });
                const bar = new THREE.Mesh(barGeo, barMat);
                bar.position.set(0.165, 0.25 - b * 0.12, 0);
                this.batteryGroup.add(bar);
                this.batteryLeds.push(bar);
            }
        }

        /**
         * 7. Dynamic Energy Flow Trajectories & Photons
         */
        buildFlowTrajectories() {
            const THREE = this.THREE;
            this.flowTracksGroup = new THREE.Group();
            this.rootGroup.add(this.flowTracksGroup);

            // 1. Solar Roof -> Battery & Smart Meter
            const pSolar = new THREE.Vector3(-0.3, 5.85, 1.4);
            const pMeter = new THREE.Vector3(2.85, 1.35, 2.7);
            const curve1 = new THREE.CatmullRomCurve3([
                pSolar,
                new THREE.Vector3(1.2, 4.2, 2.0),
                pMeter
            ]);

            // 2. Battery / Smart Meter -> Wallbox -> EV
            const pWallbox = new THREE.Vector3(-3.6, 1.45, 1.8);
            const pEV = new THREE.Vector3(-4.95, 0.74, 0.7);
            const curve2 = new THREE.CatmullRomCurve3([
                pMeter,
                new THREE.Vector3(-0.4, 0.5, 2.8),
                pWallbox,
                pEV
            ]);

            // 3. Grid / Smart Meter -> Heat Pump
            const pHeatPump = new THREE.Vector3(4.8, 0.8, 1.2);
            const curve3 = new THREE.CatmullRomCurve3([
                pMeter,
                new THREE.Vector3(3.9, 0.7, 2.0),
                pHeatPump
            ]);

            // 4. Inflow to domestic circuits
            const curve4 = new THREE.CatmullRomCurve3([
                new THREE.Vector3(0, 0.2, 5.5),
                new THREE.Vector3(1.5, 0.5, 4.0),
                pMeter
            ]);

            this.curves = [curve1, curve2, curve3, curve4];

            // Render glowing translucent spline tubes
            this.curves.forEach((c) => {
                const tubeGeo = new THREE.TubeGeometry(c, 36, 0.022, 8, false);
                const tubeMat = new THREE.MeshBasicMaterial({
                    color: this.currentConfig.primary,
                    transparent: true,
                    opacity: 0.38
                });
                const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
                this.flowTracksGroup.add(tubeMesh);
                this.curveMeshes.push(tubeMesh);
            });
        }

        buildTravelingPhotons() {
            const THREE = this.THREE;
            this.photons = [];

            const photonPositions = new Float32Array(this.photonCount * 3);
            const photonColors = new Float32Array(this.photonCount * 3);
            const colorObj = new THREE.Color(this.currentConfig.primary);

            for (let i = 0; i < this.photonCount; i++) {
                const curveIdx = i % this.curves.length;
                const progress = Math.random();
                const speed = 0.12 + Math.random() * 0.18;

                this.photons.push({
                    curveIdx,
                    progress,
                    speed,
                    baseSpeed: speed
                });

                const pos = this.curves[curveIdx].getPointAt(progress);
                photonPositions[i * 3] = pos.x;
                photonPositions[i * 3 + 1] = pos.y;
                photonPositions[i * 3 + 2] = pos.z;

                photonColors[i * 3] = colorObj.r;
                photonColors[i * 3 + 1] = colorObj.g;
                photonColors[i * 3 + 2] = colorObj.b;
            }

            const pGeo = new THREE.BufferGeometry();
            pGeo.setAttribute('position', new THREE.BufferAttribute(photonPositions, 3));
            pGeo.setAttribute('color', new THREE.BufferAttribute(photonColors, 3));

            const glowTex = this.createProceduralGlowTexture(64, 'rgba(255,255,255,1)', 'rgba(0,230,118,0.85)', 'rgba(0,230,118,0)');
            this.glowTextures.photon = glowTex;

            const pMat = new THREE.PointsMaterial({
                size: 0.42,
                map: glowTex,
                transparent: true,
                vertexColors: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.photonsMesh = new THREE.Points(pGeo, pMat);
            this.rootGroup.add(this.photonsMesh);
        }

        buildBurstRings() {
            const THREE = this.THREE;
            this.burstRings = [];

            for (let i = 0; i < 3; i++) {
                const ringGeo = new THREE.RingGeometry(0.1, 0.22, 32);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: this.currentConfig.primary,
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide
                });
                const ringMesh = new THREE.Mesh(ringGeo, ringMat);
                ringMesh.rotation.x = -Math.PI / 2;
                ringMesh.position.set(0, 0.18, 0);
                ringMesh.visible = false;
                this.rootGroup.add(ringMesh);

                this.burstRings.push({
                    mesh: ringMesh,
                    material: ringMat,
                    radius: 0.5,
                    opacity: 0,
                    active: false
                });
            }
        }

        buildCO2Tokens() {
            this.co2Tokens = [];
        }

        /**
         * 8. 3D Anchor Definitions & STRICT Single-Banner Display
         */
        initAnchors() {
            const THREE = this.THREE;
            this.anchorElements = new Map();
            this.anchorsLayer = null;
            this._tempAnchorWorldVec = new THREE.Vector3();
            this._lastAnchorsBroadcastTime = 0;

            this.anchorDefinitions = [
                {
                    id: 'strom',
                    name: 'Haushaltsstrom',
                    branch: 'strom',
                    focus: 'strom',
                    localPosition: new THREE.Vector3(2.85, 1.45, 2.7),
                    badge: '💡 Haushaltsstrom & Zähler',
                    headline: 'Wir bieten 100 % Ökostromtarife für Ihren Hausstrom an',
                    benefit: 'Bis zu 380 € pro Jahr gegenüber der Grundversorgung sparen mit voller Preisgarantie und ok-power Siegel!',
                    ctaText: 'Hausstrom berechnen →',
                    colorClass: 'alpha-anchor-strom anchor-strom',
                    accentColor: '#00E676'
                },
                {
                    id: 'waerme',
                    name: 'Wärmepumpe',
                    branch: 'waerme',
                    focus: 'waerme',
                    localPosition: new THREE.Vector3(4.8, 1.45, 1.2),
                    badge: '♨️ Wärmestrom § 14a EnWG',
                    headline: 'Wir bieten günstige Stromtarife für Wärmepumpen an',
                    benefit: 'Bis zu 25 % reduzierte Netzentgelte nach § 14a EnWG – sparen Sie hunderte Euro bei Ihren Heizkosten!',
                    ctaText: 'Wärmetarif berechnen →',
                    colorClass: 'alpha-anchor-waerme anchor-waerme',
                    accentColor: '#FF7A00'
                },
                {
                    id: 'wallbox',
                    name: 'Wallbox & E-Mobilität',
                    branch: 'strom',
                    focus: 'wallbox',
                    localPosition: new THREE.Vector3(-3.6, 1.65, 1.8),
                    badge: '🔌 Wallbox- & Autostrom',
                    headline: 'Wir bieten spezielle Stromtarife für Wallboxen an',
                    benefit: 'Laden Sie Ihr E-Auto zuhause günstig mit 100 % zertifiziertem Ökostrom zu besten Konditionen!',
                    ctaText: 'Autostrom berechnen →',
                    colorClass: 'alpha-anchor-wallbox anchor-wallbox',
                    accentColor: '#00D2FF'
                },
                {
                    id: 'solar',
                    name: 'Solar & Heimspeicher',
                    branch: 'strom',
                    focus: 'solar',
                    localPosition: new THREE.Vector3(-0.2, 5.85, 1.4),
                    badge: '☀️ Solar & Heimspeicher',
                    headline: 'Wir bieten flexible Stromtarife für Solaranlagen & Speicher an',
                    benefit: 'Smarte Reststrombelieferung und maximale Unabhängigkeit für Ihr Solar-Zuhause!',
                    ctaText: 'PV-Tarif ansehen →',
                    colorClass: 'alpha-anchor-solar anchor-solar',
                    accentColor: '#FFD700'
                }
            ];
        }

        createAnchorBannersDOM() {
            if (typeof document === 'undefined' || !this.container) return;

            const existingLayer = this.container.querySelector('.alpha-3d-anchors-layer');
            if (existingLayer) {
                existingLayer.remove();
            }

            if (window.getComputedStyle(this.container).position === 'static') {
                this.container.style.position = 'relative';
            }

            const layer = document.createElement('div');
            layer.className = 'alpha-3d-anchors-layer';
            layer.setAttribute('aria-label', '3D Tarif-Highlights über Smart Home Komponenten');

            this.anchorDefinitions.forEach(def => {
                const item = document.createElement('div');
                item.className = `alpha-anchor-item ${def.colorClass}`;
                item.id = `alpha-anchor-${def.id}`;
                item.setAttribute('data-anchor-id', def.id);
                item.style.transform = 'translate3d(-9999px, -9999px, 0)';

                item.innerHTML = `
                    <div class="alpha-anchor-pin" title="${def.name}">
                        <span class="alpha-anchor-pulse" aria-hidden="true"></span>
                        <span class="alpha-anchor-dot" aria-hidden="true"></span>
                        <span class="alpha-anchor-line" aria-hidden="true"></span>
                    </div>
                    <div class="alpha-anchor-card" role="region" aria-label="${def.headline}">
                        <div class="alpha-anchor-card-body">
                            <div class="alpha-anchor-header">
                                <span class="alpha-anchor-badge">${def.badge}</span>
                                <button type="button" class="alpha-anchor-close-btn" aria-label="Details schließen">✕</button>
                            </div>
                            <h4 class="alpha-anchor-headline">${def.headline}</h4>
                            <p class="alpha-anchor-benefit">${def.benefit}</p>
                            <div class="alpha-anchor-action">
                                <a href="#rechner" class="alpha-anchor-btn btn-rechner-sync" data-branch="${def.branch}" data-anchor-focus="${def.focus}">
                                    <span>${def.ctaText}</span>
                                </a>
                            </div>
                        </div>
                    </div>
                `;

                item.addEventListener('click', (e) => {
                    const isCta = e.target.closest('.btn-rechner-sync');
                    const isClose = e.target.closest('.alpha-anchor-close-btn');

                    if (isClose) {
                        e.stopPropagation();
                        this.setStage('overview');
                        return;
                    }

                    if (!isCta) {
                        this.setStage(def.focus);
                        this.pulse();
                    }
                });

                layer.appendChild(item);
                this.anchorElements.set(def.id, item);
            });

            this.container.appendChild(layer);
            this.anchorsLayer = layer;
        }

        /**
         * STRICT Single-Banner Display Logic:
         * When stage is active, ONLY that single banner card is displayed!
         * When in 'overview': NO card is open (zero overlap).
         */
        highlightAnchor(anchorId) {
            this.activeAnchorId = anchorId;
            if (!this.anchorElements) return;

            this.anchorElements.forEach((el, id) => {
                const isActive = (id === anchorId);
                el.classList.toggle('is-active', isActive);
                el.style.opacity = isActive ? '1' : (anchorId ? '0' : '0.85');
                el.style.pointerEvents = isActive ? 'auto' : (anchorId ? 'none' : 'auto');
                el.style.visibility = (isActive || !anchorId) ? 'visible' : 'hidden';
                el.style.zIndex = isActive ? '80' : '20';

                const card = el.querySelector('.alpha-anchor-card');
                const line = el.querySelector('.alpha-anchor-line');
                if (card) {
                    card.style.opacity = isActive ? '1' : '0';
                    card.style.pointerEvents = isActive ? 'auto' : 'none';
                    card.style.visibility = isActive ? 'visible' : 'hidden';
                    card.style.transform = isActive ? 'translateX(-50%) translateY(0) scale(1)' : 'translateX(-50%) translateY(8px) scale(0.92)';
                }
                if (line) {
                    line.style.opacity = isActive ? '1' : '0';
                }
            });
        }

        /**
         * 9. Scroll-Driven Scrollytelling Engine
         */
        setupScrollTracker() {
            if (typeof window === 'undefined') return;

            // Find parent pinned section
            const section = (this.container && (this.container.closest('.scrolly-energy-section') || this.container.closest('.versorger-flow-section')))
                || document.getElementById('scrolly-flow-section')
                || document.getElementById('flow-visualizer');

            if (section) {
                section.classList.add('scrolly-pinned');
            }

            // Scroll listener
            this._boundOnScroll = () => {
                if (this.disposed) return;
                const sec = section || (this.container && this.container.parentElement);
                if (!sec) return;

                const rect = sec.getBoundingClientRect();
                const totalScrollable = sec.offsetHeight - window.innerHeight;
                if (totalScrollable <= 50) return;

                const scrolled = -rect.top;
                const progress = Math.max(0.0, Math.min(1.0, scrolled / totalScrollable));
                this.setScrollProgress(progress);
            };

            window.addEventListener('scroll', this._boundOnScroll, { passive: true });

            // Wheel event over container for progressive scrubbing
            this._boundOnWheel = (e) => {
                // If section is pinned, wheel will naturally scroll the window
            };

            // Wire DOM Stepper Pills (if present in HTML)
            const stepperPills = document.querySelectorAll('[data-scrolly-step]');
            stepperPills.forEach(pill => {
                pill.addEventListener('click', (e) => {
                    e.preventDefault();
                    const targetStep = pill.getAttribute('data-scrolly-step');
                    if (targetStep) {
                        this.setStage(targetStep);
                    }
                });
            });
        }

        /**
         * Set Scroll Progress (0.0 to 1.0) and Map to Stages
         */
        setScrollProgress(progress) {
            this.scrollProgress = Math.max(0.0, Math.min(1.0, progress));

            let stage = 'overview';
            if (this.scrollProgress < 0.15) {
                stage = 'overview';
            } else if (this.scrollProgress < 0.35) {
                stage = 'strom';
            } else if (this.scrollProgress < 0.55) {
                stage = 'waerme';
            } else if (this.scrollProgress < 0.75) {
                stage = 'wallbox';
            } else if (this.scrollProgress < 0.92) {
                stage = 'solar';
            } else {
                stage = 'overview';
            }

            this.applyStage(stage);
            this.updateStepperUI(this.scrollProgress, stage);
            return stage;
        }

        /**
         * Set Stage Directly ('overview' | 'strom' | 'waerme' | 'wallbox' | 'solar')
         */
        setStage(stageName) {
            const valid = ['overview', 'strom', 'waerme', 'wallbox', 'solar'];
            const targetStage = valid.includes(stageName) ? stageName : 'overview';
            this.currentStage = targetStage;
            this.applyStage(targetStage);
            this.updateStepperUI(null, targetStage);
            return targetStage;
        }

        applyStage(stageName) {
            this.currentStage = stageName;
            this.currentFocus = stageName;

            const preset = this.focusPresets[stageName] || this.focusPresets.overview;
            if (this.targetCameraPos && this.targetLookAt) {
                this.targetCameraPos.set(preset.position.x, preset.position.y, preset.position.z);
                this.targetLookAt.set(preset.lookAt.x, preset.lookAt.y, preset.lookAt.z);
            }

            // Strictly highlight ONLY the active stage banner
            if (stageName === 'overview') {
                this.highlightAnchor(null);
            } else {
                this.highlightAnchor(stageName);
            }

            // Sync HUD buttons active state
            if (typeof document !== 'undefined') {
                const hudTabs = document.querySelectorAll('[data-focus]');
                hudTabs.forEach(tab => {
                    const f = tab.getAttribute('data-focus');
                    tab.classList.toggle('active', f === stageName);
                });
            }
        }

        updateStepperUI(progress, currentStage) {
            if (typeof document === 'undefined') return;

            const progressBar = document.getElementById('scrolly-progress-bar');
            if (progressBar && progress !== null) {
                progressBar.style.width = `${(progress * 100).toFixed(1)}%`;
            }

            const stepBadge = document.getElementById('scrolly-step-badge');
            const stepLabel = document.getElementById('scrolly-step-label');

            const stageInfo = {
                strom: { step: 'Station 1 von 4', title: 'Schritt 1 von 4: Haushaltsstrom & Zähler' },
                waerme: { step: 'Station 2 von 4', title: 'Schritt 2 von 4: Wärmepumpe (§ 14a EnWG)' },
                wallbox: { step: 'Station 3 von 4', title: 'Schritt 3 von 4: Wallbox & E-Mobilität' },
                solar: { step: 'Station 4 von 4', title: 'Schritt 4 von 4: Solaranlage & Speicher' },
                overview: { step: 'Gesamtansicht', title: 'Alpha Smart Home Gesamtsystem' }
            };

            const info = stageInfo[currentStage] || stageInfo.overview;
            if (stepBadge) stepBadge.textContent = info.step;
            if (stepLabel) stepLabel.textContent = info.title;

            // Sync stepper pills active state
            const pills = document.querySelectorAll('[data-scrolly-step]');
            pills.forEach(pill => {
                const step = pill.getAttribute('data-scrolly-step');
                const isActive = (step === currentStage);
                pill.classList.toggle('active', isActive);
                pill.setAttribute('aria-selected', isActive ? 'true' : 'false');
            });
        }

        setFocus(focusName) {
            return this.setStage(focusName);
        }

        /**
         * Render Loop Update
         */
        update(delta, elapsed, pointer) {
            if (this.disposed || !this.THREE) return;

            const safeDelta = Math.min(delta, 0.1);
            const totalSpeed = this.speed * this.consumptionSpeedMultiplier * this.burstVelocityBoost;

            // 1. Smooth Camera Interpolation (Damping Lerp)
            if (this.targetCameraPos && this.currentCameraPos && this.camera) {
                const lerpFactor = Math.min(safeDelta * 3.8, 1.0);
                this.currentCameraPos.lerp(this.targetCameraPos, lerpFactor);
                this.currentLookAt.lerp(this.targetLookAt, lerpFactor);

                this.camera.position.copy(this.currentCameraPos);
                this.camera.lookAt(this.currentLookAt);
            }

            // 2. Parallax Root Rotation with Drag & Pointer Inertia
            if (pointer) {
                this.targetRotationY = (pointer.x * 0.12) + (this.isDragging ? this.targetRotationY : 0);
            }
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * Math.min(safeDelta * 4.0, 1.0);
            this.currentRotationX += (this.targetRotationX - this.currentRotationX) * Math.min(safeDelta * 4.0, 1.0);

            if (this.rootGroup) {
                this.rootGroup.rotation.y = this.currentRotationY;
                this.rootGroup.rotation.x = this.currentRotationX;
            }

            // 3. Actively Spinning Heat Pump Fan
            if (this.heatPumpFan) {
                const fanSpeed = (this.currentMode === 'waerme' ? 8.5 : 4.5) * totalSpeed;
                this.heatPumpFan.rotation.z += safeDelta * fanSpeed;
            }

            // 4. Smart Meter Gateway Blinking Telemetry LED
            if (this.smartMeterLed) {
                const blink = (Math.sin(elapsed * 5.0) > 0.25) ? 1.0 : 0.15;
                this.meterLedMat.color.setRGB(0, blink * 0.95, 0);
            }

            // 5. Battery State-of-Charge LED Wave
            if (this.batteryLeds && this.batteryLeds.length > 0) {
                this.batteryLeds.forEach((bar, idx) => {
                    const wave = Math.sin(elapsed * 2.5 - idx * 0.65);
                    bar.material.opacity = (wave > -0.2) ? 1.0 : 0.25;
                });
            }

            // 6. Traveling Photons Animation along Splines
            if (this.photonsMesh && this.photons.length > 0) {
                const positions = this.photonsMesh.geometry.attributes.position.array;

                for (let i = 0; i < this.photons.length; i++) {
                    const p = this.photons[i];
                    p.progress += safeDelta * p.speed * totalSpeed;
                    if (p.progress > 1.0) p.progress -= 1.0;

                    const curve = this.curves[p.curveIdx];
                    const pos = curve.getPointAt(p.progress);

                    positions[i * 3] = pos.x;
                    positions[i * 3 + 1] = pos.y;
                    positions[i * 3 + 2] = pos.z;
                }

                this.photonsMesh.geometry.attributes.position.needsUpdate = true;
            }

            // 7. Shockwave Burst Rings Decay
            if (this.burstTime > 0) {
                this.burstTime -= safeDelta;
                this.burstVelocityBoost = 1.0 + (this.burstTime / 1.6) * 1.5;

                this.burstRings.forEach((r, idx) => {
                    if (r.active) {
                        r.radius += safeDelta * (6.5 + idx * 2.2);
                        r.opacity = Math.max(0, this.burstTime / 1.6);
                        r.mesh.scale.set(r.radius, r.radius, r.radius);
                        r.material.opacity = r.opacity;
                        if (r.opacity <= 0.01) {
                            r.active = false;
                            r.mesh.visible = false;
                        }
                    }
                });
            } else {
                this.burstVelocityBoost = 1.0;
            }

            // 8. 3D-to-2D Anchor Screen Coordinates Tracking
            this.updateAnchors();
        }

        updateAnchors() {
            if (!this.container || !this.camera || !this.anchorElements || this.anchorElements.size === 0) return;

            const width = this.container.clientWidth;
            const height = this.container.clientHeight;
            if (width <= 0 || height <= 0) return;

            const THREE = this.THREE;
            const worldVec = this._tempAnchorWorldVec || new THREE.Vector3();
            const isMobile = width <= 640;
            const activeAnchorsData = [];

            this.anchorDefinitions.forEach(def => {
                const el = this.anchorElements.get(def.id);
                if (!el) return;

                // 1. Calculate world position: def.localPosition transformed by rootGroup
                worldVec.copy(def.localPosition);
                if (this.rootGroup) {
                    worldVec.applyMatrix4(this.rootGroup.matrixWorld);
                }

                // 2. Project to normalized device coordinates [-1, 1]
                worldVec.project(this.camera);

                // 3. Frustum clipping: behind camera
                const isBehind = worldVec.z > 1.0;
                if (isBehind) {
                    el.style.opacity = '0';
                    el.style.pointerEvents = 'none';
                    return;
                }

                // 4. Convert NDC to container screen coordinates
                const screenX = (worldVec.x * 0.5 + 0.5) * width;
                const screenY = (-(worldVec.y * 0.5) + 0.5) * height;

                // 5. Inversion logic: if anchor is near top of viewport, flip card downward
                const isInverted = screenY < 210;
                el.classList.toggle('is-inverted', isInverted);
                el.classList.toggle('is-mobile', isMobile);

                // 6. Safe edge clamping
                const safeMarginX = isMobile ? 14 : 28;
                const safeMarginY = 16;
                const clampedX = Math.max(safeMarginX, Math.min(width - safeMarginX, screenX));
                const clampedY = Math.max(safeMarginY, Math.min(height - safeMarginY, screenY));

                // 7. Apply 3D translate
                el.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;

                // STRICT Single-Banner Display:
                // Only the active anchor is visible; if none active, all are subtle pin dots
                if (this.activeAnchorId) {
                    const isActive = (def.id === this.activeAnchorId);
                    el.classList.toggle('is-active', isActive);
                    el.style.opacity = isActive ? '1' : '0';
                    el.style.pointerEvents = isActive ? 'auto' : 'none';
                    el.style.visibility = isActive ? 'visible' : 'hidden';
                } else {
                    // Overview mode: Show compact pin dots with subtle opacity, cards hidden
                    el.classList.remove('is-active');
                    el.style.opacity = '0.85';
                    el.style.pointerEvents = 'auto';
                    el.style.visibility = 'visible';
                }

                activeAnchorsData.push({
                    id: def.id,
                    branch: def.branch,
                    focus: def.focus,
                    x: clampedX,
                    y: clampedY,
                    isInverted: isInverted,
                    isActive: (def.id === this.activeAnchorId)
                });
            });

            // Throttle custom event broadcast to ~15fps (every 66ms)
            const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            if (now - this._lastAnchorsBroadcastTime > 66) {
                this._lastAnchorsBroadcastTime = now;
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('alphathree:anchors-update', {
                        detail: {
                            anchors: activeAnchorsData,
                            activeAnchorId: this.activeAnchorId,
                            stage: this.currentStage,
                            scrollProgress: this.scrollProgress
                        }
                    }));
                }
            }
        }

        getAnchors() {
            return this.anchorDefinitions ? [...this.anchorDefinitions] : [];
        }

        /**
         * Real-World Cost Savings & Tariff Synchronization
         */
        setConsumption(kwh, mode = null) {
            this.consumption = Math.max(500, Math.min(10000, parseInt(kwh, 10) || 2500));
            if (mode) {
                this.setMode(mode);
            }

            const kwhRatio = (this.consumption - 500) / 4500;
            this.consumptionSpeedMultiplier = 0.7 + kwhRatio * 0.9;

            const basePriceYear = 11.90 * 12;
            const alphaWorkingPrice = 0.2785;
            const grundversorgerWorkingPrice = 0.4120;
            const grundversorgerBase = 12.50 * 12;

            const alphaCost = Math.round(basePriceYear + (this.consumption * alphaWorkingPrice));
            const grundversorgerCost = Math.round(grundversorgerBase + (this.consumption * grundversorgerWorkingPrice));
            const savingsYear = Math.max(60, grundversorgerCost - alphaCost);
            const savingsMonth = Math.round(savingsYear / 12);
            const co2SavedKg = Math.round(this.consumption * 0.38);

            this.savingsData = {
                kwh: this.consumption,
                mode: this.currentMode,
                alphaCostYear: alphaCost,
                grundversorgerYear: grundversorgerCost,
                savingsYear: savingsYear,
                savingsMonth: savingsMonth,
                co2SavedKg: co2SavedKg
            };

            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('alphathree:savings-update', {
                    detail: this.savingsData
                }));
            }

            return this.savingsData;
        }

        updateConsumptionScaling() {
            this.setConsumption(this.consumption, this.currentMode);
        }

        setMode(modeName) {
            const norm = this.normalizeMode(modeName);
            if (this.currentMode === norm && this.currentConfig) return this.currentMode;

            this.currentMode = norm;
            this.currentConfig = this.modes[this.currentMode];
            this.applyModeStyles();
            return this.currentMode;
        }

        applyModeStyles() {
            if (!this.currentConfig || !this.THREE) return;

            const cfg = this.currentConfig;
            const primaryColor = new this.THREE.Color(cfg.primary);

            if (this.accentLight) {
                this.accentLight.color.copy(primaryColor);
                this.accentLight.intensity = cfg.lightIntensity;
            }

            if (this.curveMeshes) {
                this.curveMeshes.forEach(m => {
                    if (m && m.material) m.material.color.copy(primaryColor);
                });
            }

            if (this.photonsMesh && this.photonsMesh.geometry) {
                const colors = this.photonsMesh.geometry.attributes.color.array;
                for (let i = 0; i < this.photons.length; i++) {
                    colors[i * 3] = primaryColor.r;
                    colors[i * 3 + 1] = primaryColor.g;
                    colors[i * 3 + 2] = primaryColor.b;
                }
                this.photonsMesh.geometry.attributes.color.needsUpdate = true;
            }

            if (this.heatPumpLedMat) this.heatPumpLedMat.color.copy(primaryColor);
            if (this.wallboxStatusMat) this.wallboxStatusMat.color.copy(primaryColor);
            if (this.evPortMat) this.evPortMat.color.copy(primaryColor);

            if (this.batteryLeds) {
                this.batteryLeds.forEach(bar => {
                    if (bar && bar.material) bar.material.color.copy(primaryColor);
                });
            }
        }

        pulse() {
            this.burstTime = 1.6;
            this.burstVelocityBoost = 2.5;

            this.burstRings.forEach(r => {
                r.active = true;
                r.radius = 0.5;
                r.opacity = 1.0;
                r.mesh.visible = true;
            });
        }

        pulseBurst() {
            this.pulse();
        }

        setupLocalPointerEvents() {
            if (!this.container || !this.options.interactive) return;

            this.container.addEventListener('mousedown', (e) => {
                this.isDragging = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            });

            window.addEventListener('mouseup', () => {
                this.isDragging = false;
            });

            this.container.addEventListener('mousemove', (e) => {
                if (!this.isDragging) return;
                const deltaX = e.clientX - this.previousMousePosition.x;
                const deltaY = e.clientY - this.previousMousePosition.y;

                this.targetRotationY += deltaX * 0.005;
                this.targetRotationX = Math.max(-0.25, Math.min(0.35, this.targetRotationX + deltaY * 0.003));

                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            });
        }

        /**
         * Comprehensive GPU Resource Teardown & Disposal
         */
        dispose() {
            super.dispose();

            // Unbind window scroll
            if (this._boundOnScroll && typeof window !== 'undefined') {
                window.removeEventListener('scroll', this._boundOnScroll);
                this._boundOnScroll = null;
            }

            // Clear anchors DOM layer
            if (this.anchorsLayer && this.anchorsLayer.parentNode) {
                this.anchorsLayer.parentNode.removeChild(this.anchorsLayer);
            }
            if (this.anchorElements) {
                this.anchorElements.clear();
            }
            this.anchorsLayer = null;

            // Clear procedural and glow textures
            for (const key of Object.keys(this.glowTextures || {})) {
                if (this.glowTextures[key] && typeof this.glowTextures[key].dispose === 'function') {
                    this.glowTextures[key].dispose();
                }
            }
            this.glowTextures = {};

            for (const key of Object.keys(this.proceduralTextures || {})) {
                if (this.proceduralTextures[key] && typeof this.proceduralTextures[key].dispose === 'function') {
                    this.proceduralTextures[key].dispose();
                }
            }
            this.proceduralTextures = {};

            // Traverse and clean hierarchy
            if (this.rootGroup && this.scene) {
                this.disposeNode(this.rootGroup);
                this.scene.remove(this.rootGroup);
                this.rootGroup = null;
            }

            this.houseGroup = null;
            this.solarArrayGroup = null;
            this.heatPumpGroup = null;
            this.heatPumpFan = null;
            this.wallboxGroup = null;
            this.evGroup = null;
            this.batteryGroup = null;
            this.environmentGroup = null;
            this.flowTracksGroup = null;
            this.photonsMesh = null;
            this.curves = [];
            this.photons = [];
            this.burstRings = [];
            this.co2Tokens = [];
            this.bollardLights = [];
        }

        disposeNode(node) {
            if (!node) return;

            for (let i = node.children.length - 1; i >= 0; i--) {
                this.disposeNode(node.children[i]);
                node.remove(node.children[i]);
            }

            if (node.geometry && typeof node.geometry.dispose === 'function') {
                node.geometry.dispose();
            }

            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach(m => this.disposeMaterial(m));
                } else {
                    this.disposeMaterial(node.material);
                }
            }
        }

        disposeMaterial(mat) {
            if (!mat) return;
            for (const prop of Object.keys(mat)) {
                const val = mat[prop];
                if (val && typeof val === 'object' && 'minFilter' in val && typeof val.dispose === 'function') {
                    val.dispose();
                }
            }
            if (typeof mat.dispose === 'function') {
                mat.dispose();
            }
        }
    }

    return VersorgerFlowScene;
}));

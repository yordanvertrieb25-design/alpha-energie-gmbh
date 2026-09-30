/**
 * Alpha Energie GmbH - 3D Smart Home & Cost Savings Visualization ("Alpha Spar- & Energie-Simulator")
 * Premium architectural 3D smart home diorama for German energy utility customers (E.ON & Grünwelt style):
 * - Detailed modern architectural family home with clean facade, warm wood accents, and pitched dark-slate roof.
 * - Monocrystalline Solar Panel Array (Photovoltaik) with realistic aluminum frames and glossy specular reflections.
 * - Outdoor Heat Pump Unit (Wärmepumpe) with horizontal acoustic grille slats and an active rotating multi-blade fan.
 * - Wallbox EV Charging Station with illuminated status halo and connected Electric Vehicle (EV).
 * - Digital Smart Meter Gateway with blinking status LED and Lithium Battery Storage (Hausakku).
 * - Manicured garden lawn, paved stone terrace walkway, and soft contact ambient occlusion ground shadow.
 * - Dynamic energy flow splines with luminous photons (Solar -> Battery, Heat Pump -> Heating, Grid -> Smart Meter).
 * - Interactive Hotspot Focus (.setFocus('strom'|'waerme'|'wallbox'|'solar'|'overview')) with smooth camera lerping.
 * - Real-time cost savings calculation (.setConsumption(kwh, branch)) emitting 'alphathree:savings-update'.
 * - Dynamic multi-energy modes (100% Ökostrom ok-power, §14a Wärmestrom, Ökogas CO2-kompensiert).
 * - Interactive shockwave pulse (.pulse() / .pulseBurst()).
 *
 * @license Proprietary - Alpha Energie GmbH 2026
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['../three-manager'], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory(require('../three-manager'));
    } else {
        const ManagerModule = root.AlphaThreeManager || {};
        const SceneClass = factory(ManagerModule);
        if (root.AlphaThree && root.AlphaThree.registerScene) {
            root.AlphaThree.registerScene('versorger-flow', SceneClass);
        }
        root.AlphaVersorgerFlowScene = SceneClass;
    }
}(typeof self !== 'undefined' ? self : this, function (AlphaThreeManager) {
    'use strict';

    const BaseClass = (AlphaThreeManager && AlphaThreeManager.ThreeSceneBase) ? AlphaThreeManager.ThreeSceneBase : class {};

    class VersorgerFlowScene extends BaseClass {
        constructor(container, options = {}) {
            super(container, options);

            this.speed = this.options.speed !== undefined ? this.options.speed : 1.0;
            this.consumption = this.options.consumption !== undefined ? parseFloat(this.options.consumption) : 3500;
            this.rawMode = this.options.mode || 'strom';

            // Modes & Color Palettes
            this.modes = {
                strom: {
                    name: 'strom',
                    label: '100% Ökostrom (ok-power)',
                    primary: 0x00E676,       // Emerald Eco Green
                    secondary: 0x00D2FF,     // Electric Cyan
                    accent: 0x38BDF8,        // Transmission Sky
                    core: 0x00E676,
                    light: 0x00E676,
                    lightIntensity: 2.2,
                    thermalGlow: false,
                    gasTokens: false,
                    haloInner: 'rgba(255, 255, 255, 1)',
                    haloOuter: 'rgba(0, 230, 118, 0)'
                },
                waerme: {
                    name: 'waerme',
                    label: 'Wärmestrom (§14a EnWG Flexibel)',
                    primary: 0xFF7A00,       // Alpha Warm Amber
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

            // Camera Focus Destinations
            this.focusPresets = {
                overview: {
                    position: { x: 13.5, y: 9.5, z: 15.5 },
                    lookAt: { x: 0.0, y: 1.8, z: 0.0 }
                },
                solar: {
                    position: { x: 4.8, y: 7.2, z: 9.8 },
                    lookAt: { x: -0.2, y: 4.5, z: 0.5 }
                },
                waerme: {
                    position: { x: 8.8, y: 3.6, z: 7.8 },
                    lookAt: { x: 4.6, y: 1.2, z: 0.8 }
                },
                wallbox: {
                    position: { x: -9.2, y: 3.6, z: 7.8 },
                    lookAt: { x: -4.8, y: 1.3, z: 1.6 }
                },
                strom: {
                    position: { x: 6.2, y: 4.8, z: 11.8 },
                    lookAt: { x: 1.2, y: 1.5, z: 2.0 }
                }
            };

            this.currentFocus = 'overview';
            this.targetCameraPos = null;
            this.currentCameraPos = null;
            this.targetLookAt = null;
            this.currentLookAt = null;

            // 3D Scene Groups & Dynamic Meshes
            this.rootGroup = null;
            this.houseGroup = null;
            this.solarArrayGroup = null;
            this.heatPumpGroup = null;
            this.heatPumpFan = null;
            this.wallboxGroup = null;
            this.wallboxStatusRing = null;
            this.evGroup = null;
            this.evStatusRing = null;
            this.smartMeterLed = null;
            this.batteryGroup = null;
            this.batteryLeds = [];
            this.environmentGroup = null;
            this.flowTracksGroup = null;
            this.photonsMesh = null;
            this.windowMeshes = [];
            this.windowLight = null;
            this.sunLight = null;
            this.hemiLight = null;
            this.accentLight = null;

            // Flow trajectories (Splines) & Traveling Photons
            this.curves = [];
            this.curveMeshes = [];
            this.photons = [];
            this.photonCount = 140;

            // Procedural Canvas Textures cache
            this.glowTextures = {};

            // 3D Callout Anchors & Floating Banners
            this.anchorDefinitions = [];
            this.anchorElements = new Map();
            this.anchorsLayer = null;
            this.activeAnchorId = null;
            this._tempAnchorWorldVec = null;
            this._lastAnchorsBroadcastTime = 0;

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

            // Lighting setup: Bright daylight & golden hour architectural studio
            this.setupLighting();

            // 1. Environment: Manicured lawn, paved walkways, contact shadow
            this.buildEnvironment();

            // 2. Modern Architectural Smart Home: Facades, wood accents, pitched slate roof, glowing windows
            this.buildSmartHome();

            // 3. High-Tech Rooftop Solar Array (Photovoltaik)
            this.buildSolarArray();

            // 4. Outdoor Heat Pump Unit (Wärmepumpe) with active rotating fan
            this.buildHeatPump();

            // 5. Wallbox EV Charging Station & Electric Vehicle
            this.buildWallboxAndEV();

            // 6. Digital Smart Meter Gateway & Battery Storage (Hausakku)
            this.buildSmartMeterAndBattery();

            // 7. Energy Flow Trajectories (Splines) & Luminous Photons
            this.buildFlowTrajectories();
            this.buildTravelingPhotons();

            // 8. Interactive Shockwave Rings & CO2 Tokens
            this.buildBurstRings();
            this.buildCO2Tokens();

            // 9. 3D-to-2D Anchor Tracking & Floating Callout Banners
            this.initAnchors();
            this.createAnchorBannersDOM();

            // Initial mode styling
            this.applyModeStyles();

            // Initial cost savings event broadcast
            this.setConsumption(this.consumption, this.currentMode);

            // Setup pointer drag & hover interaction
            this.setupLocalPointerEvents();
        }

        setupLighting() {
            const THREE = this.THREE;

            // 1. Directional Sunlight casting crisp architectural highlights
            this.sunLight = new THREE.DirectionalLight(0xFFFBEB, 1.85);
            this.sunLight.position.set(16, 22, 14);
            this.scene.add(this.sunLight);

            // 2. Sky & Ground Hemisphere Light for natural ambient fill
            this.hemiLight = new THREE.HemisphereLight(0xE0F2FE, 0x334155, 1.15);
            this.hemiLight.position.set(0, 30, 0);
            this.scene.add(this.hemiLight);

            // 3. Warm Interior Point Light for cozy home window illumination
            this.windowLight = new THREE.PointLight(0xFFEDD5, 1.9, 14);
            this.windowLight.position.set(0, 1.8, 0.8);
            this.rootGroup.add(this.windowLight);

            // 4. Mode Accent Light highlighting smart infrastructure
            this.accentLight = new THREE.PointLight(this.currentConfig.light, 1.6, 12);
            this.accentLight.position.set(4.6, 1.5, 1.2);
            this.rootGroup.add(this.accentLight);
        }

        createProceduralGlowTexture(size = 64, inner = 'rgba(255, 255, 255, 1)', mid = 'rgba(0, 230, 118, 0.8)', outer = 'rgba(0, 230, 118, 0)') {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            if (!ctx) return null;

            const center = size / 2;
            const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
            grad.addColorStop(0, inner);
            grad.addColorStop(0.25, mid);
            grad.addColorStop(0.65, outer.replace(/0\)$/, '0.2)'));
            grad.addColorStop(1, outer);

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);

            const tex = new this.THREE.CanvasTexture(canvas);
            tex.needsUpdate = true;
            return tex;
        }

        getOrCreateTexture(key, inner, mid, outer) {
            if (!this.glowTextures[key]) {
                this.glowTextures[key] = this.createProceduralGlowTexture(64, inner, mid, outer);
            }
            return this.glowTextures[key];
        }

        /**
         * 1. Manicured lawn, paved walkways, and soft ground contact shadow
         */
        buildEnvironment() {
            const THREE = this.THREE;
            this.environmentGroup = new THREE.Group();
            this.rootGroup.add(this.environmentGroup);

            // A. Manicured Green Garden Lawn Base
            const lawnGeo = new THREE.BoxGeometry(19.0, 0.35, 15.0);
            const lawnMat = new THREE.MeshStandardMaterial({
                color: 0x15803D,       // Rich green lawn (#15803d)
                roughness: 0.92,
                metalness: 0.05
            });
            const lawnMesh = new THREE.Mesh(lawnGeo, lawnMat);
            lawnMesh.position.set(0, -0.175, 0.5);
            this.environmentGroup.add(lawnMesh);

            // B. Soft Circular Ambient Occlusion Contact Shadow Plane
            const shadowCanvas = document.createElement('canvas');
            shadowCanvas.width = 128;
            shadowCanvas.height = 128;
            const ctx = shadowCanvas.getContext('2d');
            if (ctx) {
                const grad = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
                grad.addColorStop(0, 'rgba(15, 23, 42, 0.65)');
                grad.addColorStop(0.5, 'rgba(15, 23, 42, 0.25)');
                grad.addColorStop(1, 'rgba(15, 23, 42, 0)');
                ctx.fillStyle = grad;
                ctx.fillRect(0, 0, 128, 128);
            }
            const shadowTex = new THREE.CanvasTexture(shadowCanvas);
            const shadowGeo = new THREE.PlaneGeometry(16.5, 12.5);
            const shadowMat = new THREE.MeshBasicMaterial({
                map: shadowTex,
                transparent: true,
                depthWrite: false
            });
            const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
            shadowPlane.rotation.x = -Math.PI / 2;
            shadowPlane.position.set(0, 0.015, 0.5);
            this.environmentGroup.add(shadowPlane);

            // C. Paved Terrace Walkway (Stone slabs #cbd5e1)
            const terraceGeo = new THREE.BoxGeometry(8.2, 0.05, 3.8);
            const terraceMat = new THREE.MeshStandardMaterial({
                color: 0xCBD5E1,
                roughness: 0.75,
                metalness: 0.1
            });
            const terraceMesh = new THREE.Mesh(terraceGeo, terraceMat);
            terraceMesh.position.set(0.2, 0.03, 3.6);
            this.environmentGroup.add(terraceMesh);

            // D. Paved Driveway for EV & Carport
            const drivewayGeo = new THREE.BoxGeometry(4.4, 0.05, 7.8);
            const drivewayMat = new THREE.MeshStandardMaterial({
                color: 0x94A3B8,
                roughness: 0.7,
                metalness: 0.15
            });
            const drivewayMesh = new THREE.Mesh(drivewayGeo, drivewayMat);
            drivewayMesh.position.set(-5.6, 0.03, 1.8);
            this.environmentGroup.add(drivewayMesh);

            // E. Minimalist Garden Planter / Hedges
            const hedgeGeo = new THREE.BoxGeometry(4.2, 0.45, 0.5);
            const hedgeMat = new THREE.MeshStandardMaterial({
                color: 0x166534,
                roughness: 0.95
            });
            const hedge = new THREE.Mesh(hedgeGeo, hedgeMat);
            hedge.position.set(2.2, 0.23, 5.3);
            this.environmentGroup.add(hedge);
        }

        /**
         * 2. Modern Architectural Smart Home (Ground & upper floor, pitched slate roof, wood trim, glowing windows)
         */
        buildSmartHome() {
            const THREE = this.THREE;
            this.houseGroup = new THREE.Group();
            this.rootGroup.add(this.houseGroup);

            // Materials
            const facadeWhiteMat = new THREE.MeshStandardMaterial({
                color: 0xF8FAFC,       // Clean facade white (#f8fafc)
                roughness: 0.85,
                metalness: 0.05
            });
            const facadeUpperMat = new THREE.MeshStandardMaterial({
                color: 0xF1F5F9,       // Soft off-white upper floor
                roughness: 0.85,
                metalness: 0.05
            });
            const woodTrimMat = new THREE.MeshStandardMaterial({
                color: 0xB45309,       // Warm wood trim accent (#b45309 / #d97706)
                roughness: 0.65,
                metalness: 0.1
            });
            const darkSlateRoofMat = new THREE.MeshStandardMaterial({
                color: 0x1E293B,       // Real pitched dark-slate roof (#1e293b / #334155)
                roughness: 0.45,
                metalness: 0.25
            });
            const windowFrameMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.5
            });

            // Glowing Interior Window Glass
            const windowGlassMat = new THREE.MeshStandardMaterial({
                color: 0xFEF08A,       // Warm cozy interior light (#fef08a / #f59e0b)
                emissive: 0xF59E0B,
                emissiveIntensity: 0.48,
                roughness: 0.15,
                metalness: 0.1,
                transparent: true,
                opacity: 0.88
            });
            this.windowGlassMat = windowGlassMat;

            // A. Plinth / Foundation Base
            const plinthGeo = new THREE.BoxGeometry(7.2, 0.2, 5.6);
            const plinthMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 });
            const plinth = new THREE.Mesh(plinthGeo, plinthMat);
            plinth.position.set(0, 0.1, 0);
            this.houseGroup.add(plinth);

            // B. Ground Floor Facade Block
            const gfGeo = new THREE.BoxGeometry(6.8, 2.5, 5.2);
            const gfMesh = new THREE.Mesh(gfGeo, facadeWhiteMat);
            gfMesh.position.set(0, 1.45, 0);
            this.houseGroup.add(gfMesh);

            // C. Ground Floor Warm Wood Trim Slat Wall
            const woodSlatGeo = new THREE.BoxGeometry(2.2, 2.52, 0.08);
            const woodSlat = new THREE.Mesh(woodSlatGeo, woodTrimMat);
            woodSlat.position.set(1.9, 1.45, 2.62);
            this.houseGroup.add(woodSlat);

            // D. Upper Floor Facade Block (Slight architectural cantilever)
            const ufGeo = new THREE.BoxGeometry(6.4, 2.3, 4.8);
            const ufMesh = new THREE.Mesh(ufGeo, facadeUpperMat);
            ufMesh.position.set(-0.2, 3.8, 0);
            this.houseGroup.add(ufMesh);

            // E. Upper Floor Vertical Wood Accents
            const woodSlatUpperGeo = new THREE.BoxGeometry(0.08, 2.32, 1.8);
            const woodSlatUpper = new THREE.Mesh(woodSlatUpperGeo, woodTrimMat);
            woodSlatUpper.position.set(2.98, 3.8, 0.9);
            this.houseGroup.add(woodSlatUpper);

            // F. Real Pitched Dark-Slate Roof with Eaves
            // Front roof slope
            const roofSlopeFrontGeo = new THREE.BoxGeometry(6.8, 0.16, 3.2);
            const roofSlopeFront = new THREE.Mesh(roofSlopeFrontGeo, darkSlateRoofMat);
            roofSlopeFront.position.set(-0.2, 5.5, 1.25);
            roofSlopeFront.rotation.x = 0.52; // ~30 deg pitch
            this.houseGroup.add(roofSlopeFront);

            // Rear roof slope
            const roofSlopeRearGeo = new THREE.BoxGeometry(6.8, 0.16, 3.2);
            const roofSlopeRear = new THREE.Mesh(roofSlopeRearGeo, darkSlateRoofMat);
            roofSlopeRear.position.set(-0.2, 5.5, -1.25);
            roofSlopeRear.rotation.x = -0.52;
            this.houseGroup.add(roofSlopeRear);

            // Ridge Cap along peak
            const ridgeGeo = new THREE.BoxGeometry(6.84, 0.12, 0.22);
            const ridgeMesh = new THREE.Mesh(ridgeGeo, new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4 }));
            ridgeMesh.position.set(-0.2, 6.25, 0);
            this.houseGroup.add(ridgeMesh);

            // Gable Triangular Infill Walls (Left & Right)
            const gableShape = new THREE.Shape();
            gableShape.moveTo(-2.4, 0);
            gableShape.lineTo(2.4, 0);
            gableShape.lineTo(0, 1.35);
            gableShape.closePath();

            const gableGeo = new THREE.ShapeGeometry(gableShape);
            const gableMeshLeft = new THREE.Mesh(gableGeo, facadeUpperMat);
            gableMeshLeft.position.set(-3.4, 4.95, 0);
            gableMeshLeft.rotation.y = -Math.PI / 2;
            this.houseGroup.add(gableMeshLeft);

            const gableMeshRight = new THREE.Mesh(gableGeo, facadeUpperMat);
            gableMeshRight.position.set(3.0, 4.95, 0);
            gableMeshRight.rotation.y = Math.PI / 2;
            this.houseGroup.add(gableMeshRight);

            // Chimney / Roof Vent
            const chimneyGeo = new THREE.BoxGeometry(0.48, 1.1, 0.48);
            const chimney = new THREE.Mesh(chimneyGeo, new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.6 }));
            chimney.position.set(1.4, 6.2, -0.6);
            this.houseGroup.add(chimney);

            // G. Large Modern Glass Windows with Warm Cozy Glow
            // 1. Ground floor living room panoramic slider window
            const win1Geo = new THREE.BoxGeometry(3.0, 1.9, 0.08);
            const win1 = new THREE.Mesh(win1Geo, windowGlassMat);
            win1.position.set(-0.8, 1.3, 2.62);
            this.houseGroup.add(win1);
            this.windowMeshes.push(win1);

            // Frame for win1
            const frame1Geo = new THREE.BoxGeometry(3.1, 2.0, 0.06);
            const frame1 = new THREE.Mesh(frame1Geo, windowFrameMat);
            frame1.position.set(-0.8, 1.3, 2.61);
            this.houseGroup.add(frame1);

            // 2. Upper floor modern master bedroom window
            const win2Geo = new THREE.BoxGeometry(2.6, 1.4, 0.08);
            const win2 = new THREE.Mesh(win2Geo, windowGlassMat);
            win2.position.set(-0.6, 3.8, 2.42);
            this.houseGroup.add(win2);
            this.windowMeshes.push(win2);

            // 3. Side window (facing heat pump / terrace)
            const win3Geo = new THREE.BoxGeometry(0.08, 1.5, 1.8);
            const win3 = new THREE.Mesh(win3Geo, windowGlassMat);
            win3.position.set(3.42, 1.5, 0.4);
            this.houseGroup.add(win3);
            this.windowMeshes.push(win3);

            // 4. Front door entrance with warm glass side-lite
            const doorGeo = new THREE.BoxGeometry(1.0, 2.1, 0.06);
            const doorMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.4 });
            const door = new THREE.Mesh(doorGeo, doorMat);
            door.position.set(1.8, 1.2, 2.64);
            this.houseGroup.add(door);
        }

        /**
         * 3. High-Tech Solar Panel Array (Photovoltaik) mounted on the roof
         * Deep navy-blue solar cells (#1e3a8a / #0284c7) with silver grid divisions and glossy finish
         */
        buildSolarArray() {
            const THREE = this.THREE;
            this.solarArrayGroup = new THREE.Group();
            this.houseGroup.add(this.solarArrayGroup);

            // Position array on front roof pitch
            this.solarArrayGroup.position.set(-0.2, 5.58, 1.28);
            this.solarArrayGroup.rotation.x = 0.52;

            // Aluminum mounting rails
            const railMat = new THREE.MeshStandardMaterial({
                color: 0xCBD5E1,
                roughness: 0.2,
                metalness: 0.85
            });
            const rail1 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.04, 0.04), railMat);
            rail1.position.set(0, 0.04, 0.65);
            const rail2 = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.04, 0.04), railMat);
            rail2.position.set(0, 0.04, -0.65);
            this.solarArrayGroup.add(rail1);
            this.solarArrayGroup.add(rail2);

            // Deep navy-blue monocrystalline wafer material with specular gloss
            const waferMat = new THREE.MeshStandardMaterial({
                color: 0x1E3A8A,       // Deep navy-blue (#1e3a8a)
                emissive: 0x0284C7,     // Radiant blue (#0284c7)
                emissiveIntensity: 0.12,
                roughness: 0.12,
                metalness: 0.88
            });
            this.solarWaferMat = waferMat;

            const cellGridMat = new THREE.MeshBasicMaterial({
                color: 0xE2E8F0,
                transparent: true,
                opacity: 0.4
            });

            // 2 rows of 4 high-efficiency PV panels
            const panelWidth = 1.25;
            const panelHeight = 0.035;
            const panelDepth = 1.05;
            const startX = -2.05;

            for (let r = 0; r < 2; r++) {
                const z = (r === 0) ? -0.58 : 0.58;
                for (let c = 0; c < 4; c++) {
                    const x = startX + c * (panelWidth + 0.08);

                    // Panel base wafer
                    const panelGeo = new THREE.BoxGeometry(panelWidth, panelHeight, panelDepth);
                    const panelMesh = new THREE.Mesh(panelGeo, waferMat);
                    panelMesh.position.set(x, 0.07, z);
                    this.solarArrayGroup.add(panelMesh);

                    // Aluminum border frame
                    const frameGeo = new THREE.BoxGeometry(panelWidth + 0.02, panelHeight + 0.01, panelDepth + 0.02);
                    const wireframe = new THREE.LineSegments(
                        new THREE.EdgesGeometry(frameGeo),
                        new THREE.LineBasicMaterial({ color: 0xCBD5E1 })
                    );
                    wireframe.position.copy(panelMesh.position);
                    this.solarArrayGroup.add(wireframe);

                    // Cell division lines
                    const divGeo = new THREE.PlaneGeometry(panelWidth * 0.95, panelDepth * 0.95);
                    const divMesh = new THREE.Mesh(divGeo, cellGridMat);
                    divMesh.rotation.x = -Math.PI / 2;
                    divMesh.position.set(x, 0.09, z);
                    this.solarArrayGroup.add(divMesh);
                }
            }
        }

        /**
         * 4. Realistic Outdoor Heat Pump Unit (Wärmepumpe)
         * Modern white cabinet with air grille slats and a rotating multi-blade fan that spins.
         */
        buildHeatPump() {
            const THREE = this.THREE;
            this.heatPumpGroup = new THREE.Group();
            this.rootGroup.add(this.heatPumpGroup);

            // Positioned beside the house on the garden terrace
            this.heatPumpGroup.position.set(4.6, 0.0, 1.0);

            // A. Anti-vibration concrete plinth
            const plinthGeo = new THREE.BoxGeometry(1.4, 0.14, 1.0);
            const plinthMat = new THREE.MeshStandardMaterial({ color: 0x64748B, roughness: 0.9 });
            const plinth = new THREE.Mesh(plinthGeo, plinthMat);
            plinth.position.set(0, 0.07, 0);
            this.heatPumpGroup.add(plinth);

            // B. Modern white cabinet
            const bodyGeo = new THREE.BoxGeometry(1.25, 1.15, 0.75);
            const bodyMat = new THREE.MeshStandardMaterial({
                color: 0xF8FAFC,       // Modern white cabinet
                roughness: 0.35,
                metalness: 0.15
            });
            const body = new THREE.Mesh(bodyGeo, bodyMat);
            body.position.set(0, 0.72, 0);
            this.heatPumpGroup.add(body);

            // C. Front dark circular fan shroud / recess
            const recessGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.08, 32);
            const recessMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.6
            });
            const recess = new THREE.Mesh(recessGeo, recessMat);
            recess.rotation.x = Math.PI / 2;
            recess.position.set(-0.15, 0.75, 0.38);
            this.heatPumpGroup.add(recess);

            // D. Rotating Multi-Blade Fan (3-blade aerodynamic rotor)
            this.heatPumpFan = new THREE.Group();
            this.heatPumpFan.position.set(-0.15, 0.75, 0.37);

            const fanHubGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.06, 16);
            const fanHubMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.5 });
            const fanHub = new THREE.Mesh(fanHubGeo, fanHubMat);
            fanHub.rotation.x = Math.PI / 2;
            this.heatPumpFan.add(fanHub);

            const bladeGeo = new THREE.BoxGeometry(0.08, 0.32, 0.015);
            const bladeMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.4, metalness: 0.4 });
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

            // E. Protective horizontal acoustic grille slats
            const slatMat = new THREE.MeshStandardMaterial({ color: 0x94A3B8, roughness: 0.4, metalness: 0.6 });
            for (let s = -3; s <= 3; s++) {
                const slatGeo = new THREE.BoxGeometry(0.85, 0.018, 0.02);
                const slat = new THREE.Mesh(slatGeo, slatMat);
                slat.position.set(-0.15, 0.75 + s * 0.09, 0.42);
                this.heatPumpGroup.add(slat);
            }

            // F. Illuminated Status LED Ring on Heat Pump
            const ledRingGeo = new THREE.RingGeometry(0.38, 0.405, 32);
            this.heatPumpLedMat = new THREE.MeshBasicMaterial({
                color: this.currentConfig.primary,
                side: THREE.DoubleSide
            });
            const ledRing = new THREE.Mesh(ledRingGeo, this.heatPumpLedMat);
            ledRing.position.set(-0.15, 0.75, 0.43);
            this.heatPumpGroup.add(ledRing);

            // G. Insulated Thermal Flow Pipe connecting into house wall
            const pipeGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.2, 12);
            const pipeMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.5 });
            const pipe = new THREE.Mesh(pipeGeo, pipeMat);
            pipe.rotation.z = Math.PI / 2;
            pipe.position.set(-0.6, 0.45, -0.1);
            this.heatPumpGroup.add(pipe);
        }

        /**
         * 5. Wallbox EV Charging Station & Electric Vehicle
         */
        buildWallboxAndEV() {
            const THREE = this.THREE;
            this.wallboxGroup = new THREE.Group();
            this.rootGroup.add(this.wallboxGroup);

            // A. Wallbox mounted on house facade near driveway (-3.42, 1.45, 1.8)
            const wbBackGeo = new THREE.BoxGeometry(0.08, 0.55, 0.38);
            const wbMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.3, metalness: 0.3 });
            const wbBack = new THREE.Mesh(wbBackGeo, wbMat);
            wbBack.position.set(-3.42, 1.45, 1.8);
            this.wallboxGroup.add(wbBack);

            // Glass faceplate
            const wbGlassGeo = new THREE.BoxGeometry(0.02, 0.48, 0.32);
            const wbGlassMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1, metalness: 0.8 });
            const wbGlass = new THREE.Mesh(wbGlassGeo, wbGlassMat);
            wbGlass.position.set(-3.37, 1.45, 1.8);
            this.wallboxGroup.add(wbGlass);

            // Illuminated Wallbox Status Halo Ring
            const ringGeo = new THREE.RingGeometry(0.07, 0.095, 24);
            this.wallboxStatusMat = new THREE.MeshBasicMaterial({
                color: this.currentConfig.primary,
                side: THREE.DoubleSide
            });
            this.wallboxStatusRing = new THREE.Mesh(ringGeo, this.wallboxStatusMat);
            this.wallboxStatusRing.rotation.y = Math.PI / 2;
            this.wallboxStatusRing.position.set(-3.35, 1.48, 1.8);
            this.wallboxGroup.add(this.wallboxStatusRing);

            // Coiled charging cable
            const cablePoints = [];
            for (let t = 0; t <= 1; t += 0.05) {
                const x = -3.4 + t * (-1.8);
                const y = 1.2 - Math.sin(t * Math.PI) * 0.85;
                const z = 1.8 + t * (0.2);
                cablePoints.push(new THREE.Vector3(x, Math.max(0.05, y), z));
            }
            const cableCurve = new THREE.CatmullRomCurve3(cablePoints);
            const cableGeo = new THREE.TubeGeometry(cableCurve, 20, 0.022, 8, false);
            const cableMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.6 });
            const cableMesh = new THREE.Mesh(cableGeo, cableMat);
            this.wallboxGroup.add(cableMesh);

            // B. Sleek Modern Electric Vehicle (EV)
            this.evGroup = new THREE.Group();
            this.rootGroup.add(this.evGroup);
            this.evGroup.position.set(-5.5, 0.0, 1.8);

            // Aerodynamic EV Lower Body
            const evBodyGeo = new THREE.BoxGeometry(1.95, 0.46, 3.8);
            const evBodyMat = new THREE.MeshStandardMaterial({
                color: 0xF1F5F9,       // Sleek metallic white/silver
                roughness: 0.22,
                metalness: 0.75
            });
            const evBody = new THREE.Mesh(evBodyGeo, evBodyMat);
            evBody.position.set(0, 0.42, 0);
            this.evGroup.add(evBody);

            // Tinted Glass Greenhouse / Cabin
            const evCabinGeo = new THREE.BoxGeometry(1.68, 0.45, 2.1);
            const evCabinMat = new THREE.MeshStandardMaterial({
                color: 0x0F172A,
                roughness: 0.08,
                metalness: 0.9
            });
            const evCabin = new THREE.Mesh(evCabinGeo, evCabinMat);
            evCabin.position.set(0, 0.78, -0.15);
            this.evGroup.add(evCabin);

            // Front LED Headlight Strip
            const headLightGeo = new THREE.BoxGeometry(1.8, 0.05, 0.04);
            const headLightMat = new THREE.MeshBasicMaterial({ color: 0x00D2FF });
            const headLight = new THREE.Mesh(headLightGeo, headLightMat);
            headLight.position.set(0, 0.45, 1.91);
            this.evGroup.add(headLight);

            // EV Charging Port Indicator Ring
            const evPortGeo = new THREE.RingGeometry(0.04, 0.06, 16);
            this.evPortMat = new THREE.MeshBasicMaterial({ color: this.currentConfig.primary, side: THREE.DoubleSide });
            this.evStatusRing = new THREE.Mesh(evPortGeo, this.evPortMat);
            this.evStatusRing.rotation.y = -Math.PI / 2;
            this.evStatusRing.position.set(0.985, 0.52, -1.1);
            this.evGroup.add(this.evStatusRing);

            // 4 Wheels
            const tireMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.85 });
            const rimMat = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.2, metalness: 0.8 });
            const wheelOffsets = [
                [-0.95, 0.22, 1.15],
                [0.95, 0.22, 1.15],
                [-0.95, 0.22, -1.15],
                [0.95, 0.22, -1.15]
            ];

            wheelOffsets.forEach(([wx, wy, wz]) => {
                const wheelGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.16, 16);
                const wheel = new THREE.Mesh(wheelGeo, tireMat);
                wheel.rotation.z = Math.PI / 2;
                wheel.position.set(wx, wy, wz);

                const rimGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.17, 16);
                const rim = new THREE.Mesh(rimGeo, rimMat);
                wheel.add(rim);

                this.evGroup.add(wheel);
            });
        }

        /**
         * 6. Digital Smart Meter Gateway & Battery Storage (Hausakku)
         */
        buildSmartMeterAndBattery() {
            const THREE = this.THREE;

            // A. Digital Electricity Meter (Smart Meter Gateway)
            const meterGeo = new THREE.BoxGeometry(0.25, 0.35, 0.08);
            const meterMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.4 });
            const meter = new THREE.Mesh(meterGeo, meterMat);
            meter.position.set(2.85, 1.25, 2.64);
            this.houseGroup.add(meter);

            // Blinking Smart Meter LED beacon
            const ledGeo = new THREE.SphereGeometry(0.025, 8, 8);
            this.meterLedMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
            this.smartMeterLed = new THREE.Mesh(ledGeo, this.meterLedMat);
            this.smartMeterLed.position.set(2.85, 1.34, 2.69);
            this.houseGroup.add(this.smartMeterLed);

            // B. Home Battery Accumulator (Alpha Speicher)
            this.batteryGroup = new THREE.Group();
            this.houseGroup.add(this.batteryGroup);
            this.batteryGroup.position.set(2.9, 0.65, 2.2);

            const battGeo = new THREE.BoxGeometry(0.28, 1.1, 0.6);
            const battMat = new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3, metalness: 0.4 });
            const battMesh = new THREE.Mesh(battGeo, battMat);
            this.batteryGroup.add(battMesh);

            // 4 State-of-Charge LED bars
            this.batteryLeds = [];
            for (let b = 0; b < 4; b++) {
                const barGeo = new THREE.BoxGeometry(0.015, 0.04, 0.28);
                const barMat = new THREE.MeshBasicMaterial({ color: 0x00E676 });
                const bar = new THREE.Mesh(barGeo, barMat);
                bar.position.set(0.145, -0.3 + b * 0.16, 0);
                this.batteryGroup.add(bar);
                this.batteryLeds.push(bar);
            }
        }

        /**
         * 7. Flow Trajectories (Splines) & Luminous Photons
         * - Spline 1: Rooftop Solar PV -> Home Battery Storage
         * - Spline 2: Outdoor Heat Pump -> Building Thermal Buffer System
         * - Spline 3: Alpha Energie Green Grid -> Digital Smart Meter Gateway
         * - Spline 4: Wallbox -> Electric Vehicle
         */
        buildFlowTrajectories() {
            const THREE = this.THREE;
            this.flowTracksGroup = new THREE.Group();
            this.rootGroup.add(this.flowTracksGroup);

            // Spline 1: Solar to Battery
            const curveSolar = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-0.2, 5.6, 1.3),
                new THREE.Vector3(1.2, 4.2, 2.4),
                new THREE.Vector3(2.5, 2.6, 2.6),
                new THREE.Vector3(2.9, 0.8, 2.2)
            ]);

            // Spline 2: Heat Pump Thermal Flow
            const curveHeat = new THREE.CatmullRomCurve3([
                new THREE.Vector3(4.4, 0.75, 1.0),
                new THREE.Vector3(3.8, 0.6, 0.6),
                new THREE.Vector3(2.8, 0.5, 0.2),
                new THREE.Vector3(1.0, 0.4, 0.0)
            ]);

            // Spline 3: Public Green Grid Connection to Smart Meter
            const curveGrid = new THREE.CatmullRomCurve3([
                new THREE.Vector3(8.5, 4.2, 6.5),
                new THREE.Vector3(5.8, 3.2, 4.5),
                new THREE.Vector3(3.6, 2.0, 3.2),
                new THREE.Vector3(2.85, 1.25, 2.64)
            ]);

            // Spline 4: Wallbox to EV
            const curveEV = new THREE.CatmullRomCurve3([
                new THREE.Vector3(-3.35, 1.45, 1.8),
                new THREE.Vector3(-4.0, 0.8, 1.9),
                new THREE.Vector3(-4.5, 0.52, 0.7)
            ]);

            this.curves = [
                { curve: curveSolar, name: 'solar', type: 'electric' },
                { curve: curveHeat,  name: 'heat',  type: 'thermal' },
                { curve: curveGrid,  name: 'grid',  type: 'grid' },
                { curve: curveEV,    name: 'ev',    type: 'charge' }
            ];

            // Render subtle ambient glowing guide tracks
            const trackMat = new THREE.LineBasicMaterial({
                color: this.currentConfig.primary,
                transparent: true,
                opacity: 0.28
            });
            this.trackMaterial = trackMat;

            this.curveMeshes = [];
            this.curves.forEach(item => {
                const pts = item.curve.getPoints(50);
                const geo = new THREE.BufferGeometry().setFromPoints(pts);
                const line = new THREE.Line(geo, trackMat);
                this.flowTracksGroup.add(line);
                this.curveMeshes.push(line);
            });
        }

        buildTravelingPhotons() {
            const THREE = this.THREE;
            const count = this.photonCount;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);
            const sizes = new Float32Array(count);

            this.photons = [];
            const primaryCol = new THREE.Color(this.currentConfig.primary);
            const secondaryCol = new THREE.Color(this.currentConfig.secondary);

            for (let i = 0; i < count; i++) {
                const curveIdx = i % this.curves.length;
                const progress = Math.random();
                const speed = 0.18 + Math.random() * 0.16;

                this.photons.push({
                    curveIdx,
                    progress,
                    baseSpeed: speed,
                    colorT: Math.random()
                });

                const pt = this.curves[curveIdx].curve.getPointAt(progress);
                positions[i * 3]     = pt.x;
                positions[i * 3 + 1] = pt.y;
                positions[i * 3 + 2] = pt.z;

                const c = primaryCol.clone().lerp(secondaryCol, Math.random());
                colors[i * 3]     = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;

                sizes[i] = 2.8 + Math.random() * 2.2;
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

            const glowTex = this.getOrCreateTexture('photon', 'rgba(255,255,255,1)', 'rgba(0,230,118,0.85)', 'rgba(0,230,118,0)');

            const pMat = new THREE.PointsMaterial({
                size: 0.32,
                vertexColors: true,
                map: glowTex,
                transparent: true,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });
            this.photonMaterial = pMat;

            this.photonsMesh = new THREE.Points(geo, pMat);
            this.rootGroup.add(this.photonsMesh);
        }

        /**
         * 8. Shockwave Pulse Rings & CO2 Tokens
         */
        buildBurstRings() {
            const THREE = this.THREE;
            this.burstRings = [];

            for (let i = 0; i < 3; i++) {
                const ringGeo = new THREE.RingGeometry(0.3, 0.45, 32);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: this.currentConfig.primary,
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide
                });
                const ring = new THREE.Mesh(ringGeo, ringMat);
                ring.rotation.x = -Math.PI / 2;
                ring.position.set(0, 0.05, 0.5);
                ring.visible = false;

                this.rootGroup.add(ring);
                this.burstRings.push({
                    mesh: ring,
                    material: ringMat,
                    active: false,
                    radius: 0.5,
                    opacity: 0,
                    speed: 4.5 + i * 1.2
                });
            }
        }

        buildCO2Tokens() {
            const THREE = this.THREE;
            this.co2Tokens = [];

            const tokenGeo = new THREE.TorusGeometry(0.35, 0.04, 12, 24);
            const tokenMat = new THREE.MeshStandardMaterial({
                color: 0x00E676,
                emissive: 0x00E676,
                emissiveIntensity: 0.4,
                roughness: 0.25,
                metalness: 0.6
            });

            for (let i = 0; i < 4; i++) {
                const mesh = new THREE.Mesh(tokenGeo, tokenMat);
                mesh.position.set(
                    -4.0 + i * 2.6,
                    3.5 + Math.sin(i) * 0.8,
                    -2.0 + Math.cos(i) * 2.0
                );
                mesh.visible = this.currentConfig.gasTokens;
                this.rootGroup.add(mesh);

                this.co2Tokens.push({
                    mesh,
                    baseY: mesh.position.y,
                    speed: 1.2 + i * 0.4,
                    rotSpeed: 0.8 + i * 0.3
                });
            }
        }

        /**
         * Dynamic Mode Switcher (Ökostrom, Wärmestrom, Ökogas)
         */
        setMode(rawMode) {
            const mode = this.normalizeMode(rawMode);
            this.currentMode = mode;
            this.currentConfig = this.modes[mode];

            this.applyModeStyles();
            this.setConsumption(this.consumption, mode);

            // If switching to heat pump mode, smoothly orient focus
            if (mode === 'waerme' && this.currentFocus === 'overview') {
                this.setFocus('waerme');
            } else if (mode === 'strom' && this.currentFocus === 'waerme') {
                this.setFocus('overview');
            }

            return this.currentConfig;
        }

        applyModeStyles() {
            const cfg = this.currentConfig;
            const THREE = this.THREE;
            const primaryColor = new THREE.Color(cfg.primary);

            // Update Accent Light
            if (this.accentLight) {
                this.accentLight.color.setHex(cfg.light);
                this.accentLight.intensity = cfg.lightIntensity;
            }

            // Update Tracks
            if (this.trackMaterial) {
                this.trackMaterial.color.setHex(cfg.primary);
            }

            // Update Heat Pump LED ring
            if (this.heatPumpLedMat) {
                this.heatPumpLedMat.color.setHex(cfg.primary);
            }

            // Update Wallbox LED
            if (this.wallboxStatusMat) {
                this.wallboxStatusMat.color.setHex(cfg.primary);
            }

            // Update EV Port LED
            if (this.evPortMat) {
                this.evPortMat.color.setHex(cfg.primary);
            }

            // Update CO2 tokens visibility
            this.co2Tokens.forEach(t => {
                t.mesh.visible = Boolean(cfg.gasTokens);
            });

            // Update Window warmth glow
            if (this.windowGlassMat) {
                if (cfg.name === 'waerme') {
                    this.windowGlassMat.color.setHex(0xFDBA74);
                    this.windowGlassMat.emissive.setHex(0xEA580C);
                    this.windowGlassMat.emissiveIntensity = 0.58;
                } else {
                    this.windowGlassMat.color.setHex(0xFEF08A);
                    this.windowGlassMat.emissive.setHex(0xF59E0B);
                    this.windowGlassMat.emissiveIntensity = 0.45;
                }
            }

            // Update Photon Particle Colors
            if (this.photonsMesh && this.photonsMesh.geometry.attributes.color) {
                const colors = this.photonsMesh.geometry.attributes.color.array;
                const secColor = new THREE.Color(cfg.secondary);

                for (let i = 0; i < this.photons.length; i++) {
                    const c = primaryColor.clone().lerp(secColor, this.photons[i].colorT);
                    colors[i * 3]     = c.r;
                    colors[i * 3 + 1] = c.g;
                    colors[i * 3 + 2] = c.b;
                }
                this.photonsMesh.geometry.attributes.color.needsUpdate = true;
            }
        }

        /**
         * Dynamic Consumption & Real-World Cost Savings Calculation
         * Scales speed and emits custom event 'alphathree:savings-update'
         */
        setConsumption(kwh, branch) {
            const kwhVal = Math.max(500, parseFloat(kwh) || 3500);
            this.consumption = kwhVal;
            const b = branch || this.currentMode || 'strom';

            // Speed multiplier scaling
            // 3,500 kWh -> 1.0; 4,500 kWh -> 1.21; 6,500 kWh -> 1.43 (>1.2); 7,500 kWh -> 1.53
            this.consumptionSpeedMultiplier = 0.72 + (kwhVal / 3500) * 0.38;

            // Real-world German utility pricing (Grundversorger vs Alpha Energie)
            let workingBaseCt, basePriceBaseEur, workingAlphaCt, basePriceAlphaEur;
            if (b === 'waerme') {
                workingBaseCt = 34.80;
                basePriceBaseEur = 11.50;
                workingAlphaCt = 21.40;
                basePriceAlphaEur = 9.90;
            } else if (b === 'gas') {
                workingBaseCt = 13.80;
                basePriceBaseEur = 12.00;
                workingAlphaCt = 9.85;
                basePriceAlphaEur = 10.90;
            } else {
                // strom / oekostrom: 2,500 kWh benchmark = 1.140 € Grundversorger vs 760 € Alpha Energie (380 € Ersparnis)
                workingBaseCt = 40.80;
                basePriceBaseEur = 10.00;
                workingAlphaCt = 25.60;
                basePriceAlphaEur = 10.00;
            }

            const annualBaseCost = (kwhVal * (workingBaseCt / 100)) + (basePriceBaseEur * 12);
            const annualAlphaCost = (kwhVal * (workingAlphaCt / 100)) + (basePriceAlphaEur * 12);
            const savingsYear = Math.max(0, Math.round(annualBaseCost - annualAlphaCost));
            const monthlyAlpha = Math.round(annualAlphaCost / 12);
            const monthlyBase = Math.round(annualBaseCost / 12);

            this.savingsData = {
                kwh: kwhVal,
                annualBaseCost: Math.round(annualBaseCost),
                annualAlphaCost: Math.round(annualAlphaCost),
                monthlyAlpha,
                monthlyBase,
                savingsYear,
                branch: b
            };

            // Dispatch global event for live UI savings badge synchronization
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

        /**
         * Interactive Hotspot Focus:
         * .setFocus('strom' | 'waerme' | 'wallbox' | 'solar' | 'overview')
         */
        setFocus(focusName) {
            const preset = this.focusPresets[focusName] || this.focusPresets.overview;
            this.currentFocus = focusName;

            this.targetCameraPos.set(preset.position.x, preset.position.y, preset.position.z);
            this.targetLookAt.set(preset.lookAt.x, preset.lookAt.y, preset.lookAt.z);
            return this.currentFocus;
        }

        /**
         * Interactive Shockwave Pulse
         */
        pulseBurst() {
            this.pulse();
        }

        pulse() {
            this.burstTime = 1.6;
            this.burstVelocityBoost = 2.5;

            this.burstRings.forEach(r => {
                r.active = true;
                r.radius = 0.6;
                r.opacity = 1.0;
                r.mesh.visible = true;
            });
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
         * Render Loop Update
         */
        update(delta, elapsed, pointer) {
            if (this.disposed || !this.THREE) return;

            const safeDelta = Math.min(delta, 0.1);
            const totalSpeed = this.speed * this.consumptionSpeedMultiplier * this.burstVelocityBoost;

            // 1. Smooth Camera Focus Lerping
            if (this.targetCameraPos && this.currentCameraPos && this.camera) {
                const lerpFactor = Math.min(safeDelta * 3.6, 1.0);
                this.currentCameraPos.lerp(this.targetCameraPos, lerpFactor);
                this.currentLookAt.lerp(this.targetLookAt, lerpFactor);

                this.camera.position.copy(this.currentCameraPos);
                this.camera.lookAt(this.currentLookAt);
            }

            // 2. Parallax Root Rotation with Drag & Pointer Inertia
            if (pointer) {
                this.targetRotationY = (pointer.x * 0.15) + (this.isDragging ? this.targetRotationY : 0);
            }
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * Math.min(safeDelta * 4.0, 1.0);
            this.currentRotationX += (this.targetRotationX - this.currentRotationX) * Math.min(safeDelta * 4.0, 1.0);

            if (this.rootGroup) {
                this.rootGroup.rotation.y = this.currentRotationY;
                this.rootGroup.rotation.x = this.currentRotationX;
            }

            // 3. Outdoor Heat Pump Fan Continuous Rotation
            if (this.heatPumpFan) {
                const fanSpeed = (this.currentMode === 'waerme' ? 8.5 : 4.5) * totalSpeed;
                this.heatPumpFan.rotation.z += safeDelta * fanSpeed;
            }

            // 4. Smart Meter Gateway Blinking LED
            if (this.smartMeterLed) {
                const blink = (Math.sin(elapsed * 4.5) > 0.3) ? 1.0 : 0.2;
                this.meterLedMat.color.setRGB(0, blink * 0.9, 0);
            }

            // 5. Battery State-of-Charge LED Wave
            if (this.batteryLeds && this.batteryLeds.length > 0) {
                this.batteryLeds.forEach((bar, idx) => {
                    const wave = Math.sin(elapsed * 2.0 - idx * 0.6);
                    bar.material.opacity = (wave > -0.2) ? 1.0 : 0.3;
                });
            }

            // 6. Traveling Photons Animation along Splines
            if (this.photonsMesh && this.photons.length > 0) {
                const positions = this.photonsMesh.geometry.attributes.position.array;

                for (let i = 0; i < this.photons.length; i++) {
                    const p = this.photons[i];
                    p.progress = (p.progress + p.baseSpeed * totalSpeed * safeDelta * 0.35) % 1.0;

                    const curveItem = this.curves[p.curveIdx];
                    if (curveItem && curveItem.curve) {
                        const pt = curveItem.curve.getPointAt(p.progress);
                        positions[i * 3]     = pt.x;
                        positions[i * 3 + 1] = pt.y;
                        positions[i * 3 + 2] = pt.z;
                    }
                }
                this.photonsMesh.geometry.attributes.position.needsUpdate = true;
            }

            // 7. Pulse Shockwave Rings Animation
            if (this.burstTime > 0) {
                this.burstTime = Math.max(0, this.burstTime - safeDelta);
                this.burstVelocityBoost = 1.0 + (this.burstVelocityBoost - 1.0) * Math.exp(-safeDelta * 3.2);

                this.burstRings.forEach(ring => {
                    if (ring.active) {
                        ring.radius += ring.speed * safeDelta;
                        ring.opacity = Math.max(0, ring.opacity - safeDelta * 0.85);

                        ring.mesh.scale.set(ring.radius, ring.radius, 1);
                        ring.material.opacity = ring.opacity;

                        if (ring.opacity <= 0.02) {
                            ring.active = false;
                            ring.mesh.visible = false;
                        }
                    }
                });
            }

            // 8. CO2 Tokens Floating Wave (Ökogas)
            if (this.currentConfig.gasTokens && this.co2Tokens.length > 0) {
                this.co2Tokens.forEach(token => {
                    token.mesh.position.y = token.baseY + Math.sin(elapsed * token.speed) * 0.25;
                    token.mesh.rotation.y += safeDelta * token.rotSpeed;
                    token.mesh.rotation.x = Math.sin(elapsed * token.speed * 0.5) * 0.2;
                });
            }

                        // 9. 3D-to-2D Anchor Tracking & DOM Callout Banner Updates
            this.updateAnchors();
        }

        /**
         * 9. 3D-to-2D Anchor Tracking & Floating Callout Banners
         * Direct 3D positioning over Smart Home objects with photorealistic callout banners
         */
        initAnchors() {
            const THREE = this.THREE;
            this.activeAnchorId = null;
            this.anchorElements = new Map();
            this.anchorsLayer = null;
            this._tempAnchorWorldVec = new THREE.Vector3();
            this._lastAnchorsBroadcastTime = 0;

            this.anchorDefinitions = [
                {
                    id: 'waerme',
                    name: 'Wärmepumpe',
                    branch: 'waerme',
                    focus: 'waerme',
                    localPosition: new THREE.Vector3(5.0, 1.45, 1.0),
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
                    localPosition: new THREE.Vector3(-3.4, 1.65, 1.8),
                    badge: '🔌 Wallbox- & Autostrom',
                    headline: 'Wir bieten spezielle Stromtarife für Wallboxen an',
                    benefit: 'Laden Sie Ihr E-Auto zuhause günstig mit 100 % zertifiziertem Ökostrom zu besten Konditionen!',
                    ctaText: 'Autostrom berechnen →',
                    colorClass: 'alpha-anchor-wallbox anchor-wallbox',
                    accentColor: '#00D2FF'
                },
                {
                    id: 'strom',
                    name: 'Haushaltsstrom',
                    branch: 'strom',
                    focus: 'strom',
                    localPosition: new THREE.Vector3(-1.2, 1.35, 2.4),
                    badge: '💡 Haushaltsstrom & Zähler',
                    headline: 'Wir bieten 100 % Ökostromtarife für Ihren Hausstrom an',
                    benefit: 'Bis zu 380 € pro Jahr gegenüber der Grundversorgung sparen mit voller Preisgarantie und ok-power Siegel!',
                    ctaText: 'Hausstrom berechnen →',
                    colorClass: 'alpha-anchor-strom anchor-strom',
                    accentColor: '#00E676'
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

            // Remove existing layer if any
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
                        <div class="alpha-anchor-badge-pill" data-action="toggle-card">
                            <span class="alpha-pill-badge">${def.badge}</span>
                            <span class="alpha-pill-arrow" aria-hidden="true">▾</span>
                        </div>
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

                // Handle click on card or pin to focus camera & highlight
                item.addEventListener('click', (e) => {
                    const isCta = e.target.closest('.btn-rechner-sync');
                    const isClose = e.target.closest('.alpha-anchor-close-btn');

                    if (isClose) {
                        e.stopPropagation();
                        item.classList.remove('is-active');
                        this.activeAnchorId = null;
                        return;
                    }

                    if (!isCta) {
                        this.setFocus(def.focus);
                        this.highlightAnchor(def.id);
                        this.pulse();
                    }
                });

                layer.appendChild(item);
                this.anchorElements.set(def.id, item);
            });

            this.container.appendChild(layer);
            this.anchorsLayer = layer;
        }

        highlightAnchor(anchorId) {
            this.activeAnchorId = anchorId;
            if (!this.anchorElements) return;
            this.anchorElements.forEach((el, id) => {
                if (id === anchorId) {
                    el.classList.add('is-active');
                } else {
                    el.classList.remove('is-active');
                }
            });
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

                // 4. Convert NDC [-1, 1] to container screen coordinates [0, width], [0, height]
                const screenX = (worldVec.x * 0.5 + 0.5) * width;
                const screenY = (-(worldVec.y * 0.5) + 0.5) * height;

                // 5. Inversion logic: if anchor is near top of viewport, flip card downward
                const isInverted = screenY < 135;
                el.classList.toggle('is-inverted', isInverted);
                el.classList.toggle('is-mobile', isMobile);

                // 6. Safe edge clamping
                const safeMarginX = isMobile ? 12 : 24;
                const safeMarginY = 16;
                const clampedX = Math.max(safeMarginX, Math.min(width - safeMarginX, screenX));
                const clampedY = Math.max(safeMarginY, Math.min(height - safeMarginY, screenY));

                // 7. Apply 3D translate
                el.style.transform = `translate3d(${clampedX.toFixed(1)}px, ${clampedY.toFixed(1)}px, 0)`;
                el.style.opacity = '1';
                el.style.pointerEvents = 'auto';

                activeAnchorsData.push({
                    id: def.id,
                    branch: def.branch,
                    focus: def.focus,
                    x: clampedX,
                    y: clampedY,
                    isInverted: isInverted
                });
            });

            // Throttle custom event broadcast to ~15fps (every 66ms)
            const now = (typeof performance !== 'undefined' && performance.now) ? performance.now() : Date.now();
            if (now - this._lastAnchorsBroadcastTime > 66) {
                this._lastAnchorsBroadcastTime = now;
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('alphathree:anchors-update', {
                        detail: { anchors: activeAnchorsData }
                    }));
                }
            }
        }

        getAnchors() {
            return this.anchorDefinitions ? [...this.anchorDefinitions] : [];
        }

        /**
         * Comprehensive GPU Resource Teardown & Disposal
         */
        dispose() {
            super.dispose();

            // Clear anchors DOM layer
            if (this.anchorsLayer && this.anchorsLayer.parentNode) {
                this.anchorsLayer.parentNode.removeChild(this.anchorsLayer);
            }
            if (this.anchorElements) {
                this.anchorElements.clear();
            }
            this.anchorsLayer = null;

            // Clear textures
            for (const key of Object.keys(this.glowTextures || {})) {
                if (this.glowTextures[key] && typeof this.glowTextures[key].dispose === 'function') {
                    this.glowTextures[key].dispose();
                }
            }
            this.glowTextures = {};

            // Traverse and clean hierarchy
            if (this.rootGroup && this.scene) {
                this.disposeNode(this.rootGroup);
                this.scene.remove(this.rootGroup);
                this.rootGroup = null;
            }

            this.houseGroup = null;
            this.solarArrayGroup = null;
            this.heatPumpGroup = null;
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

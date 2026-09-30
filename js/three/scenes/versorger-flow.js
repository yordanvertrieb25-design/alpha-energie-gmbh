/**
 * Alpha Energie GmbH - 3D Versorger Flow Scene (Öko-Versorgungsfluss)
 * Clean Energy Eco-Flow: Generation Hubs (Hydro, Wind, Solar) -> Alpha Grid Nexus -> Smart Consumers.
 * Features dynamic multi-energy modes (Strom, Wärme, Gas), dynamic consumption scaling (kWh),
 * traveling photon streams along curved bezier trajectories, §14a EnWG heat pump flexibility,
 * floating CO2-offset ring tokens, and interactive pulse bursts.
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

            // Modes & Aesthetic Color Palettes
            this.modes = {
                strom: {
                    name: 'strom',
                    label: '100% Ökostrom (ok-power)',
                    primary: 0x00E676,       // Emerald / Clean Eco Green
                    secondary: 0x00D2FF,     // Electric Cyan
                    accent: 0x38BDF8,        // Transmission Sky
                    core: 0x00E676,
                    light: 0x00E676,
                    lightIntensity: 2.8,
                    thermalGlow: false,
                    gasTokens: false,
                    haloInner: 'rgba(255, 255, 255, 1)',
                    haloOuter: 'rgba(0, 230, 118, 0)'
                },
                waerme: {
                    name: 'waerme',
                    label: 'Wärmestrom (§14a EnWG Flexibel)',
                    primary: 0xFF7A00,       // Warm Alpha Amber
                    secondary: 0x10B981,     // Emerald Efficiency
                    accent: 0xF59E0B,        // Golden Amber
                    core: 0xFF7A00,
                    light: 0xFF7A00,
                    lightIntensity: 3.0,
                    thermalGlow: true,
                    gasTokens: false,
                    haloInner: 'rgba(255, 235, 200, 1)',
                    haloOuter: 'rgba(255, 122, 0, 0)'
                },
                gas: {
                    name: 'gas',
                    label: 'Ökogas (100% CO2-Kompensiert)',
                    primary: 0x00B0FF,       // Azure Gas Flame Blue
                    secondary: 0xF59E0B,     // Warm Biogas Amber
                    accent: 0x00E676,        // Certified Eco-Compensation Green
                    core: 0x00B0FF,
                    light: 0x00B0FF,
                    lightIntensity: 2.8,
                    thermalGlow: false,
                    gasTokens: true,
                    haloInner: 'rgba(220, 245, 255, 1)',
                    haloOuter: 'rgba(0, 176, 255, 0)'
                }
            };

            this.currentMode = this.normalizeMode(this.rawMode);
            this.currentConfig = this.modes[this.currentMode];

            // Consumption Scaling
            this.consumptionSpeedMultiplier = 1.0;
            this.activePhotonCount = 100;
            this.photonCount = 128;

            // Interactive Shockwave & Physics State
            this.burstTime = 0;
            this.burstVelocityBoost = 1.0;
            this.targetRotationY = 0;
            this.targetRotationX = 0;
            this.currentRotationY = 0;
            this.currentRotationX = 0;

            // 3D Scene Groups & Holders
            this.rootGroup = null;
            this.generationGroup = null;
            this.nexusGroup = null;
            this.consumerGroup = null;
            this.flowTracksGroup = null;
            this.photonsMesh = null;
            this.ambientParticles = null;
            this.burstRings = [];
            this.co2Tokens = [];

            // Node references
            this.hydroNode = null;
            this.windNode = null;
            this.solarNode = null;
            this.smartBuildingNode = null;
            this.heatPumpNode = null;
            this.smartMeterNode = null;
            this.wallboxNode = null;
            this.batteryNode = null;

            // Core references
            this.nexusGyro1 = null;
            this.nexusGyro2 = null;
            this.nexusGyro3 = null;
            this.nexusCoreMesh = null;
            this.nexusInnerSphere = null;
            this.nexusHalo = null;
            this.corePointLight = null;

            // Flow trajectories (Splines) & Photons
            this.curves = [];
            this.curveMeshes = [];
            this.photons = [];

            // Procedural textures
            this.glowTextures = {};

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

            // Camera setup
            this.camera.position.set(0, 1.2, this.options.cameraZ || 25);
            this.camera.lookAt(0, 0, 0);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.75);
            this.scene.add(ambientLight);

            const coreLight = new THREE.PointLight(this.currentConfig.light, this.currentConfig.lightIntensity, 45);
            coreLight.position.set(0, 0, 1.5);
            this.rootGroup.add(coreLight);
            this.corePointLight = coreLight;

            // 1. Build Generation Hubs (Left: Erzeugung)
            this.buildGenerationHubs();

            // 2. Build Alpha Grid Nexus (Center: Umspannwerk & Digital Grid Hub)
            this.buildGridNexus();

            // 3. Build Smart Consumer (Right: Smart Home & Enterprise)
            this.buildConsumerHub();

            // 4. Build Flow Trajectories (Splines)
            this.buildFlowTrajectories();

            // 5. Build Traveling Energy Photons
            this.buildTravelingPhotons();

            // 6. Build Floating CO2-Offset Ring Tokens (Ökogas)
            this.buildCO2Tokens();

            // 7. Build Burst Shockwave Rings
            this.buildBurstRings();

            // 8. Build Ambient Energy Dust Field
            this.buildAmbientDust();

            // Apply initial mode styling
            this.applyModeStyles();
        }

        /**
         * Procedural canvas glow texture generator
         */
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
         * 1. Left Side: Generation Hubs (Hydro, Wind, Solar)
         */
        buildGenerationHubs() {
            const THREE = this.THREE;
            this.generationGroup = new THREE.Group();
            this.rootGroup.add(this.generationGroup);

            const greenTex = this.getOrCreateTexture('green', 'rgba(255,255,255,1)', 'rgba(0,230,118,0.85)', 'rgba(0,230,118,0)');
            const cyanTex = this.getOrCreateTexture('cyan', 'rgba(255,255,255,1)', 'rgba(0,210,255,0.85)', 'rgba(0,210,255,0)');

            // --- A. Wasserkraft (Hydro) at (-9.5, 3.2, 0) ---
            const hydroGroup = new THREE.Group();
            hydroGroup.position.set(-9.5, 3.2, 0);

            const hydroGeo = new THREE.IcosahedronGeometry(0.7, 1);
            const hydroMat = new THREE.MeshBasicMaterial({ color: 0x00D2FF, wireframe: true, transparent: true, opacity: 0.85 });
            const hydroMesh = new THREE.Mesh(hydroGeo, hydroMat);
            hydroGroup.add(hydroMesh);

            const hydroCoreGeo = new THREE.SphereGeometry(0.35, 16, 16);
            const hydroCoreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const hydroCore = new THREE.Mesh(hydroCoreGeo, hydroCoreMat);
            hydroGroup.add(hydroCore);

            // Water wave ripple rings
            const ripple1Geo = new THREE.TorusGeometry(1.2, 0.025, 6, 36);
            const rippleMat = new THREE.MeshBasicMaterial({ color: 0x00D2FF, transparent: true, opacity: 0.65 });
            const ripple1 = new THREE.Mesh(ripple1Geo, rippleMat);
            ripple1.rotation.x = Math.PI / 2;
            hydroGroup.add(ripple1);

            const ripple2Geo = new THREE.TorusGeometry(1.65, 0.02, 6, 36);
            const ripple2 = new THREE.Mesh(ripple2Geo, rippleMat.clone());
            ripple2.rotation.x = Math.PI / 2;
            hydroGroup.add(ripple2);

            // Sprite Halo
            const hydroHaloMat = new THREE.SpriteMaterial({ map: cyanTex, transparent: true, opacity: 0.65, blending: THREE.AdditiveBlending });
            const hydroHalo = new THREE.Sprite(hydroHaloMat);
            hydroHalo.scale.set(3.2, 3.2, 1);
            hydroGroup.add(hydroHalo);

            this.hydroNode = { group: hydroGroup, mesh: hydroMesh, core: hydroCore, ripple1, ripple2, halo: hydroHalo };
            this.generationGroup.add(hydroGroup);

            // --- B. Windkraft (Wind) at (-10.5, 0.0, 1.0) ---
            const windGroup = new THREE.Group();
            windGroup.position.set(-10.5, 0.0, 1.0);

            const windGeo = new THREE.OctahedronGeometry(0.75, 1);
            const windMat = new THREE.MeshBasicMaterial({ color: 0x00E676, wireframe: true, transparent: true, opacity: 0.85 });
            const windMesh = new THREE.Mesh(windGeo, windMat);
            windGroup.add(windMesh);

            const windCoreGeo = new THREE.SphereGeometry(0.38, 16, 16);
            const windCoreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const windCore = new THREE.Mesh(windCoreGeo, windCoreMat);
            windGroup.add(windCore);

            // 3 Rotating Turbine Blade Arms
            const rotorGroup = new THREE.Group();
            for (let b = 0; b < 3; b++) {
                const angle = (b * Math.PI * 2) / 3;
                const bladeGeo = new THREE.CylinderGeometry(0.04, 0.12, 1.6, 8);
                const bladeMat = new THREE.MeshBasicMaterial({ color: 0x00D2FF, transparent: true, opacity: 0.75 });
                const blade = new THREE.Mesh(bladeGeo, bladeMat);
                blade.position.set(Math.cos(angle) * 0.85, Math.sin(angle) * 0.85, 0);
                blade.rotation.z = angle - Math.PI / 2;
                rotorGroup.add(blade);
            }
            windGroup.add(rotorGroup);

            // Orbit Ring
            const windRingGeo = new THREE.TorusGeometry(1.8, 0.02, 6, 36);
            const windRing = new THREE.Mesh(windRingGeo, new THREE.MeshBasicMaterial({ color: 0x00E676, transparent: true, opacity: 0.45 }));
            windGroup.add(windRing);

            const windHaloMat = new THREE.SpriteMaterial({ map: greenTex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
            const windHalo = new THREE.Sprite(windHaloMat);
            windHalo.scale.set(3.4, 3.4, 1);
            windGroup.add(windHalo);

            this.windNode = { group: windGroup, mesh: windMesh, core: windCore, rotor: rotorGroup, halo: windHalo };
            this.generationGroup.add(windGroup);

            // --- C. Solar (Photovoltaik) at (-9.5, -3.2, 0) ---
            const solarGroup = new THREE.Group();
            solarGroup.position.set(-9.5, -3.2, 0);

            const solarGeo = new THREE.CylinderGeometry(0.85, 0.85, 0.18, 6);
            const solarMat = new THREE.MeshBasicMaterial({ color: 0x00E676, wireframe: true, transparent: true, opacity: 0.9 });
            const solarMesh = new THREE.Mesh(solarGeo, solarMat);
            solarMesh.rotation.x = Math.PI / 3;
            solarGroup.add(solarMesh);

            const solarCoreGeo = new THREE.SphereGeometry(0.36, 16, 16);
            const solarCore = new THREE.Mesh(solarCoreGeo, new THREE.MeshBasicMaterial({ color: 0xFFFFFF }));
            solarGroup.add(solarCore);

            // Coronal Energy Ring
            const solarRingGeo = new THREE.TorusGeometry(1.4, 0.03, 6, 36);
            const solarRingMat = new THREE.MeshBasicMaterial({ color: 0x00E676, transparent: true, opacity: 0.6 });
            const solarRing = new THREE.Mesh(solarRingGeo, solarRingMat);
            solarRing.rotation.x = Math.PI / 3;
            solarGroup.add(solarRing);

            // 6 Radial Solar Rays
            const raysGroup = new THREE.Group();
            for (let r = 0; r < 6; r++) {
                const ang = (r * Math.PI * 2) / 6;
                const rayGeo = new THREE.BufferGeometry().setFromPoints([
                    new THREE.Vector3(Math.cos(ang) * 0.9, Math.sin(ang) * 0.9, 0),
                    new THREE.Vector3(Math.cos(ang) * 1.55, Math.sin(ang) * 1.55, 0)
                ]);
                const rayLine = new THREE.Line(rayGeo, new THREE.LineBasicMaterial({ color: 0x00E676, transparent: true, opacity: 0.55 }));
                raysGroup.add(rayLine);
            }
            solarGroup.add(raysGroup);

            const solarHaloMat = new THREE.SpriteMaterial({ map: greenTex, transparent: true, opacity: 0.75, blending: THREE.AdditiveBlending });
            const solarHalo = new THREE.Sprite(solarHaloMat);
            solarHalo.scale.set(3.5, 3.5, 1);
            solarGroup.add(solarHalo);

            this.solarNode = { group: solarGroup, mesh: solarMesh, core: solarCore, ring: solarRing, rays: raysGroup, halo: solarHalo };
            this.generationGroup.add(solarGroup);

            // Collector Busbar Line connecting the 3 generation nodes
            const busbarPoints = [
                new THREE.Vector3(-9.5, 3.2, 0),
                new THREE.Vector3(-10.5, 0.0, 1.0),
                new THREE.Vector3(-9.5, -3.2, 0)
            ];
            const busbarGeo = new THREE.BufferGeometry().setFromPoints(busbarPoints);
            const busbarMat = new THREE.LineBasicMaterial({ color: 0x00D2FF, transparent: true, opacity: 0.45 });
            const busbarLine = new THREE.Line(busbarGeo, busbarMat);
            this.generationGroup.add(busbarLine);
            this.busbarLine = busbarLine;
        }

        /**
         * 2. Center: Alpha Grid Nexus (Transformer, Substation & Digital Grid Hub)
         */
        buildGridNexus() {
            const THREE = this.THREE;
            this.nexusGroup = new THREE.Group();
            this.nexusGroup.position.set(0, 0, 0);
            this.rootGroup.add(this.nexusGroup);

            const greenTex = this.getOrCreateTexture('green', 'rgba(255,255,255,1)', 'rgba(0,230,118,0.85)', 'rgba(0,230,118,0)');

            // Outer Gyro Rings
            const gyro1Geo = new THREE.TorusGeometry(3.2, 0.065, 8, 64);
            const gyro1Mat = new THREE.MeshBasicMaterial({ color: this.currentConfig.primary, transparent: true, opacity: 0.75 });
            this.nexusGyro1 = new THREE.Mesh(gyro1Geo, gyro1Mat);
            this.nexusGyro1.rotation.x = Math.PI / 4;
            this.nexusGroup.add(this.nexusGyro1);

            const gyro2Geo = new THREE.TorusGeometry(2.4, 0.05, 8, 64);
            const gyro2Mat = new THREE.MeshBasicMaterial({ color: this.currentConfig.secondary, transparent: true, opacity: 0.8 });
            this.nexusGyro2 = new THREE.Mesh(gyro2Geo, gyro2Mat);
            this.nexusGyro2.rotation.y = -Math.PI / 3;
            this.nexusGroup.add(this.nexusGyro2);

            // Ground Plane Concentric Grid Ring
            const gyro3Geo = new THREE.TorusGeometry(3.9, 0.035, 6, 64);
            const gyro3Mat = new THREE.MeshBasicMaterial({ color: this.currentConfig.accent, transparent: true, opacity: 0.4 });
            this.nexusGyro3 = new THREE.Mesh(gyro3Geo, gyro3Mat);
            this.nexusGyro3.rotation.x = Math.PI / 2;
            this.nexusGroup.add(this.nexusGyro3);

            // Central Luminous Icosahedron Core
            const coreGeo = new THREE.IcosahedronGeometry(1.5, 1);
            const coreMat = new THREE.MeshBasicMaterial({ color: this.currentConfig.core, wireframe: true, transparent: true, opacity: 0.85 });
            this.nexusCoreMesh = new THREE.Mesh(coreGeo, coreMat);
            this.nexusGroup.add(this.nexusCoreMesh);

            // Inner solid pulsing energy sphere
            const innerGeo = new THREE.SphereGeometry(0.8, 24, 24);
            const innerMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, transparent: true, opacity: 0.95 });
            this.nexusInnerSphere = new THREE.Mesh(innerGeo, innerMat);
            this.nexusGroup.add(this.nexusInnerSphere);

            // Nexus Ambient Halo Sprite
            const haloMat = new THREE.SpriteMaterial({ map: greenTex, transparent: true, opacity: 0.85, blending: THREE.AdditiveBlending });
            this.nexusHalo = new THREE.Sprite(haloMat);
            this.nexusHalo.scale.set(7.5, 7.5, 1);
            this.nexusGroup.add(this.nexusHalo);
        }

        /**
         * 3. Right Side: Smart Consumer (Smart Building, Heat Pump, Smart Meter, Wallbox, Battery)
         */
        buildConsumerHub() {
            const THREE = this.THREE;
            this.consumerGroup = new THREE.Group();
            this.consumerGroup.position.set(9.5, 0, 0);
            this.rootGroup.add(this.consumerGroup);

            const greenTex = this.getOrCreateTexture('green', 'rgba(255,255,255,1)', 'rgba(0,230,118,0.85)', 'rgba(0,230,118,0)');
            const amberTex = this.getOrCreateTexture('amber', 'rgba(255,255,255,1)', 'rgba(255,122,0,0.85)', 'rgba(255,122,0,0)');

            // --- A. Smart Architecture Pavilion / Modern Home Frame ---
            const buildingGroup = new THREE.Group();
            const houseGeo = new THREE.BoxGeometry(3.0, 2.4, 2.6);
            const houseMat = new THREE.MeshBasicMaterial({ color: 0x00D2FF, wireframe: true, transparent: true, opacity: 0.65 });
            const houseMesh = new THREE.Mesh(houseGeo, houseMat);
            buildingGroup.add(houseMesh);

            // Sleek Roof Pitch
            const roofGeo = new THREE.ConeGeometry(2.1, 1.2, 4);
            const roofMat = new THREE.MeshBasicMaterial({ color: 0x00E676, wireframe: true, transparent: true, opacity: 0.7 });
            const roofMesh = new THREE.Mesh(roofGeo, roofMat);
            roofMesh.position.y = 1.8;
            roofMesh.rotation.y = Math.PI / 4;
            buildingGroup.add(roofMesh);

            // Foundation Grid Disc
            const baseDiscGeo = new THREE.TorusGeometry(2.4, 0.03, 6, 36);
            const baseDisc = new THREE.Mesh(baseDiscGeo, new THREE.MeshBasicMaterial({ color: 0x00D2FF, transparent: true, opacity: 0.35 }));
            baseDisc.rotation.x = Math.PI / 2;
            baseDisc.position.y = -1.2;
            buildingGroup.add(baseDisc);

            this.consumerGroup.add(buildingGroup);
            this.smartBuildingNode = { group: buildingGroup, mesh: houseMesh, roof: roofMesh };

            // --- B. Wärmepumpe Loop (Heat Pump) at (8.0, -2.4, 1.2) ---
            const hpGroup = new THREE.Group();
            hpGroup.position.set(-1.5, -2.4, 1.2); // relative to consumerGroup (9.5) -> (8.0, -2.4, 1.2)

            const hpGeo = new THREE.TorusGeometry(0.75, 0.045, 8, 32);
            const hpMat = new THREE.MeshBasicMaterial({ color: 0xFF7A00, transparent: true, opacity: 0.85 });
            const hpMesh = new THREE.Mesh(hpGeo, hpMat);
            hpGroup.add(hpMesh);

            const hpCoreGeo = new THREE.SphereGeometry(0.32, 12, 12);
            const hpCoreMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const hpCore = new THREE.Mesh(hpCoreGeo, hpCoreMat);
            hpGroup.add(hpCore);

            const hpHaloMat = new THREE.SpriteMaterial({ map: amberTex, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending });
            const hpHalo = new THREE.Sprite(hpHaloMat);
            hpHalo.scale.set(2.8, 2.8, 1);
            hpGroup.add(hpHalo);

            this.consumerGroup.add(hpGroup);
            this.heatPumpNode = { group: hpGroup, mesh: hpMesh, core: hpCore, halo: hpHalo };

            // --- C. Digitaler Stromzähler (Smart Meter Beacon) at (8.2, 0.4, 1.5) ---
            const smGroup = new THREE.Group();
            smGroup.position.set(-1.3, 0.4, 1.5); // relative to 9.5 -> 8.2

            const smPillarGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.8, 12);
            const smPillarMat = new THREE.MeshBasicMaterial({ color: 0x00E676, wireframe: true, transparent: true, opacity: 0.8 });
            const smPillar = new THREE.Mesh(smPillarGeo, smPillarMat);
            smGroup.add(smPillar);

            const smBeaconGeo = new THREE.SphereGeometry(0.16, 12, 12);
            const smBeaconMat = new THREE.MeshBasicMaterial({ color: 0xFFFFFF });
            const smBeacon = new THREE.Mesh(smBeaconGeo, smBeaconMat);
            smBeacon.position.y = 0.48;
            smGroup.add(smBeacon);

            this.consumerGroup.add(smGroup);
            this.smartMeterNode = { group: smGroup, pillar: smPillar, beacon: smBeacon, blinkTimer: 0 };

            // --- D. Wallbox (EV Charging) at (11.2, -1.2, 1.0) ---
            const wbGroup = new THREE.Group();
            wbGroup.position.set(1.7, -1.2, 1.0); // relative to 9.5 -> 11.2

            const wbRingGeo = new THREE.TorusGeometry(0.68, 0.035, 8, 32);
            const wbRingMat = new THREE.MeshBasicMaterial({ color: 0x00D2FF, transparent: true, opacity: 0.8 });
            const wbRing = new THREE.Mesh(wbRingGeo, wbRingMat);
            wbGroup.add(wbRing);

            const wbCoreGeo = new THREE.CylinderGeometry(0.24, 0.24, 0.18, 16);
            const wbCore = new THREE.Mesh(wbCoreGeo, new THREE.MeshBasicMaterial({ color: 0x00E676, wireframe: true }));
            wbGroup.add(wbCore);

            this.consumerGroup.add(wbGroup);
            this.wallboxNode = { group: wbGroup, ring: wbRing, core: wbCore };

            // --- E. Solar-Batterie (Storage Accumulator) at (9.6, 2.0, 0.8) ---
            const batGroup = new THREE.Group();
            batGroup.position.set(0.1, 2.0, 0.8); // relative to 9.5 -> 9.6

            for (let c = 0; c < 3; c++) {
                const cellGeo = new THREE.CylinderGeometry(0.38, 0.38, 0.28, 16);
                const cellMat = new THREE.MeshBasicMaterial({ color: 0x10B981, wireframe: true, transparent: true, opacity: 0.75 });
                const cell = new THREE.Mesh(cellGeo, cellMat);
                cell.position.y = (c - 1) * 0.34;
                batGroup.add(cell);
            }

            const batRingGeo = new THREE.TorusGeometry(0.6, 0.02, 6, 24);
            const batRing = new THREE.Mesh(batRingGeo, new THREE.MeshBasicMaterial({ color: 0x00E676, transparent: true, opacity: 0.6 }));
            batRing.rotation.x = Math.PI / 2;
            batRing.position.y = 0.55;
            batGroup.add(batRing);

            const batHaloMat = new THREE.SpriteMaterial({ map: greenTex, transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending });
            const batHalo = new THREE.Sprite(batHaloMat);
            batHalo.scale.set(2.4, 2.4, 1);
            batGroup.add(batHalo);

            this.consumerGroup.add(batGroup);
            this.batteryNode = { group: batGroup, halo: batHalo, ring: batRing };
        }

        /**
         * 4. Curved Spline Trajectories connecting Generation -> Nexus -> Consumer
         */
        buildFlowTrajectories() {
            const THREE = this.THREE;
            this.flowTracksGroup = new THREE.Group();
            this.rootGroup.add(this.flowTracksGroup);

            // Generation to Nexus (Indices 0, 1, 2)
            // Path 0: Hydro -> Nexus
            const curve0 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(-9.5, 3.2, 0),
                new THREE.Vector3(-6.2, 2.8, 0.8),
                new THREE.Vector3(-2.8, 1.2, 0.5),
                new THREE.Vector3(0, 0, 0)
            );

            // Path 1: Wind -> Nexus
            const curve1 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(-10.5, 0.0, 1.0),
                new THREE.Vector3(-6.5, 0.2, 0.6),
                new THREE.Vector3(-2.6, 0.0, 0.3),
                new THREE.Vector3(0, 0, 0)
            );

            // Path 2: Solar -> Nexus
            const curve2 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(-9.5, -3.2, 0),
                new THREE.Vector3(-6.2, -2.8, 0.8),
                new THREE.Vector3(-2.8, -1.2, 0.5),
                new THREE.Vector3(0, 0, 0)
            );

            // Nexus to Consumers (Indices 3, 4, 5, 6)
            // Path 3: Nexus -> Battery
            const curve3 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(3.0, 1.2, 0.5),
                new THREE.Vector3(6.5, 2.2, 0.8),
                new THREE.Vector3(9.6, 2.0, 0.8)
            );

            // Path 4: Nexus -> Smart Meter & Building
            const curve4 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(3.2, 0.1, 0.4),
                new THREE.Vector3(6.0, 0.3, 0.8),
                new THREE.Vector3(8.2, 0.4, 1.5)
            );

            // Path 5: Nexus -> Heat Pump
            const curve5 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(2.8, -1.2, 0.5),
                new THREE.Vector3(5.8, -2.2, 0.9),
                new THREE.Vector3(8.0, -2.4, 1.2)
            );

            // Path 6: Nexus -> Wallbox
            const curve6 = new THREE.CubicBezierCurve3(
                new THREE.Vector3(0, 0, 0),
                new THREE.Vector3(3.5, -0.6, 0.6),
                new THREE.Vector3(7.5, -1.0, 0.8),
                new THREE.Vector3(11.2, -1.2, 1.0)
            );

            this.curves = [curve0, curve1, curve2, curve3, curve4, curve5, curve6];

            // Render visible curved guide rail lines
            this.curveMeshes = [];
            for (let i = 0; i < this.curves.length; i++) {
                const pts = this.curves[i].getPoints(48);
                const trackGeo = new THREE.BufferGeometry().setFromPoints(pts);
                const trackMat = new THREE.LineBasicMaterial({
                    color: i < 3 ? this.currentConfig.secondary : this.currentConfig.primary,
                    transparent: true,
                    opacity: 0.35
                });
                const trackLine = new THREE.Line(trackGeo, trackMat);
                this.flowTracksGroup.add(trackLine);
                this.curveMeshes.push(trackLine);
            }
        }

        /**
         * 5. Traveling Photon Particles (Efficient single Points geometry)
         */
        buildTravelingPhotons() {
            const THREE = this.THREE;
            const count = this.photonCount;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            this.photons = [];
            const primaryColor = new THREE.Color(this.currentConfig.primary);
            const secondaryColor = new THREE.Color(this.currentConfig.secondary);

            for (let i = 0; i < count; i++) {
                // Distribute evenly among all 7 paths initially
                const pathIndex = i % this.curves.length;
                const t = (i / count + Math.random() * 0.1) % 1.0;
                const speed = 0.22 + Math.random() * 0.16;
                const jitterX = (Math.random() - 0.5) * 0.18;
                const jitterY = (Math.random() - 0.5) * 0.18;
                const jitterZ = (Math.random() - 0.5) * 0.18;

                const pt = this.curves[pathIndex].getPoint(t);
                positions[i * 3] = pt.x + jitterX;
                positions[i * 3 + 1] = pt.y + jitterY;
                positions[i * 3 + 2] = pt.z + jitterZ;

                const isSecondary = (i % 2 === 0);
                const c = isSecondary ? secondaryColor : primaryColor;
                colors[i * 3] = c.r;
                colors[i * 3 + 1] = c.g;
                colors[i * 3 + 2] = c.b;

                this.photons.push({
                    pathIndex,
                    t,
                    speed,
                    jitterX,
                    jitterY,
                    jitterZ,
                    isSecondary
                });
            }

            const geo = new THREE.BufferGeometry();
            geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

            const glowTex = this.getOrCreateTexture('photon', 'rgba(255,255,255,1)', 'rgba(0,230,118,0.9)', 'rgba(0,230,118,0)');
            const mat = new THREE.PointsMaterial({
                size: 0.75,
                map: glowTex,
                vertexColors: true,
                transparent: true,
                opacity: 0.95,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.photonsMesh = new THREE.Points(geo, mat);
            this.rootGroup.add(this.photonsMesh);
        }

        /**
         * 6. Floating Green CO2-Offset Ring Tokens (Visible for Ökogas)
         */
        buildCO2Tokens() {
            const THREE = this.THREE;
            this.co2Tokens = [];
            const tokenGeo = new THREE.TorusGeometry(0.38, 0.032, 6, 24);
            const tokenMat = new THREE.MeshBasicMaterial({
                color: 0x00E676,
                transparent: true,
                opacity: this.currentConfig.gasTokens ? 0.85 : 0.0
            });

            for (let i = 0; i < 8; i++) {
                const mesh = new THREE.Mesh(tokenGeo, tokenMat.clone());
                const angle = (i * Math.PI * 2) / 8;
                const radius = 4.2 + (i % 3) * 0.8;
                mesh.position.set(Math.cos(angle) * radius, Math.sin(angle) * 1.5, Math.sin(angle * 2) * 1.2);
                this.rootGroup.add(mesh);
                this.co2Tokens.push({
                    mesh,
                    baseAngle: angle,
                    radius,
                    speed: 0.4 + (i % 4) * 0.15
                });
            }
        }

        /**
         * 7. Interactive Radial Shockwave Rings (Pulse burst)
         */
        buildBurstRings() {
            const THREE = this.THREE;
            this.burstRings = [];

            for (let i = 0; i < 3; i++) {
                const ringGeo = new THREE.RingGeometry(0.8, 0.95, 48);
                const ringMat = new THREE.MeshBasicMaterial({
                    color: this.currentConfig.primary,
                    transparent: true,
                    opacity: 0,
                    side: THREE.DoubleSide
                });
                const mesh = new THREE.Mesh(ringGeo, ringMat);
                mesh.position.set(0, 0, 0);
                mesh.visible = false;
                this.rootGroup.add(mesh);

                this.burstRings.push({
                    mesh,
                    active: false,
                    progress: 0,
                    delay: i * 0.14
                });
            }
        }

        /**
         * 8. Ambient Energy Dust Parallax Particles
         */
        buildAmbientDust() {
            const THREE = this.THREE;
            const dustCount = 120;
            const dustPositions = new Float32Array(dustCount * 3);

            for (let i = 0; i < dustCount; i++) {
                dustPositions[i * 3] = (Math.random() - 0.5) * 38;
                dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 22;
                dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 16 - 2;
            }

            const dustGeo = new THREE.BufferGeometry();
            dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));

            const dustTex = this.getOrCreateTexture('dust', 'rgba(255,255,255,1)', 'rgba(0,210,255,0.6)', 'rgba(0,210,255,0)');
            const dustMat = new THREE.PointsMaterial({
                size: 0.4,
                map: dustTex,
                color: 0x38BDF8,
                transparent: true,
                opacity: 0.45,
                blending: THREE.AdditiveBlending,
                depthWrite: false
            });

            this.ambientParticles = new THREE.Points(dustGeo, dustMat);
            this.rootGroup.add(this.ambientParticles);
        }

        /**
         * Update consumption scaling
         */
        updateConsumptionScaling() {
            // Normalize: 1500 kWh -> ~0.75x, 3500 kWh -> ~1.20x, 4500 kWh -> ~1.48x, 10000+ kWh -> ~2.8x
            const normalized = Math.max(0, (this.consumption - 1000) / 4000);
            this.consumptionSpeedMultiplier = 0.65 + Math.min(normalized, 3.2) * 0.75;

            // Density: Active photon count
            this.activePhotonCount = Math.min(this.photonCount, Math.floor(65 + (this.consumption / 6500) * 55));
        }

        /**
         * Public API: Dynamic Consumption Scaling (kWh)
         * @param {number|string} kwh
         */
        setConsumption(kwh) {
            const val = typeof kwh === 'number' ? kwh : parseFloat(kwh);
            if (!isNaN(val) && val > 0) {
                this.consumption = Math.max(500, Math.min(val, 50000));
                this.updateConsumptionScaling();

                if (this.container && typeof CustomEvent !== 'undefined') {
                    this.container.dispatchEvent(new CustomEvent('alphathree:consumption-changed', {
                        detail: { consumption: this.consumption, speedMultiplier: this.consumptionSpeedMultiplier }
                    }));
                }
            }
        }

        /**
         * Public API: Product Mode Switching ('strom' | 'waerme' | 'gas')
         * @param {string} rawMode
         */
        setMode(rawMode) {
            this.currentMode = this.normalizeMode(rawMode);
            this.currentConfig = this.modes[this.currentMode];
            this.applyModeStyles();
        }

        /**
         * Synchronize materials and colors to current mode
         */
        applyModeStyles() {
            const THREE = this.THREE;
            if (!THREE || !this.currentConfig) return;

            const cfg = this.currentConfig;
            const primaryColor = new THREE.Color(cfg.primary);
            const secondaryColor = new THREE.Color(cfg.secondary);

            // 1. Point Light
            if (this.corePointLight) {
                this.corePointLight.color.setHex(cfg.light);
                this.corePointLight.intensity = cfg.lightIntensity;
            }

            // 2. Nexus Gyro Rings & Core
            if (this.nexusGyro1) this.nexusGyro1.material.color.setHex(cfg.primary);
            if (this.nexusGyro2) this.nexusGyro2.material.color.setHex(cfg.secondary);
            if (this.nexusGyro3) this.nexusGyro3.material.color.setHex(cfg.accent);
            if (this.nexusCoreMesh) this.nexusCoreMesh.material.color.setHex(cfg.core);

            // 3. Flow Rails Colors
            for (let i = 0; i < this.curveMeshes.length; i++) {
                const mesh = this.curveMeshes[i];
                if (mesh && mesh.material) {
                    mesh.material.color.setHex(i < 3 ? cfg.secondary : cfg.primary);
                    mesh.material.opacity = (this.currentMode === 'waerme' && i === 5) ? 0.75 : 0.35;
                }
            }

            // 4. Update Photons Colors in BufferAttribute
            if (this.photonsMesh && this.photonsMesh.geometry.attributes.color) {
                const colors = this.photonsMesh.geometry.attributes.color.array;
                for (let i = 0; i < this.photons.length; i++) {
                    const isSecondary = this.photons[i].isSecondary;
                    const c = isSecondary ? secondaryColor : primaryColor;
                    colors[i * 3] = c.r;
                    colors[i * 3 + 1] = c.g;
                    colors[i * 3 + 2] = c.b;
                }
                this.photonsMesh.geometry.attributes.color.needsUpdate = true;
            }

            // 5. Heat Pump special thermal wave highlight in 'waerme' mode
            if (this.heatPumpNode) {
                const isWaerme = cfg.thermalGlow;
                this.heatPumpNode.mesh.scale.set(isWaerme ? 1.4 : 1.0, isWaerme ? 1.4 : 1.0, isWaerme ? 1.4 : 1.0);
                this.heatPumpNode.mesh.material.color.setHex(isWaerme ? 0xFF7A00 : 0x10B981);
                if (this.heatPumpNode.halo) {
                    this.heatPumpNode.halo.scale.set(isWaerme ? 4.2 : 2.8, isWaerme ? 4.2 : 2.8, 1);
                    this.heatPumpNode.halo.material.opacity = isWaerme ? 0.95 : 0.6;
                }
            }

            // 6. CO2-Offset Ring Tokens in 'gas' mode
            for (let i = 0; i < this.co2Tokens.length; i++) {
                const t = this.co2Tokens[i];
                if (t.mesh && t.mesh.material) {
                    t.mesh.material.opacity = cfg.gasTokens ? 0.85 : 0.08;
                    t.mesh.visible = cfg.gasTokens || true;
                }
            }

            // 7. Shockwave Ring Colors
            for (let i = 0; i < this.burstRings.length; i++) {
                const r = this.burstRings[i];
                if (r.mesh && r.mesh.material) {
                    r.mesh.material.color.setHex(cfg.primary);
                }
            }
        }

        /**
         * Public API: Trigger Radial Shockwave Pulse Burst
         */
        pulseBurst() {
            this.burstTime = 0.001;
            this.burstVelocityBoost = 2.4;

            for (let i = 0; i < this.burstRings.length; i++) {
                const ring = this.burstRings[i];
                ring.active = true;
                ring.progress = -ring.delay;
                ring.mesh.visible = true;
                ring.mesh.scale.set(0.5, 0.5, 1);
            }

            if (this.corePointLight) {
                this.corePointLight.intensity = this.currentConfig.lightIntensity * 2.2;
            }
        }

        pulse() {
            this.pulseBurst();
        }

        setSpeed(factor) {
            this.speed = Math.max(0.1, Math.min(factor, 5.0));
        }

        onPointerMove(x, y) {
            this.targetRotationY = x * 0.4;
            this.targetRotationX = -y * 0.25;
        }

        onPointerClick() {
            this.pulseBurst();
        }

        /**
         * Animation Render Loop Frame Update
         */
        update(delta, elapsed, pointer) {
            if (this.disposed || !this.rootGroup) return;

            const speed = this.speed;
            const consumptionMultiplier = this.consumptionSpeedMultiplier;

            // 1. Smooth Pointer Parallax & Subtle Ambient Flow Drift
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
            this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;

            this.rootGroup.rotation.y = (elapsed * 0.04 * speed) + this.currentRotationY;
            this.rootGroup.rotation.x = Math.sin(elapsed * 0.06 * speed) * 0.04 + this.currentRotationX;

            // 2. Generation Hubs Animations
            // Hydro ripple wave oscillation
            if (this.hydroNode) {
                this.hydroNode.mesh.rotation.y += delta * 0.6 * speed;
                this.hydroNode.mesh.rotation.z += delta * 0.4 * speed;
                const rip1Scale = 1.0 + Math.sin(elapsed * 2.5 * speed) * 0.18;
                const rip2Scale = 1.0 + Math.cos(elapsed * 2.0 * speed) * 0.22;
                this.hydroNode.ripple1.scale.set(rip1Scale, rip1Scale, 1);
                this.hydroNode.ripple2.scale.set(rip2Scale, rip2Scale, 1);
            }

            // Wind turbine rotor blades rotation
            if (this.windNode && this.windNode.rotor) {
                this.windNode.rotor.rotation.z += delta * 2.8 * speed;
                this.windNode.mesh.rotation.y += delta * 0.5 * speed;
            }

            // Solar ray pulsation
            if (this.solarNode) {
                this.solarNode.mesh.rotation.z += delta * 0.4 * speed;
                const solarPulse = 1.0 + Math.sin(elapsed * 3.0 * speed) * 0.12;
                this.solarNode.core.scale.set(solarPulse, solarPulse, solarPulse);
                if (this.solarNode.ring) {
                    this.solarNode.ring.rotation.z -= delta * 0.5 * speed;
                }
            }

            // 3. Alpha Grid Nexus (Center) Gyro & Core Rotations
            if (this.nexusGyro1 && this.nexusGyro2) {
                this.nexusGyro1.rotation.y += delta * 0.65 * speed * consumptionMultiplier;
                this.nexusGyro1.rotation.x += delta * 0.35 * speed;

                this.nexusGyro2.rotation.z -= delta * 0.75 * speed * consumptionMultiplier;
                this.nexusGyro2.rotation.x += delta * 0.45 * speed;

                this.nexusGyro3.rotation.z += delta * 0.25 * speed;

                if (this.nexusCoreMesh) {
                    this.nexusCoreMesh.rotation.x += delta * 0.5 * speed;
                    this.nexusCoreMesh.rotation.y += delta * 0.7 * speed;
                }

                // Breathing inner energy core
                if (this.nexusInnerSphere) {
                    const coreScale = 1.0 + Math.sin(elapsed * 3.8 * speed) * 0.14;
                    this.nexusInnerSphere.scale.set(coreScale, coreScale, coreScale);
                }

                // Nexus Halo breathing
                if (this.nexusHalo) {
                    const haloScale = 7.5 + Math.sin(elapsed * 2.6 * speed) * 0.8;
                    this.nexusHalo.scale.set(haloScale, haloScale, 1);
                }
            }

            // 4. Consumer Components Animation
            // Smart Meter Gateway periodic data pulse blinks
            if (this.smartMeterNode && this.smartMeterNode.beacon) {
                this.smartMeterNode.blinkTimer += delta;
                if (this.smartMeterNode.blinkTimer > 0.85) {
                    this.smartMeterNode.blinkTimer = 0;
                    this.smartMeterNode.beacon.scale.set(1.6, 1.6, 1.6);
                } else {
                    const curr = this.smartMeterNode.beacon.scale.x;
                    const next = Math.max(1.0, curr - delta * 3.0);
                    this.smartMeterNode.beacon.scale.set(next, next, next);
                }
            }

            // Heat Pump thermal pulse wave
            if (this.heatPumpNode) {
                this.heatPumpNode.mesh.rotation.z += delta * (this.currentConfig.thermalGlow ? 1.8 : 0.8) * speed;
                const hpPulse = 1.0 + Math.sin(elapsed * (this.currentConfig.thermalGlow ? 4.5 : 2.5) * speed) * 0.2;
                this.heatPumpNode.core.scale.set(hpPulse, hpPulse, hpPulse);
            }

            // Wallbox EV charging halo rotation
            if (this.wallboxNode && this.wallboxNode.ring) {
                this.wallboxNode.ring.rotation.z -= delta * 1.5 * speed;
                this.wallboxNode.core.rotation.y += delta * 1.0 * speed;
            }

            // Battery pulse
            if (this.batteryNode && this.batteryNode.ring) {
                this.batteryNode.ring.rotation.z += delta * 0.8 * speed;
            }

            // 5. Traveling Photon Particles Along Curved Trajectories
            if (this.photonsMesh && this.photonsMesh.geometry.attributes.position) {
                const pos = this.photonsMesh.geometry.attributes.position.array;
                const totalActive = this.activePhotonCount;
                const effectiveSpeed = speed * consumptionMultiplier * this.burstVelocityBoost;

                for (let i = 0; i < this.photons.length; i++) {
                    const p = this.photons[i];

                    if (i >= totalActive) {
                        // Move inactive photons out of camera view
                        pos[i * 3 + 2] = -9999;
                        continue;
                    }

                    p.t += delta * p.speed * effectiveSpeed;

                    if (p.t >= 1.0) {
                        p.t = 0;
                        // Transition logic: Erzeugung (0..2) -> Nexus -> Consumer (3..6) -> loop
                        if (p.pathIndex < 3) {
                            // Route into one of consumer paths
                            p.pathIndex = 3 + Math.floor(Math.random() * 4);
                        } else {
                            // Route back to one of generation feeder lines
                            p.pathIndex = Math.floor(Math.random() * 3);
                        }
                    }

                    const curve = this.curves[p.pathIndex];
                    const pt = curve.getPoint(p.t);

                    pos[i * 3] = pt.x + p.jitterX;
                    pos[i * 3 + 1] = pt.y + p.jitterY;
                    pos[i * 3 + 2] = pt.z + p.jitterZ;
                }

                this.photonsMesh.geometry.attributes.position.needsUpdate = true;
            }

            // Decay burst velocity boost back to 1.0
            if (this.burstVelocityBoost > 1.0) {
                this.burstVelocityBoost += (1.0 - this.burstVelocityBoost) * delta * 2.2;
                if (this.burstVelocityBoost < 1.02) this.burstVelocityBoost = 1.0;
            }

            // Decay Point Light intensity after burst
            if (this.corePointLight && this.corePointLight.intensity > this.currentConfig.lightIntensity) {
                this.corePointLight.intensity += (this.currentConfig.lightIntensity - this.corePointLight.intensity) * delta * 2.5;
            }

            // 6. Floating CO2-Offset Ring Tokens Orbiting
            if (this.co2Tokens.length > 0) {
                for (let i = 0; i < this.co2Tokens.length; i++) {
                    const token = this.co2Tokens[i];
                    const curAngle = token.baseAngle + elapsed * token.speed * speed;
                    token.mesh.position.x = Math.cos(curAngle) * token.radius;
                    token.mesh.position.y = Math.sin(curAngle * 1.5) * 1.6;
                    token.mesh.position.z = Math.sin(curAngle * 2.0) * 1.4;
                    token.mesh.rotation.x += delta * 1.2 * speed;
                    token.mesh.rotation.y += delta * 1.5 * speed;
                }
            }

            // 7. Shockwave Burst Rings Expansion & Fade
            for (let i = 0; i < this.burstRings.length; i++) {
                const ring = this.burstRings[i];
                if (ring.active) {
                    ring.progress += delta * 1.45 * speed;
                    if (ring.progress > 0) {
                        const p = ring.progress;
                        if (p >= 1.0) {
                            ring.active = false;
                            ring.mesh.visible = false;
                        } else {
                            const scale = 0.5 + p * 20.0;
                            ring.mesh.scale.set(scale, scale, 1);
                            ring.mesh.material.opacity = (1.0 - p) * 0.85;
                        }
                    }
                }
            }

            // 8. Ambient Dust Floating Drift
            if (this.ambientParticles) {
                this.ambientParticles.rotation.y = elapsed * 0.015 * speed;
                this.ambientParticles.rotation.x = Math.sin(elapsed * 0.01 * speed) * 0.03;
            }
        }

        /**
         * Comprehensive Memory Teardown & Resource Disposal
         */
        dispose() {
            super.dispose();

            // Dispose procedural canvas textures
            for (const key of Object.keys(this.glowTextures)) {
                const tex = this.glowTextures[key];
                if (tex && typeof tex.dispose === 'function') {
                    tex.dispose();
                }
            }
            this.glowTextures = {};

            // Remove groups and clear references
            if (this.rootGroup && this.scene) {
                this.scene.remove(this.rootGroup);
                this.rootGroup = null;
            }

            this.curves = [];
            this.curveMeshes = [];
            this.photons = [];
            this.co2Tokens = [];
            this.burstRings = [];
        }
    }

    return VersorgerFlowScene;
}));

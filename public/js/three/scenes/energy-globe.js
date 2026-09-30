/**
 * Alpha Energie GmbH - 3D Energy Globe Scene
 * Wireframe eco-grid globe with latitude/longitude energy lines, renewable energy beacon hubs,
 * glowing orbital rings, dynamic atmospheric particle field, and inertia drag.
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
            root.AlphaThree.registerScene('energy-globe', SceneClass);
        }
        root.AlphaEnergyGlobeScene = SceneClass;
    }
}(typeof self !== 'undefined' ? self : this, function (AlphaThreeManager) {
    'use strict';

    const BaseClass = AlphaThreeManager.ThreeSceneBase || class {};

    class EnergyGlobeScene extends BaseClass {
        constructor(container, options = {}) {
            super(container, options);

            this.speed = this.options.speed !== undefined ? this.options.speed : 1.0;
            this.radius = this.options.globeRadius || 8.5;

            // Brand Colors
            this.colors = {
                greenNeon: 0x00E676,
                cyanElectric: 0x00D2FF,
                emerald: 0x10B981,
                darkNavy: 0x0B132B,
                lightBeam: 0x38BDF8
            };

            this.rootGroup = null;
            this.globeGroup = null;
            this.ringsGroup = null;
            this.hubs = [];
            this.orbitPulses = [];
            this.atmosphereParticles = null;

            // Drag & Inertia state
            this.isDragging = false;
            this.previousMousePosition = { x: 0, y: 0 };
            this.rotationVelocity = { x: 0, y: 0.005 };
            this.dampingFactor = 0.95;

            this.boundOnPointerDown = this.handlePointerDown.bind(this);
            this.boundOnPointerUp = this.handlePointerUp.bind(this);
            this.boundOnPointerMoveDrag = this.handlePointerMoveDrag.bind(this);
        }

        init(THREE, scene, camera, renderer) {
            super.init(THREE, scene, camera, renderer);

            this.rootGroup = new THREE.Group();
            this.scene.add(this.rootGroup);

            this.globeGroup = new THREE.Group();
            this.rootGroup.add(this.globeGroup);

            // 1. Globe Core & Geodesic Wireframe
            this.buildGlobeMesh();

            // 2. Latitude & Longitude Energy Meridian Rings
            this.buildMeridians();

            // 3. Renewable Energy Hubs & Light Beams
            this.buildHubs();

            // 4. Orbital Energy Rings with Photons
            this.buildOrbitalRings();

            // 5. Atmospheric Energy Dust
            this.buildAtmosphere();

            // Camera setup
            this.camera.position.set(0, 0, this.options.cameraZ || 24);
            this.camera.lookAt(0, 0, 0);

            // Setup custom drag interaction
            this.setupDragListeners();
        }

        setupDragListeners() {
            if (!this.options.interactive) return;

            const target = this.container;
            target.addEventListener('mousedown', this.boundOnPointerDown);
            window.addEventListener('mouseup', this.boundOnPointerUp);
            window.addEventListener('mousemove', this.boundOnPointerMoveDrag);

            // Touch
            target.addEventListener('touchstart', (e) => {
                if (e.touches.length === 1) {
                    this.handlePointerDown(e.touches[0]);
                }
            }, { passive: true });
            window.addEventListener('touchend', this.boundOnPointerUp, { passive: true });
            window.addEventListener('touchmove', (e) => {
                if (e.touches.length === 1 && this.isDragging) {
                    this.handlePointerMoveDrag(e.touches[0]);
                }
            }, { passive: true });
        }

        handlePointerDown(e) {
            this.isDragging = true;
            this.previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }

        handlePointerUp() {
            this.isDragging = false;
        }

        handlePointerMoveDrag(e) {
            if (!this.isDragging) return;

            const deltaX = e.clientX - this.previousMousePosition.x;
            const deltaY = e.clientY - this.previousMousePosition.y;

            this.rotationVelocity.y = deltaX * 0.005;
            this.rotationVelocity.x = deltaY * 0.005;

            this.globeGroup.rotation.y += this.rotationVelocity.y;
            this.globeGroup.rotation.x += this.rotationVelocity.x;

            this.previousMousePosition = {
                x: e.clientX,
                y: e.clientY
            };
        }

        createGlowTexture(size = 64) {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const center = size / 2;
            const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.3, 'rgba(0, 210, 255, 0.8)');
            grad.addColorStop(0.6, 'rgba(0, 230, 118, 0.3)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);

            return new this.THREE.CanvasTexture(canvas);
        }

        buildGlobeMesh() {
            const R = this.radius;

            // Inner dark sphere to occlude backface lines
            const innerGeo = new this.THREE.SphereGeometry(R * 0.985, 32, 32);
            const innerMat = new this.THREE.MeshBasicMaterial({
                color: this.colors.darkNavy,
                transparent: true,
                opacity: 0.88
            });
            const innerSphere = new this.THREE.Mesh(innerGeo, innerMat);
            this.globeGroup.add(innerSphere);

            // Outer Wireframe Geodesic Icosahedron
            const icoGeo = new this.THREE.IcosahedronGeometry(R, 3);
            const icoMat = new this.THREE.MeshBasicMaterial({
                color: this.colors.greenNeon,
                wireframe: true,
                transparent: true,
                opacity: 0.22,
                blending: this.THREE.AdditiveBlending
            });
            this.wireframeMesh = new this.THREE.Mesh(icoGeo, icoMat);
            this.globeGroup.add(this.wireframeMesh);
        }

        buildMeridians() {
            const R = this.radius * 1.002;
            const segments = 64;

            // Latitude rings
            const latitudes = [-60, -30, 0, 30, 60];
            latitudes.forEach(lat => {
                const phi = (lat * Math.PI) / 180;
                const r = R * Math.cos(phi);
                const y = R * Math.sin(phi);

                const points = [];
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    points.push(new this.THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta)));
                }

                const geo = new this.THREE.BufferGeometry().setFromPoints(points);
                const mat = new this.THREE.LineBasicMaterial({
                    color: lat === 0 ? this.colors.greenNeon : this.colors.cyanElectric,
                    transparent: true,
                    opacity: lat === 0 ? 0.6 : 0.35,
                    blending: this.THREE.AdditiveBlending
                });
                const line = new this.THREE.Line(geo, mat);
                this.globeGroup.add(line);
            });

            // Longitude rings (Meridians)
            const longitudes = [0, 45, 90, 135];
            longitudes.forEach(lon => {
                const points = [];
                for (let i = 0; i <= segments; i++) {
                    const theta = (i / segments) * Math.PI * 2;
                    points.push(new this.THREE.Vector3(
                        R * Math.sin(theta) * Math.cos((lon * Math.PI) / 180),
                        R * Math.cos(theta),
                        R * Math.sin(theta) * Math.sin((lon * Math.PI) / 180)
                    ));
                }

                const geo = new this.THREE.BufferGeometry().setFromPoints(points);
                const mat = new this.THREE.LineBasicMaterial({
                    color: this.colors.cyanElectric,
                    transparent: true,
                    opacity: 0.3,
                    blending: this.THREE.AdditiveBlending
                });
                const line = new this.THREE.Line(geo, mat);
                this.globeGroup.add(line);
            });
        }

        buildHubs() {
            const R = this.radius;
            const glowTex = this.createGlowTexture(64);

            // Representing renewable energy epicenters (Frankfurt, Berlin, North Sea, etc.)
            const coordinates = [
                { name: 'Frankfurt Central', lat: 50.11, lon: 8.68, type: 'hq', color: this.colors.greenNeon },
                { name: 'Berlin Solar Park', lat: 52.52, lon: 13.40, type: 'solar', color: this.colors.greenNeon },
                { name: 'North Sea Wind Grid', lat: 54.50, lon: 7.50, type: 'wind', color: this.colors.cyanElectric },
                { name: 'Munich Storage Nexus', lat: 48.13, lon: 11.58, type: 'storage', color: this.colors.emerald },
                { name: 'Hamburg Port Power', lat: 53.55, lon: 9.99, type: 'wind', color: this.colors.cyanElectric },
                { name: 'Stuttgart Eco Cluster', lat: 48.77, lon: 9.18, type: 'solar', color: this.colors.greenNeon },
                { name: 'Alpine Hydro Nexus', lat: 47.26, lon: 11.39, type: 'storage', color: this.colors.cyanElectric },
                { name: 'Iberian Solar Hub', lat: 40.41, lon: -3.70, type: 'solar', color: this.colors.greenNeon },
                { name: 'Nordic Offshore Array', lat: 58.96, lon: 5.73, type: 'wind', color: this.colors.cyanElectric }
            ];

            coordinates.forEach(coord => {
                const phi = (90 - coord.lat) * (Math.PI / 180);
                const theta = (coord.lon + 180) * (Math.PI / 180);

                const x = -(R * Math.sin(phi) * Math.cos(theta));
                const z = (R * Math.sin(phi) * Math.sin(theta));
                const y = (R * Math.cos(phi));

                const pos = new this.THREE.Vector3(x, y, z);
                const normal = pos.clone().normalize();

                // Surface Beacon Dot
                const dotGeo = new this.THREE.SphereGeometry(0.28, 12, 12);
                const dotMat = new this.THREE.MeshBasicMaterial({ color: coord.color });
                const dotMesh = new this.THREE.Mesh(dotGeo, dotMat);
                dotMesh.position.copy(pos);
                this.globeGroup.add(dotMesh);

                // Glowing Halo
                let halo = null;
                if (glowTex) {
                    const spriteMat = new this.THREE.SpriteMaterial({
                        map: glowTex,
                        color: coord.color,
                        transparent: true,
                        opacity: 0.85,
                        blending: this.THREE.AdditiveBlending,
                        depthWrite: false
                    });
                    halo = new this.THREE.Sprite(spriteMat);
                    halo.position.copy(pos);
                    halo.scale.set(1.4, 1.4, 1);
                    this.globeGroup.add(halo);
                }

                // Vertical Light Pillar / Beam pointing outward
                const beamLength = 2.2;
                const beamPoints = [
                    pos,
                    pos.clone().add(normal.clone().multiplyScalar(beamLength))
                ];
                const beamGeo = new this.THREE.BufferGeometry().setFromPoints(beamPoints);
                const beamMat = new this.THREE.LineBasicMaterial({
                    color: coord.color,
                    transparent: true,
                    opacity: 0.8,
                    blending: this.THREE.AdditiveBlending
                });
                const beamLine = new this.THREE.Line(beamGeo, beamMat);
                this.globeGroup.add(beamLine);

                this.hubs.push({
                    name: coord.name,
                    position: pos,
                    dotMesh,
                    halo,
                    beamLine,
                    color: coord.color,
                    pulseSpeed: 1.8 + Math.random() * 1.5
                });
            });
        }

        buildOrbitalRings() {
            this.ringsGroup = new this.THREE.Group();
            this.rootGroup.add(this.ringsGroup);

            const R = this.radius;

            // 1. Equatorial Orbit Ring
            const ringGeo1 = new this.THREE.RingGeometry(R * 1.35, R * 1.38, 64);
            const ringMat1 = new this.THREE.MeshBasicMaterial({
                color: this.colors.cyanElectric,
                side: this.THREE.DoubleSide,
                transparent: true,
                opacity: 0.45,
                blending: this.THREE.AdditiveBlending
            });
            this.ring1 = new this.THREE.Mesh(ringGeo1, ringMat1);
            this.ring1.rotation.x = Math.PI / 2.3;
            this.ringsGroup.add(this.ring1);

            // 2. Tilted Orbit Ring
            const ringGeo2 = new this.THREE.RingGeometry(R * 1.5, R * 1.52, 64);
            const ringMat2 = new this.THREE.MeshBasicMaterial({
                color: this.colors.greenNeon,
                side: this.THREE.DoubleSide,
                transparent: true,
                opacity: 0.35,
                blending: this.THREE.AdditiveBlending
            });
            this.ring2 = new this.THREE.Mesh(ringGeo2, ringMat2);
            this.ring2.rotation.x = -Math.PI / 3;
            this.ring2.rotation.y = Math.PI / 5;
            this.ringsGroup.add(this.ring2);

            // Orbiting Photons on the rings
            const glowTex = this.createGlowTexture(48);
            const photonCount = 18;
            this.orbitPulses = [];

            for (let i = 0; i < photonCount; i++) {
                const ringIndex = i % 2;
                const targetRadius = ringIndex === 0 ? R * 1.365 : R * 1.51;
                const angle = (i / photonCount) * Math.PI * 2;

                let sprite = null;
                if (glowTex) {
                    const mat = new this.THREE.SpriteMaterial({
                        map: glowTex,
                        color: ringIndex === 0 ? this.colors.cyanElectric : this.colors.greenNeon,
                        transparent: true,
                        opacity: 0.9,
                        blending: this.THREE.AdditiveBlending,
                        depthWrite: false
                    });
                    sprite = new this.THREE.Sprite(mat);
                    sprite.scale.set(1.2, 1.2, 1);
                    (ringIndex === 0 ? this.ring1 : this.ring2).add(sprite);
                }

                this.orbitPulses.push({
                    sprite,
                    ringIndex,
                    radius: targetRadius,
                    angle,
                    speed: 0.5 + Math.random() * 0.4
                });
            }
        }

        buildAtmosphere() {
            const count = 300;
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            const c1 = new this.THREE.Color(this.colors.greenNeon);
            const c2 = new this.THREE.Color(this.colors.cyanElectric);
            const temp = new this.THREE.Color();

            for (let i = 0; i < count; i++) {
                const r = this.radius * (1.1 + Math.random() * 0.9);
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);

                temp.copy(c1).lerp(c2, Math.random());
                colors[i * 3] = temp.r;
                colors[i * 3 + 1] = temp.g;
                colors[i * 3 + 2] = temp.b;
            }

            const geo = new this.THREE.BufferGeometry();
            geo.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
            geo.setAttribute('color', new this.THREE.BufferAttribute(colors, 3));

            const glowTex = this.createGlowTexture(32);
            const mat = new this.THREE.PointsMaterial({
                size: 0.65,
                map: glowTex,
                vertexColors: true,
                transparent: true,
                opacity: 0.5,
                blending: this.THREE.AdditiveBlending,
                depthWrite: false
            });

            this.atmosphereParticles = new this.THREE.Points(geo, mat);
            this.rootGroup.add(this.atmosphereParticles);
        }

        pulse() {
            this.hubs.forEach(hub => {
                if (hub.halo) hub.halo.scale.set(3.0, 3.0, 1);
            });
        }

        setSpeed(factor) {
            this.speed = Math.max(0.1, Math.min(factor, 5.0));
        }

        update(delta, elapsed, pointer) {
            if (this.disposed || !this.globeGroup) return;

            const speed = this.speed;

            // Apply inertia / auto-spin when not dragging
            if (!this.isDragging) {
                this.rotationVelocity.y *= this.dampingFactor;
                this.rotationVelocity.x *= this.dampingFactor;

                // Steady natural rotation
                this.globeGroup.rotation.y += (0.0035 * speed) + this.rotationVelocity.y;
                this.globeGroup.rotation.x += this.rotationVelocity.x;
            }

            // Gentle Root Parallax from pointer
            this.rootGroup.rotation.y = pointer.x * 0.25;
            this.rootGroup.rotation.x = -pointer.y * 0.2;

            // Wireframe mesh subtle breathing
            if (this.wireframeMesh) {
                const wireScale = 1.0 + Math.sin(elapsed * 1.5 * speed) * 0.008;
                this.wireframeMesh.scale.set(wireScale, wireScale, wireScale);
            }

            // Hub beacon pulsations
            for (let i = 0; i < this.hubs.length; i++) {
                const hub = this.hubs[i];
                const pulse = 1.0 + Math.sin(elapsed * hub.pulseSpeed * speed + i) * 0.25;

                if (hub.halo) {
                    hub.halo.scale.set(1.4 * pulse, 1.4 * pulse, 1);
                }
            }

            // Orbiting photon positions
            for (let i = 0; i < this.orbitPulses.length; i++) {
                const p = this.orbitPulses[i];
                p.angle += delta * p.speed * speed;

                if (p.sprite) {
                    const x = p.radius * Math.cos(p.angle);
                    const y = p.radius * Math.sin(p.angle);
                    p.sprite.position.set(x, y, 0);
                }
            }

            // Atmospheric particle spin
            if (this.atmosphereParticles) {
                this.atmosphereParticles.rotation.y = -elapsed * 0.03 * speed;
            }
        }

        dispose() {
            window.removeEventListener('mouseup', this.boundOnPointerUp);
            window.removeEventListener('mousemove', this.boundOnPointerMoveDrag);
            window.removeEventListener('touchend', this.boundOnPointerUp);
            window.removeEventListener('touchmove', this.boundOnPointerMoveDrag);
            super.dispose();
        }
    }

    return EnergyGlobeScene;
}));

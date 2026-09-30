/**
 * Alpha Energie GmbH - 3D Energy Network Scene
 * High-tech interconnected smart grid with solar, wind, and storage hubs,
 * traveling energy photons, dynamic central nexus, and interactive controls.
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
            root.AlphaThree.registerScene('energy-network', SceneClass);
        } else if (ManagerModule.ThreeManager) {
            // SceneClass will be registered when AlphaThree initializes
        }
        root.AlphaEnergyNetworkScene = SceneClass;
    }
}(typeof self !== 'undefined' ? self : this, function (AlphaThreeManager) {
    'use strict';

    const BaseClass = AlphaThreeManager.ThreeSceneBase || class {};

    class EnergyNetworkScene extends BaseClass {
        constructor(container, options = {}) {
            super(container, options);

            this.mode = this.options.mode || 'balanced'; // 'solar' | 'wind' | 'grid' | 'balanced'
            this.speed = this.options.speed !== undefined ? this.options.speed : 1.0;
            this.particleMultiplier = this.options.particleMultiplier || 1.0;

            // Brand Colors
            this.colors = {
                solar: 0x00E676,      // Eco Neon Green
                wind: 0x00D2FF,       // Electric Cyan
                storage: 0x10B981,    // Emerald Green
                consumer: 0x38BDF8,   // Crisp Sky Blue
                core: 0x00E676,       // Central Nexus
                lineDefault: 0x00D2FF,
                lineActive: 0x00E676
            };

            // Scene 3D objects
            this.rootGroup = null;
            this.coreGroup = null;
            this.linesMesh = null;
            this.nodesGroup = null;
            this.pulsesMesh = null;
            this.ambientParticles = null;
            this.burstRings = [];

            // Node & Edge Data structures
            this.nodes = [];
            this.edges = [];
            this.pulses = [];

            // Interactive state
            this.targetRotationY = 0;
            this.targetRotationX = 0;
            this.currentRotationY = 0;
            this.currentRotationX = 0;
            this.burstTime = 0;
        }

        init(THREE, scene, camera, renderer) {
            super.init(THREE, scene, camera, renderer);

            this.rootGroup = new THREE.Group();
            this.scene.add(this.rootGroup);

            // 1. Central Energy Nexus Core
            this.buildCore();

            // 2. 3D Nodes Network
            this.buildNodes();

            // 3. Network Connection Lines
            this.buildConnections();

            // 4. Traveling Energy Photons / Pulses
            this.buildEnergyPulses();

            // 5. Ambient Floating Energy Field
            this.buildAmbientField();

            // 6. Burst Shockwave Rings
            this.buildBurstRings();

            // Setup camera position & orientation
            this.camera.position.set(0, 2, this.options.cameraZ || 26);
            this.camera.lookAt(0, 0, 0);

            // Lighting
            const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
            this.scene.add(ambientLight);

            const corePointLight = new THREE.PointLight(this.colors.solar, 2.5, 45);
            corePointLight.position.set(0, 0, 0);
            this.rootGroup.add(corePointLight);
            this.corePointLight = corePointLight;
        }

        /**
         * Create glowing procedural canvas texture
         */
        createGlowTexture(size = 64, inner = 'rgba(255, 255, 255, 1)', outer = 'rgba(0, 230, 118, 0)') {
            if (typeof document === 'undefined') return null;
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');
            const center = size / 2;
            const grad = ctx.createRadialGradient(center, center, 0, center, center, center);
            grad.addColorStop(0, inner);
            grad.addColorStop(0.25, 'rgba(0, 230, 118, 0.85)');
            grad.addColorStop(0.55, 'rgba(0, 210, 255, 0.35)');
            grad.addColorStop(1, outer);
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);

            const tex = new this.THREE.CanvasTexture(canvas);
            tex.needsUpdate = true;
            return tex;
        }

        buildCore() {
            this.coreGroup = new this.THREE.Group();
            this.rootGroup.add(this.coreGroup);

            // Central Luminous Icosahedron
            const coreGeo = new this.THREE.IcosahedronGeometry(1.6, 1);
            const coreMat = new this.THREE.MeshBasicMaterial({
                color: this.colors.core,
                wireframe: true,
                transparent: true,
                opacity: 0.85
            });
            this.coreMesh = new this.THREE.Mesh(coreGeo, coreMat);
            this.coreGroup.add(this.coreMesh);

            // Inner solid pulsing core
            const innerGeo = new this.THREE.SphereGeometry(0.85, 16, 16);
            const innerMat = new this.THREE.MeshBasicMaterial({
                color: 0xFFFFFF,
                transparent: true,
                opacity: 0.95
            });
            this.coreInnerMesh = new this.THREE.Mesh(innerGeo, innerMat);
            this.coreGroup.add(this.coreInnerMesh);

            // Outer Orbital Energy Rings
            const ringGeo1 = new this.THREE.TorusGeometry(3.0, 0.04, 8, 48);
            const ringMat1 = new this.THREE.MeshBasicMaterial({
                color: this.colors.wind,
                transparent: true,
                opacity: 0.6,
                blending: this.THREE.AdditiveBlending
            });
            this.coreRing1 = new this.THREE.Mesh(ringGeo1, ringMat1);
            this.coreRing1.rotation.x = Math.PI / 3;
            this.coreGroup.add(this.coreRing1);

            const ringGeo2 = new this.THREE.TorusGeometry(3.6, 0.035, 8, 48);
            const ringMat2 = new this.THREE.MeshBasicMaterial({
                color: this.colors.solar,
                transparent: true,
                opacity: 0.5,
                blending: this.THREE.AdditiveBlending
            });
            this.coreRing2 = new this.THREE.Mesh(ringGeo2, ringMat2);
            this.coreRing2.rotation.y = Math.PI / 4;
            this.coreGroup.add(this.coreRing2);

            // Central Core Halo Sprite
            const haloTex = this.createGlowTexture(128, 'rgba(255, 255, 255, 1)', 'rgba(0, 230, 118, 0)');
            if (haloTex) {
                const spriteMat = new this.THREE.SpriteMaterial({
                    map: haloTex,
                    color: 0x00E676,
                    transparent: true,
                    opacity: 0.8,
                    blending: this.THREE.AdditiveBlending,
                    depthWrite: false
                });
                const coreHalo = new this.THREE.Sprite(spriteMat);
                coreHalo.scale.set(7.5, 7.5, 1);
                this.coreGroup.add(coreHalo);
                this.coreHalo = coreHalo;
            }
        }

        buildNodes() {
            this.nodesGroup = new this.THREE.Group();
            this.rootGroup.add(this.nodesGroup);

            // Add center node representing the Alpha Energie Hub
            this.nodes.push({
                position: new this.THREE.Vector3(0, 0, 0),
                type: 'core',
                color: this.colors.core,
                size: 1.5,
                pulseOffset: 0,
                pulseSpeed: 2.5,
                neighbors: []
            });

            const nodeCount = Math.floor(40 * this.particleMultiplier);
            const sphereRadius = 14;
            const nodeTypes = ['solar', 'wind', 'storage', 'consumer'];

            const glowTex = this.createGlowTexture(64);

            for (let i = 0; i < nodeCount; i++) {
                // Spherical Fibonacci / organic distribution
                const phi = Math.acos(-1 + (2 * i) / nodeCount);
                const theta = Math.sqrt(nodeCount * Math.PI) * phi;

                const r = sphereRadius * (0.45 + 0.65 * Math.sin(i * 1.7));
                const x = r * Math.sin(phi) * Math.cos(theta);
                const y = (r * 0.7) * Math.cos(phi) + (Math.sin(i * 2.3) * 1.5);
                const z = r * Math.sin(phi) * Math.sin(theta);

                const type = nodeTypes[i % nodeTypes.length];
                const colorHex = this.colors[type];

                const pos = new this.THREE.Vector3(x, y, z);

                // Small sphere core
                const nodeGeo = new this.THREE.SphereGeometry(0.35, 12, 12);
                const nodeMat = new this.THREE.MeshBasicMaterial({
                    color: colorHex,
                    wireframe: false
                });
                const mesh = new this.THREE.Mesh(nodeGeo, nodeMat);
                mesh.position.copy(pos);
                this.nodesGroup.add(mesh);

                // Node Aura Sprite
                let halo = null;
                if (glowTex) {
                    const spriteMat = new this.THREE.SpriteMaterial({
                        map: glowTex,
                        color: colorHex,
                        transparent: true,
                        opacity: 0.7,
                        blending: this.THREE.AdditiveBlending,
                        depthWrite: false
                    });
                    halo = new this.THREE.Sprite(spriteMat);
                    halo.position.copy(pos);
                    halo.scale.set(1.6, 1.6, 1);
                    this.nodesGroup.add(halo);
                }

                this.nodes.push({
                    mesh,
                    halo,
                    position: pos,
                    type,
                    color: colorHex,
                    baseScale: 1.0,
                    pulseOffset: Math.random() * Math.PI * 2,
                    pulseSpeed: 1.5 + Math.random() * 2.0,
                    neighbors: []
                });
            }
        }

        buildConnections() {
            const maxDistance = 7.5;
            const positions = [];
            const colors = [];

            // 1. Connect central core (node 0) to nearest 8 outer nodes
            const coreNode = this.nodes[0];
            const sortedByCoreDist = this.nodes.slice(1).sort((a, b) => {
                return a.position.distanceTo(coreNode.position) - b.position.distanceTo(coreNode.position);
            });

            for (let i = 0; i < Math.min(8, sortedByCoreDist.length); i++) {
                const target = sortedByCoreDist[i];
                this.edges.push({ from: coreNode, to: target });
                coreNode.neighbors.push(target);
                target.neighbors.push(coreNode);

                positions.push(
                    coreNode.position.x, coreNode.position.y, coreNode.position.z,
                    target.position.x, target.position.y, target.position.z
                );

                const c1 = new this.THREE.Color(this.colors.core);
                const c2 = new this.THREE.Color(target.color);
                colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
            }

            // 2. Connect inter-node proximity edges
            for (let i = 1; i < this.nodes.length; i++) {
                const nodeA = this.nodes[i];
                let connectionsCount = 0;

                for (let j = i + 1; j < this.nodes.length; j++) {
                    const nodeB = this.nodes[j];
                    const dist = nodeA.position.distanceTo(nodeB.position);

                    if (dist <= maxDistance && connectionsCount < 4) {
                        this.edges.push({ from: nodeA, to: nodeB });
                        nodeA.neighbors.push(nodeB);
                        nodeB.neighbors.push(nodeA);
                        connectionsCount++;

                        positions.push(
                            nodeA.position.x, nodeA.position.y, nodeA.position.z,
                            nodeB.position.x, nodeB.position.y, nodeB.position.z
                        );

                        const c1 = new this.THREE.Color(nodeA.color);
                        const c2 = new this.THREE.Color(nodeB.color);
                        colors.push(c1.r, c1.g, c1.b, c2.r, c2.g, c2.b);
                    }
                }
            }

            const geometry = new this.THREE.BufferGeometry();
            geometry.setAttribute('position', new this.THREE.Float32BufferAttribute(positions, 3));
            geometry.setAttribute('color', new this.THREE.Float32BufferAttribute(colors, 3));

            const material = new this.THREE.LineBasicMaterial({
                vertexColors: true,
                transparent: true,
                opacity: 0.35,
                blending: this.THREE.AdditiveBlending,
                depthWrite: false
            });

            this.linesMesh = new this.THREE.LineSegments(geometry, material);
            this.rootGroup.add(this.linesMesh);
        }

        buildEnergyPulses() {
            if (this.edges.length === 0) return;

            const pulseCount = Math.floor(65 * this.particleMultiplier);
            const pulsePositions = new Float32Array(pulseCount * 3);
            const pulseColors = new Float32Array(pulseCount * 3);

            this.pulses = [];

            for (let i = 0; i < pulseCount; i++) {
                const edgeIndex = Math.floor(Math.random() * this.edges.length);
                const edge = this.edges[edgeIndex];
                const progress = Math.random();
                const speed = 0.4 + Math.random() * 0.7;
                const forward = Math.random() > 0.5;

                const color = new this.THREE.Color(
                    Math.random() > 0.4 ? this.colors.solar : this.colors.wind
                );

                this.pulses.push({
                    edge,
                    progress,
                    speed,
                    forward,
                    color
                });

                const fromPos = forward ? edge.from.position : edge.to.position;
                const toPos = forward ? edge.to.position : edge.from.position;

                const curPos = new this.THREE.Vector3().lerpVectors(fromPos, toPos, progress);
                pulsePositions[i * 3] = curPos.x;
                pulsePositions[i * 3 + 1] = curPos.y;
                pulsePositions[i * 3 + 2] = curPos.z;

                pulseColors[i * 3] = color.r;
                pulseColors[i * 3 + 1] = color.g;
                pulseColors[i * 3 + 2] = color.b;
            }

            const geometry = new this.THREE.BufferGeometry();
            geometry.setAttribute('position', new this.THREE.BufferAttribute(pulsePositions, 3));
            geometry.setAttribute('color', new this.THREE.BufferAttribute(pulseColors, 3));

            const glowTex = this.createGlowTexture(64, 'rgba(255, 255, 255, 1)', 'rgba(0, 230, 118, 0)');
            const material = new this.THREE.PointsMaterial({
                size: 1.4,
                map: glowTex,
                vertexColors: true,
                transparent: true,
                opacity: 0.9,
                blending: this.THREE.AdditiveBlending,
                depthWrite: false
            });

            this.pulsesMesh = new this.THREE.Points(geometry, material);
            this.rootGroup.add(this.pulsesMesh);
        }

        buildAmbientField() {
            const count = Math.floor(350 * this.particleMultiplier);
            const positions = new Float32Array(count * 3);
            const colors = new Float32Array(count * 3);

            const green = new this.THREE.Color(this.colors.solar);
            const cyan = new this.THREE.Color(this.colors.wind);
            const mixed = new this.THREE.Color();

            for (let i = 0; i < count; i++) {
                // Sphere spread
                const r = 18 * Math.cbrt(Math.random());
                const theta = Math.random() * Math.PI * 2;
                const phi = Math.acos(2 * Math.random() - 1);

                positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
                positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
                positions[i * 3 + 2] = r * Math.cos(phi);

                mixed.copy(green).lerp(cyan, Math.random());
                colors[i * 3] = mixed.r;
                colors[i * 3 + 1] = mixed.g;
                colors[i * 3 + 2] = mixed.b;
            }

            const geometry = new this.THREE.BufferGeometry();
            geometry.setAttribute('position', new this.THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('color', new this.THREE.BufferAttribute(colors, 3));

            const glowTex = this.createGlowTexture(32, 'rgba(255, 255, 255, 0.9)', 'rgba(0, 210, 255, 0)');
            const material = new this.THREE.PointsMaterial({
                size: 0.7,
                map: glowTex,
                vertexColors: true,
                transparent: true,
                opacity: 0.5,
                blending: this.THREE.AdditiveBlending,
                depthWrite: false
            });

            this.ambientParticles = new this.THREE.Points(geometry, material);
            this.rootGroup.add(this.ambientParticles);
        }

        buildBurstRings() {
            this.burstRings = [];
            for (let i = 0; i < 3; i++) {
                const geo = new this.THREE.RingGeometry(0.1, 0.25, 48);
                const mat = new this.THREE.MeshBasicMaterial({
                    color: i % 2 === 0 ? this.colors.solar : this.colors.wind,
                    transparent: true,
                    opacity: 0,
                    side: this.THREE.DoubleSide,
                    blending: this.THREE.AdditiveBlending,
                    depthWrite: false
                });
                const mesh = new this.THREE.Mesh(geo, mat);
                mesh.visible = false;
                this.rootGroup.add(mesh);
                this.burstRings.push({ mesh, progress: 1.0, active: false });
            }
        }

        /**
         * Trigger outward energy pulse burst shockwave
         */
        pulseBurst() {
            this.burstTime = performance.now() * 0.001;

            // Activate next available burst ring
            for (let i = 0; i < this.burstRings.length; i++) {
                const ring = this.burstRings[i];
                if (!ring.active) {
                    ring.active = true;
                    ring.progress = 0;
                    ring.mesh.visible = true;
                    ring.mesh.scale.set(0.1, 0.1, 0.1);
                    ring.mesh.lookAt(this.camera.position);
                    break;
                }
            }

            // Temporarily boost pulse speeds
            for (let i = 0; i < this.pulses.length; i++) {
                this.pulses[i].speed *= 2.0;
            }

            setTimeout(() => {
                for (let i = 0; i < this.pulses.length; i++) {
                    this.pulses[i].speed /= 2.0;
                }
            }, 1200);
        }

        /**
         * Set operational energy mode
         * @param {'solar'|'wind'|'grid'|'balanced'} mode
         */
        setMode(rawMode) {
            let mode = (rawMode || 'balanced').toLowerCase();
            if (mode === 'stromnetz' || mode === 'strom' || mode === 'network') mode = 'balanced';
            if (mode === 'b2b' || mode === 'b2b-flow' || mode === 'speicher') mode = 'grid';
            if (mode === 'pv') mode = 'solar';

            this.mode = mode;
            const targetColor = mode === 'solar' ? this.colors.solar :
                                mode === 'wind' ? this.colors.wind :
                                mode === 'grid' ? this.colors.storage :
                                this.colors.solar;

            if (this.corePointLight) {
                this.corePointLight.color.setHex(targetColor);
            }

            // Highlight relevant nodes
            this.nodes.forEach(node => {
                if (!node.mesh) return;
                const isMatch = mode === 'balanced' || 
                                node.type === mode ||
                                (mode === 'grid' && (node.type === 'storage' || node.type === 'consumer'));

                if (isMatch) {
                    node.mesh.scale.set(1.35, 1.35, 1.35);
                    if (node.halo) node.halo.scale.set(2.2, 2.2, 1);
                } else {
                    node.mesh.scale.set(0.85, 0.85, 0.85);
                    if (node.halo) node.halo.scale.set(1.2, 1.2, 1);
                }
            });
        }

        setSpeed(factor) {
            this.speed = Math.max(0.1, Math.min(factor, 5.0));
        }

        onPointerMove(x, y) {
            this.targetRotationY = x * 0.5;
            this.targetRotationX = -y * 0.35;
        }

        onPointerClick() {
            this.pulseBurst();
        }

        update(delta, elapsed, pointer) {
            if (this.disposed || !this.rootGroup) return;

            const speed = this.speed;

            // 1. Smooth Gentle Parallax & Continuous Slow Orbit
            this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;
            this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;

            this.rootGroup.rotation.y = (elapsed * 0.08 * speed) + this.currentRotationY;
            this.rootGroup.rotation.x = Math.sin(elapsed * 0.05 * speed) * 0.05 + this.currentRotationX;

            // 2. Central Nexus Core Animation
            if (this.coreGroup) {
                this.coreMesh.rotation.x += delta * 0.35 * speed;
                this.coreMesh.rotation.y += delta * 0.55 * speed;

                this.coreRing1.rotation.z += delta * 0.7 * speed;
                this.coreRing2.rotation.x -= delta * 0.6 * speed;

                const corePulse = 1.0 + Math.sin(elapsed * 3.5 * speed) * 0.12;
                this.coreInnerMesh.scale.set(corePulse, corePulse, corePulse);

                if (this.coreHalo) {
                    const haloPulse = 7.0 + Math.sin(elapsed * 2.8 * speed) * 1.0;
                    this.coreHalo.scale.set(haloPulse, haloPulse, 1);
                }
            }

            // 3. Node breathing & glow pulsation
            for (let i = 1; i < this.nodes.length; i++) {
                const node = this.nodes[i];
                if (!node.mesh) continue;

                const pulse = 1.0 + Math.sin(elapsed * node.pulseSpeed * speed + node.pulseOffset) * 0.22;
                const base = node.baseScale || 1.0;
                node.mesh.scale.set(base * pulse, base * pulse, base * pulse);

                if (node.halo) {
                    const haloScale = 1.6 * pulse;
                    node.halo.scale.set(haloScale, haloScale, 1);
                }
            }

            // 4. Update Transmission Line Breathing Opacity
            if (this.linesMesh && this.linesMesh.material) {
                const lineBase = this.mode === 'grid' ? 0.45 : 0.32;
                this.linesMesh.material.opacity = lineBase + Math.sin(elapsed * 2.0 * speed) * 0.12;
            }

            // 5. Update Traveling Energy Photons / Pulses
            if (this.pulsesMesh && this.pulses.length > 0) {
                const positions = this.pulsesMesh.geometry.attributes.position.array;

                for (let i = 0; i < this.pulses.length; i++) {
                    const p = this.pulses[i];
                    p.progress += delta * p.speed * speed;

                    if (p.progress >= 1.0) {
                        p.progress = 0;
                        // Transfer to next connected neighbor
                        const currentNode = p.forward ? p.edge.to : p.edge.from;
                        if (currentNode.neighbors && currentNode.neighbors.length > 0) {
                            const nextNode = currentNode.neighbors[Math.floor(Math.random() * currentNode.neighbors.length)];
                            p.edge = { from: currentNode, to: nextNode };
                            p.forward = true;
                        } else {
                            p.forward = !p.forward;
                        }
                    }

                    const fromPos = p.forward ? p.edge.from.position : p.edge.to.position;
                    const toPos = p.forward ? p.edge.to.position : p.edge.from.position;

                    // Quadratic curve or linear interpolation
                    const t = p.progress;
                    const curX = fromPos.x + (toPos.x - fromPos.x) * t;
                    const curY = fromPos.y + (toPos.y - fromPos.y) * t;
                    const curZ = fromPos.z + (toPos.z - fromPos.z) * t;

                    positions[i * 3] = curX;
                    positions[i * 3 + 1] = curY;
                    positions[i * 3 + 2] = curZ;
                }

                this.pulsesMesh.geometry.attributes.position.needsUpdate = true;
            }

            // 6. Ambient field slow drift
            if (this.ambientParticles) {
                this.ambientParticles.rotation.y = elapsed * 0.02 * speed;
                this.ambientParticles.rotation.x = Math.cos(elapsed * 0.015 * speed) * 0.05;
            }

            // 7. Shockwave Burst Rings
            for (let i = 0; i < this.burstRings.length; i++) {
                const ring = this.burstRings[i];
                if (ring.active) {
                    ring.progress += delta * 1.35 * speed;
                    if (ring.progress >= 1.0) {
                        ring.active = false;
                        ring.mesh.visible = false;
                    } else {
                        const scale = 0.5 + ring.progress * 18.0;
                        ring.mesh.scale.set(scale, scale, 1);
                        ring.mesh.material.opacity = (1.0 - ring.progress) * 0.85;
                    }
                }
            }
        }
    }

    return EnergyNetworkScene;
}));

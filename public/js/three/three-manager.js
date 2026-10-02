/**
 * Alpha Energie GmbH - Three.js Engine & Scene Manager
 * Production-grade WebGL controller with lifecycle management, performance throttles,
 * IntersectionObserver pause/resume, clamped pixel ratio, and memory teardown.
 *
 * @license Proprietary - Alpha Energie GmbH 2026
 */

(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AlphaThreeManager = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    /**
     * Color Tokens for Alpha Energie 3D Visualizations
     */
    const PALETTE = {
        greenNeon: '#00E676',       // Solar / Clean Eco Green
        greenEmerald: '#10B981',    // Smart Storage / Sustained Efficiency
        blueCyan: '#00D2FF',        // Wind Energy / Transmission Flow
        blueElectric: '#0284C7',    // B2B Network Grid
        slateMidnight: '#0B132B',   // Core Background
        slateDark: '#0F172A',       // Section Dark Base
        orangeAccent: '#FF7A00',    // Alpha Energie Primary Accent
        whiteBright: '#FFFFFF',
        whiteMuted: '#94A3B8'
    };

    /**
     * WebGL capability detector with hardware acceleration check
     */
    class WebGLDetector {
        static isSupported() {
            if (this._supported !== undefined) return this._supported;
            try {
                const canvas = document.createElement('canvas');
                const gl = canvas.getContext('webgl2') ||
                           canvas.getContext('webgl') ||
                           canvas.getContext('experimental-webgl');
                this._supported = Boolean(gl && gl instanceof WebGLRenderingContext || (window.WebGL2RenderingContext && gl instanceof WebGL2RenderingContext));
            } catch (e) {
                this._supported = false;
            }
            return this._supported;
        }

        static renderFallback(container, options = {}) {
            const title = options.fallbackTitle || 'Interaktive 3D-Visualisierung';
            const desc = options.fallbackDesc || 'WebGL wird in Ihrem Browser derzeit nicht unterstützt oder ist deaktiviert. Ihr Alpha Energie System bleibt vollständig funktionsfähig.';

            container.innerHTML = `
                <div class="alpha-three-fallback" style="
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    height: 100%;
                    min-height: 280px;
                    padding: 2rem;
                    box-sizing: border-box;
                    background: radial-gradient(circle at center, rgba(16, 185, 129, 0.08) 0%, rgba(11, 19, 43, 0.95) 75%);
                    border: 1px solid rgba(0, 230, 118, 0.15);
                    border-radius: 1rem;
                    text-align: center;
                    color: #F8FAFC;
                    font-family: inherit;
                    position: relative;
                    overflow: hidden;
                " role="region" aria-label="${title}">
                    <div style="
                        width: 72px;
                        height: 72px;
                        margin-bottom: 1.25rem;
                        border-radius: 50%;
                        background: rgba(0, 230, 118, 0.12);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        box-shadow: 0 0 25px rgba(0, 230, 118, 0.35);
                    ">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E676" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                        </svg>
                    </div>
                    <h4 style="margin: 0 0 0.5rem 0; font-size: 1.15rem; font-weight: 700; color: #FFFFFF; letter-spacing: -0.01em;">${title}</h4>
                    <p style="margin: 0; font-size: 0.9rem; line-height: 1.5; color: #94A3B8; max-width: 420px;">${desc}</p>
                    <div style="
                        margin-top: 1.25rem;
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.35rem 0.85rem;
                        background: rgba(255, 255, 255, 0.05);
                        border: 1px solid rgba(255, 255, 255, 0.1);
                        border-radius: 9999px;
                        font-size: 0.75rem;
                        color: #00D2FF;
                        font-weight: 600;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                    ">
                        <span style="width: 8px; height: 8px; border-radius: 50%; background: #00E676; display: inline-block;"></span>
                        Alpha Energie 2026 Eco-Grid
                    </div>
                </div>
            `;
        }
    }

    /**
     * Base class for all Alpha Energie Three.js scenes
     */
    class ThreeSceneBase {
        constructor(container, options = {}) {
            this.container = container;
            this.options = Object.assign({
                speed: 1.0,
                interactive: true,
                transparent: true,
                background: null,
                reducedMotion: false,
                colorMode: 'balanced',
                particleMultiplier: 1.0
            }, options);

            this.disposed = false;
            this.THREE = null;
            this.scene = null;
            this.camera = null;
            this.renderer = null;
        }

        /**
         * Initialize Three.js objects (Must be overridden by scene subclasses)
         */
        init(THREE, scene, camera, renderer) {
            this.THREE = THREE;
            this.scene = scene;
            this.camera = camera;
            this.renderer = renderer;
        }

        /**
         * Render loop update hook
         * @param {number} delta - Frame delta time in seconds
         * @param {number} elapsed - Total elapsed time in seconds
         * @param {object} pointer - Normalized pointer coordinates {x, y}
         */
        update(delta, elapsed, pointer) {
            // Override in subclass
        }

        /**
         * Resize hook
         * @param {number} width - Canvas width in px
         * @param {number} height - Canvas height in px
         * @param {number} aspect - Aspect ratio
         */
        onResize(width, height, aspect) {
            // Override in subclass if custom camera handling is needed
        }

        /**
         * Interactive pointer move hook
         */
        onPointerMove(normalizedX, normalizedY, rawEvent) {
            // Override in subclass
        }

        /**
         * Pointer click / tap hook
         */
        onPointerClick(normalizedX, normalizedY, rawEvent) {
            // Override in subclass
        }

        /**
         * Disposal cleanup hook
         */
        dispose() {
            this.disposed = true;
        }
    }

    /**
     * Controller managing the Three.js lifecycle for a single DOM container
     */
    class SceneController {
        constructor(container, SceneClass, options = {}) {
            this.container = container;
            this.SceneClass = SceneClass;
            const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
            const defaultMaxPR = isMobile ? 1.0 : 1.5;
            this.options = Object.assign({
                maxPixelRatio: defaultMaxPR,
                fov: 50,
                near: 0.1,
                far: 1000,
                cameraZ: 25,
                antialias: true,
                alpha: true,
                powerPreference: 'high-performance',
                pointerLerp: 0.06,
                reducedMotionBehavior: 'drift' // 'static' | 'drift' | 'normal'
            }, options);

            this.id = container.id || 'three-scene-' + Math.random().toString(36).substring(2, 9);
            this.THREE = options.THREE || (typeof window !== 'undefined' ? window.THREE : null);

            this.scene = null;
            this.camera = null;
            this.renderer = null;
            this.sceneInstance = null;
            this.clock = null;

            this.rafId = null;
            this.isRunning = false;
            this.isVisible = false;

            // Pointer state
            this.targetPointer = { x: 0, y: 0 };
            this.currentPointer = { x: 0, y: 0 };
            this.isPointerInside = false;

            // Observers & handlers
            this.intersectionObserver = null;
            this.resizeObserver = null;
            this.boundOnPointerMove = this.handlePointerMove.bind(this);
            this.boundOnPointerLeave = this.handlePointerLeave.bind(this);
            this.boundOnPointerClick = this.handlePointerClick.bind(this);
            this.boundOnReducedMotionChange = this.handleReducedMotionChange.bind(this);

            // Reduced motion media query
            this.mediaQueryReducedMotion = null;
            if (typeof window !== 'undefined' && window.matchMedia) {
                this.mediaQueryReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
                this.isReducedMotion = this.mediaQueryReducedMotion.matches;
                if (this.mediaQueryReducedMotion.addEventListener) {
                    this.mediaQueryReducedMotion.addEventListener('change', this.boundOnReducedMotionChange);
                }
            } else {
                this.isReducedMotion = false;
            }

            this.init();
        }

        init() {
            if (!this.THREE) {
                console.error('[AlphaThree] Three.js library not found. Ensure three.min.js is loaded.');
                return;
            }

            if (!WebGLDetector.isSupported()) {
                console.warn('[AlphaThree] WebGL not supported. Rendering fallback UI.');
                WebGLDetector.renderFallback(this.container, this.options);
                return;
            }

            const width = Math.max(this.container.clientWidth || 300, 50);
            const height = Math.max(this.container.clientHeight || 300, 50);

            // 1. Create Scene & Camera
            this.scene = new this.THREE.Scene();
            this.camera = new this.THREE.PerspectiveCamera(
                this.options.fov,
                width / height,
                this.options.near,
                this.options.far
            );
            this.camera.position.z = this.options.cameraZ;

            // 2. Create WebGL Renderer with performance clamping
            this.renderer = new this.THREE.WebGLRenderer({
                antialias: this.options.antialias,
                alpha: this.options.alpha,
                powerPreference: this.options.powerPreference,
                preserveDrawingBuffer: false
            });

            const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;
            const targetMaxPR = isMobile ? 1.0 : 1.5;
            const maxPR = Math.min(this.options.maxPixelRatio || targetMaxPR, targetMaxPR);
            const pixelRatio = Math.min(typeof window !== 'undefined' ? window.devicePixelRatio || 1 : 1, maxPR);
            this.renderer.setPixelRatio(pixelRatio);
            this.renderer.setSize(width, height, false);

            if (this.options.background) {
                this.renderer.setClearColor(new this.THREE.Color(this.options.background), this.options.alpha ? 0 : 1);
            } else {
                this.renderer.setClearColor(0x000000, 0);
            }

            // Canvas styling
            const canvas = this.renderer.domElement;
            canvas.style.display = 'block';
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.pointerEvents = this.options.interactive ? 'auto' : 'none';
            canvas.setAttribute('aria-hidden', 'true'); // Accessible fallback wrapper handles semantics

            // Clear previous canvas or fallback while preserving overlay HUD children
            const existingElements = this.container.querySelectorAll(':scope > canvas, :scope > .alpha-three-fallback');
            existingElements.forEach(el => el.remove());
            this.container.insertBefore(canvas, this.container.firstChild);

            // 3. Initialize Clock & Scene Instance
            this.clock = new this.THREE.Clock();
            this.sceneInstance = new this.SceneClass(this.container, Object.assign({}, this.options, {
                reducedMotion: this.isReducedMotion
            }));
            this.sceneInstance.init(this.THREE, this.scene, this.camera, this.renderer);

            // 4. Register Event Listeners
            this.setupInteractivity();
            this.setupObservers();

            // 5. Start Render Loop (deferred until confirmed visible)
            this.isRunning = true;
            if (this.isVisible) {
                this.startLoop();
            }
        }

        setupInteractivity() {
            if (!this.options.interactive) return;

            const target = this.container;
            target.addEventListener('mousemove', this.boundOnPointerMove, { passive: true });
            target.addEventListener('mouseleave', this.boundOnPointerLeave, { passive: true });
            target.addEventListener('click', this.boundOnPointerClick, { passive: true });

            // Mobile Touch support
            target.addEventListener('touchmove', (e) => {
                if (e.touches && e.touches.length > 0) {
                    this.handlePointerMove(e.touches[0]);
                }
            }, { passive: true });
            target.addEventListener('touchend', this.boundOnPointerLeave, { passive: true });
        }

        handlePointerMove(event) {
            const rect = this.container.getBoundingClientRect();
            if (rect.width === 0 || rect.height === 0) return;

            const clientX = event.clientX;
            const clientY = event.clientY;

            // Normalized coordinates (-1 to 1)
            this.targetPointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
            this.targetPointer.y = -(((clientY - rect.top) / rect.height) * 2 - 1);
            this.isPointerInside = true;

            if (this.sceneInstance && typeof this.sceneInstance.onPointerMove === 'function') {
                this.sceneInstance.onPointerMove(this.targetPointer.x, this.targetPointer.y, event);
            }
        }

        handlePointerLeave() {
            this.isPointerInside = false;
            // Smoothly return target to center
            this.targetPointer.x = 0;
            this.targetPointer.y = 0;
        }

        handlePointerClick(event) {
            if (this.sceneInstance && typeof this.sceneInstance.onPointerClick === 'function') {
                this.sceneInstance.onPointerClick(this.targetPointer.x, this.targetPointer.y, event);
            }
        }

        handleReducedMotionChange(e) {
            this.isReducedMotion = Boolean(e.matches);
            if (this.sceneInstance) {
                this.sceneInstance.options.reducedMotion = this.isReducedMotion;
                if (typeof this.sceneInstance.onReducedMotionChange === 'function') {
                    this.sceneInstance.onReducedMotionChange(this.isReducedMotion);
                }
            }
        }

        setupObservers() {
            // 1. IntersectionObserver: Pause rendering when off-screen to achieve 0% CPU/GPU overhead
            if (typeof IntersectionObserver !== 'undefined') {
                this.intersectionObserver = new IntersectionObserver((entries) => {
                    for (let i = 0; i < entries.length; i++) {
                        const entry = entries[i];
                        if (entry.target === this.container) {
                            if (entry.isIntersecting) {
                                this.resume();
                            } else {
                                this.pause();
                            }
                        }
                    }
                }, {
                    root: null,
                    threshold: [0, 0.01] // Trigger on boundary cross
                });
                this.intersectionObserver.observe(this.container);
            } else {
                this.resume();
            }

            // Fallback scroll/resize handler to guarantee immediate visibility state updates
            this.boundCheckVisibility = () => {
                if (!this.container) return;
                const rect = this.container.getBoundingClientRect();
                const vh = window.innerHeight || (document.documentElement ? document.documentElement.clientHeight : 800);
                const inView = rect.bottom > 0 && rect.top < vh;
                if (inView && !this.isVisible) {
                    this.resume();
                } else if (!inView && this.isVisible) {
                    this.pause();
                }
            };
            window.addEventListener('scroll', this.boundCheckVisibility, { passive: true });
            window.addEventListener('resize', this.boundCheckVisibility, { passive: true });

            // 2. ResizeObserver: Responsive canvas resize tracking container dimensions
            if (typeof ResizeObserver !== 'undefined') {
                this.resizeObserver = new ResizeObserver((entries) => {
                    for (let i = 0; i < entries.length; i++) {
                        const entry = entries[i];
                        if (entry.target === this.container) {
                            const cr = entry.contentRect;
                            if (cr.width > 0 && cr.height > 0) {
                                this.resize(cr.width, cr.height);
                            }
                        }
                    }
                });
                this.resizeObserver.observe(this.container);
            } else {
                // Fallback for older browsers
                window.addEventListener('resize', () => {
                    const width = this.container.clientWidth;
                    const height = this.container.clientHeight;
                    if (width > 0 && height > 0) {
                        this.resize(width, height);
                    }
                });
            }
        }

        resize(width, height) {
            if (!this.renderer || !this.camera) return;

            const aspect = width / height;
            this.camera.aspect = aspect;
            this.camera.updateProjectionMatrix();

            this.renderer.setSize(width, height, false);

            if (this.sceneInstance && typeof this.sceneInstance.onResize === 'function') {
                this.sceneInstance.onResize(width, height, aspect);
            }

            // Render one frame immediately if paused
            if (!this.isRunning && this.isVisible) {
                this.renderer.render(this.scene, this.camera);
            }
        }

        startLoop() {
            if (this.rafId !== null) return;

            const tick = () => {
                if (!this.isRunning) return;

                this.rafId = requestAnimationFrame(tick);

                if (!this.isVisible) return;

                const delta = Math.min(this.clock.getDelta(), 0.1); // Cap delta to prevent animation jumps
                const elapsed = this.clock.getElapsedTime();

                // Gentle pointer inertia lerp
                const lerp = this.options.pointerLerp || 0.06;
                this.currentPointer.x += (this.targetPointer.x - this.currentPointer.x) * lerp;
                this.currentPointer.y += (this.targetPointer.y - this.currentPointer.y) * lerp;

                // Update scene logic
                if (this.sceneInstance) {
                    if (this.isReducedMotion && this.options.reducedMotionBehavior === 'static') {
                        // Static frame for strict reduced motion
                    } else {
                        // Apply scaled delta if motion reduction is requested
                        const speedScale = (this.isReducedMotion && this.options.reducedMotionBehavior === 'drift') ? 0.2 : 1.0;
                        this.sceneInstance.update(delta * speedScale, elapsed * speedScale, this.currentPointer);
                    }
                }

                // Render current frame
                if (this.renderer && this.scene && this.camera) {
                    this.renderer.render(this.scene, this.camera);
                }
            };

            // Reset clock before loop starts
            if (this.clock) {
                this.clock.getDelta();
            }
            this.rafId = requestAnimationFrame(tick);
        }

        stopLoop() {
            if (this.rafId !== null) {
                cancelAnimationFrame(this.rafId);
                this.rafId = null;
            }
        }

        pause() {
            if (!this.isVisible) return;
            this.isVisible = false;
            this.stopLoop();
        }

        resume() {
            if (this.isVisible) return;
            this.isVisible = true;
            if (this.clock) {
                this.clock.getDelta(); // Clear accumulated delta
            }
            this.startLoop();
        }

        /**
         * Comprehensive memory teardown and GPU resource disposal
         */
        dispose() {
            this.isRunning = false;
            this.isVisible = false;
            this.stopLoop();

            // 1. Remove Observers
            if (this.boundCheckVisibility) {
                window.removeEventListener('scroll', this.boundCheckVisibility);
                window.removeEventListener('resize', this.boundCheckVisibility);
                this.boundCheckVisibility = null;
            }
            if (this.intersectionObserver) {
                this.intersectionObserver.disconnect();
                this.intersectionObserver = null;
            }
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }

            // 2. Remove Event Listeners
            this.container.removeEventListener('mousemove', this.boundOnPointerMove);
            this.container.removeEventListener('mouseleave', this.boundOnPointerLeave);
            this.container.removeEventListener('click', this.boundOnPointerClick);
            if (this.mediaQueryReducedMotion && this.mediaQueryReducedMotion.removeEventListener) {
                this.mediaQueryReducedMotion.removeEventListener('change', this.boundOnReducedMotionChange);
            }

            // 3. Dispose Scene Instance
            if (this.sceneInstance && typeof this.sceneInstance.dispose === 'function') {
                this.sceneInstance.dispose();
                this.sceneInstance = null;
            }

            // 4. Traverse and dispose Three.js scene hierarchy
            if (this.scene) {
                this.disposeHierarchy(this.scene);
                this.scene = null;
            }

            // 5. Dispose WebGL Renderer
            if (this.renderer) {
                this.renderer.dispose();
                if (this.renderer.forceContextLoss) {
                    this.renderer.forceContextLoss();
                }
                const dom = this.renderer.domElement;
                if (dom && dom.parentNode) {
                    dom.parentNode.removeChild(dom);
                }
                this.renderer = null;
            }

            this.camera = null;
            this.clock = null;
            delete this.container._alphaThreeController;
        }

        disposeHierarchy(node) {
            if (!node) return;

            for (let i = node.children.length - 1; i >= 0; i--) {
                const child = node.children[i];
                this.disposeHierarchy(child);
                node.remove(child);
            }

            if (node.geometry && typeof node.geometry.dispose === 'function') {
                node.geometry.dispose();
            }

            if (node.material) {
                if (Array.isArray(node.material)) {
                    node.material.forEach(mat => this.disposeMaterial(mat));
                } else {
                    this.disposeMaterial(node.material);
                }
            }
        }

        disposeMaterial(material) {
            if (!material) return;
            // Dispose all texture references on material
            for (const key of Object.keys(material)) {
                const value = material[key];
                if (value && typeof value === 'object' && 'minFilter' in value && typeof value.dispose === 'function') {
                    value.dispose();
                }
            }
            if (typeof material.dispose === 'function') {
                material.dispose();
            }
        }
    }

    /**
     * Central Three.js Scene Registry & Manager
     */
    class ThreeManager {
        constructor() {
            this.scenesRegistry = new Map();
            this.activeControllers = new Map();
            this.isInitialized = false;
        }

        registerScene(name, SceneClass) {
            if (typeof SceneClass !== 'function') {
                throw new Error(`[AlphaThree] Scene class for "${name}" must be a constructor function or class.`);
            }
            this.scenesRegistry.set(name, SceneClass);
        }

        getRegisteredScenes() {
            return Array.from(this.scenesRegistry.keys());
        }

        /**
         * Mount a 3D scene into a container
         */
        create(containerOrSelector, sceneName, options = {}) {
            const container = typeof containerOrSelector === 'string'
                ? document.querySelector(containerOrSelector)
                : containerOrSelector;

            if (!container) {
                console.warn(`[AlphaThree] Container "${containerOrSelector}" not found.`);
                return null;
            }

            // Teardown existing controller if any
            if (container._alphaThreeController) {
                this.destroy(container);
            }

            const SceneClass = this.scenesRegistry.get(sceneName);
            if (!SceneClass) {
                console.error(`[AlphaThree] Scene "${sceneName}" not registered. Available scenes:`, this.getRegisteredScenes());
                return null;
            }

            const controller = new SceneController(container, SceneClass, options);
            container._alphaThreeController = controller;
            this.activeControllers.set(controller.id, controller);

            // Dispatch scene created event
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('alphathree:scene-created', {
                    detail: { id: controller.id, name: sceneName, controller }
                }));
            }

            return controller;
        }

        /**
         * Auto-discover all elements with [data-three-scene] in DOM
         */
        autoInit(rootElement = document) {
            const containers = rootElement.querySelectorAll('[data-three-scene]');
            const controllers = [];

            containers.forEach(container => {
                // Skip if already active
                if (container._alphaThreeController) return;

                const sceneName = container.getAttribute('data-three-scene');
                if (!sceneName) return;

                // Extract data-three-* options declaratively
                const options = {
                    mode: container.getAttribute('data-three-mode') || 'balanced',
                    speed: parseFloat(container.getAttribute('data-three-speed')) || 1.0,
                    interactive: container.getAttribute('data-three-interactive') !== 'false',
                    background: container.getAttribute('data-three-bg') || null,
                    transparent: container.getAttribute('data-three-transparent') !== 'false',
                    cameraZ: parseFloat(container.getAttribute('data-three-camera-z')) || 25,
                    fov: parseFloat(container.getAttribute('data-three-fov')) || 50,
                    maxPixelRatio: parseFloat(container.getAttribute('data-three-pixel-ratio')) || 1.5,
                    particleMultiplier: parseFloat(container.getAttribute('data-three-particles')) || 1.0,
                    reducedMotionBehavior: container.getAttribute('data-three-reduced-motion') || 'drift'
                };

                const controller = this.create(container, sceneName, options);
                if (controller) controllers.push(controller);
            });

            return controllers;
        }

        getController(idOrContainer) {
            if (!idOrContainer) return null;
            if (typeof idOrContainer === 'string') {
                if (this.activeControllers.has(idOrContainer)) {
                    return this.activeControllers.get(idOrContainer);
                }
                const cleanId = idOrContainer.startsWith('#') ? idOrContainer.slice(1) : idOrContainer;
                if (this.activeControllers.has(cleanId)) {
                    return this.activeControllers.get(cleanId);
                }
                try {
                    const el = document.querySelector(idOrContainer);
                    if (el && el._alphaThreeController) {
                        return el._alphaThreeController;
                    }
                } catch (e) {
                    // Ignore invalid selector syntax
                }
                return null;
            }
            if (idOrContainer && idOrContainer._alphaThreeController) {
                return idOrContainer._alphaThreeController;
            }
            return null;
        }

        getSceneInstance(idOrContainer) {
            const controller = this.getController(idOrContainer);
            return controller ? controller.sceneInstance : null;
        }

        destroy(idOrContainer) {
            const controller = this.getController(idOrContainer);
            if (controller) {
                const id = controller.id;
                controller.dispose();
                this.activeControllers.delete(id);

                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('alphathree:scene-destroyed', {
                        detail: { id }
                    }));
                }
                return true;
            }
            return false;
        }

        destroyAll() {
            this.activeControllers.forEach(controller => controller.dispose());
            this.activeControllers.clear();
        }

        pauseAll() {
            this.activeControllers.forEach(controller => controller.pause());
        }

        resumeAll() {
            this.activeControllers.forEach(controller => controller.resume());
        }
    }

    // Procedural glowing texture generator for self-contained 3D particles & halos
    function createGlowTexture(size = 64, innerColor = 'rgba(255, 255, 255, 1)', outerColor = 'rgba(0, 230, 118, 0)') {
        if (typeof document === 'undefined') return null;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) return null;

        const center = size / 2;
        const gradient = ctx.createRadialGradient(center, center, 0, center, center, center);
        gradient.addColorStop(0, innerColor);
        gradient.addColorStop(0.2, 'rgba(0, 230, 118, 0.7)');
        gradient.addColorStop(0.5, 'rgba(0, 210, 255, 0.25)');
        gradient.addColorStop(1, outerColor);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, size, size);
        return canvas;
    }

    return {
        PALETTE,
        WebGLDetector,
        ThreeSceneBase,
        SceneController,
        ThreeManager,
        createGlowTexture
    };
}));

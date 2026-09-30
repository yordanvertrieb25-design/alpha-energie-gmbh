/**
 * Alpha Energie GmbH - Three.js Universal Loader & Public API
 * Provides window.AlphaThree, manages auto-initialization of [data-three-scene],
 * dynamically loads Three.js vendor dependencies if needed, and exposes scene controls.
 *
 * @license Proprietary - Alpha Energie GmbH 2026
 */

(function (window, document) {
    'use strict';

    // Singleton manager instance
    let manager = null;
    let isBootstrapping = false;
    const bootstrapQueue = [];

    /**
     * Resolve vendor paths dynamically based on current script or base URL
     */
    function getBasePath() {
        const scripts = document.getElementsByTagName('script');
        for (let i = scripts.length - 1; i >= 0; i--) {
            const src = scripts[i].src;
            if (src && (src.includes('three-loader.js') || src.includes('three-manager.js'))) {
                return src.substring(0, src.lastIndexOf('/'));
            }
        }
        return '/js/three';
    }

    /**
     * Load an external script safely returning a Promise
     */
    function loadScript(src, fallbackSrc = null) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.type = 'text/javascript';
            script.async = true;
            script.src = src;

            script.onload = () => resolve(src);
            script.onerror = () => {
                if (fallbackSrc) {
                    console.warn(`[AlphaThree] Failed loading ${src}. Attempting fallback: ${fallbackSrc}`);
                    const fallbackScript = document.createElement('script');
                    fallbackScript.type = 'text/javascript';
                    fallbackScript.async = true;
                    fallbackScript.src = fallbackSrc;
                    fallbackScript.onload = () => resolve(fallbackSrc);
                    fallbackScript.onerror = (err) => reject(err);
                    document.head.appendChild(fallbackScript);
                } else {
                    reject(new Error(`Failed to load script: ${src}`));
                }
            };

            document.head.appendChild(script);
        });
    }

    /**
     * Ensure Three.js, Manager, and Built-in Scenes are loaded into DOM
     */
    async function ensureDependencies() {
        const basePath = getBasePath();

        // 1. Ensure window.THREE is loaded
        if (!window.THREE) {
            const vendorLocal = `${basePath}/vendor/three.min.js`;
            const vendorRootLocal = `/public/js/three/vendor/three.min.js`;
            const vendorCdn = `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`;

            try {
                await loadScript(vendorLocal, vendorRootLocal);
            } catch (e) {
                console.warn('[AlphaThree] Local vendor three.min.js unavailable, falling back to CDN.');
                await loadScript(vendorCdn);
            }
        }

        // 2. Ensure AlphaThreeManager is loaded
        if (!window.AlphaThreeManager) {
            await loadScript(`${basePath}/three-manager.js`, `/public/js/three/three-manager.js`);
        }

        // Initialize manager instance once AlphaThreeManager is available
        if (!manager && window.AlphaThreeManager) {
            manager = new window.AlphaThreeManager.ThreeManager();
        }

        // 3. Ensure Built-in Scenes are loaded
        const scenePromises = [];

        if (!manager.scenesRegistry.has('energy-network')) {
            if (window.AlphaEnergyNetworkScene) {
                manager.registerScene('energy-network', window.AlphaEnergyNetworkScene);
            } else {
                scenePromises.push(
                    loadScript(`${basePath}/scenes/energy-network.js`, `/public/js/three/scenes/energy-network.js`)
                        .then(() => {
                            if (window.AlphaEnergyNetworkScene) {
                                manager.registerScene('energy-network', window.AlphaEnergyNetworkScene);
                            }
                        })
                        .catch(err => console.error('[AlphaThree] Error loading energy-network scene:', err))
                );
            }
        }

        if (!manager.scenesRegistry.has('energy-globe')) {
            if (window.AlphaEnergyGlobeScene) {
                manager.registerScene('energy-globe', window.AlphaEnergyGlobeScene);
            } else {
                scenePromises.push(
                    loadScript(`${basePath}/scenes/energy-globe.js`, `/public/js/three/scenes/energy-globe.js`)
                        .then(() => {
                            if (window.AlphaEnergyGlobeScene) {
                                manager.registerScene('energy-globe', window.AlphaEnergyGlobeScene);
                            }
                        })
                        .catch(err => console.error('[AlphaThree] Error loading energy-globe scene:', err))
                );
            }
        }

        if (!manager.scenesRegistry.has('versorger-flow')) {
            if (window.AlphaVersorgerFlowScene) {
                manager.registerScene('versorger-flow', window.AlphaVersorgerFlowScene);
            } else {
                scenePromises.push(
                    loadScript(`${basePath}/scenes/versorger-flow.js`, `/public/js/three/scenes/versorger-flow.js`)
                        .then(() => {
                            if (window.AlphaVersorgerFlowScene) {
                                manager.registerScene('versorger-flow', window.AlphaVersorgerFlowScene);
                            }
                        })
                        .catch(err => console.error('[AlphaThree] Error loading versorger-flow scene:', err))
                );
            }
        }

        if (scenePromises.length > 0) {
            await Promise.all(scenePromises);
        }

        return manager;
    }

    /**
     * Master AlphaThree Public API
     */
    const AlphaThree = {
        version: '1.0.0',

        /**
         * Initialize a scene in a specific container
         */
        async init(containerOrSelector, sceneName, options = {}) {
            await ensureDependencies();
            return manager.create(containerOrSelector, sceneName, options);
        },

        /**
         * Auto-discover and initialize all [data-three-scene] elements
         */
        async autoInit(root = document) {
            if (isBootstrapping) {
                return new Promise(resolve => bootstrapQueue.push(() => resolve(AlphaThree.autoInit(root))));
            }

            isBootstrapping = true;
            try {
                await ensureDependencies();
                const controllers = manager.autoInit(root);
                initHUDControls(root);
                window.dispatchEvent(new CustomEvent('alphathree:ready', {
                    detail: { count: controllers.length, controllers }
                }));
                return controllers;
            } finally {
                isBootstrapping = false;
                while (bootstrapQueue.length > 0) {
                    const next = bootstrapQueue.shift();
                    next();
                }
            }
        },

        /**
         * Register a custom scene class
         */
        registerScene(name, SceneClass) {
            if (manager) {
                manager.registerScene(name, SceneClass);
            } else {
                // If manager not yet ready, attach once dependencies are loaded
                ensureDependencies().then(() => {
                    manager.registerScene(name, SceneClass);
                });
            }
        },

        /**
         * Get running scene instance for a container
         */
        getScene(idOrContainer) {
            return manager ? manager.getSceneInstance(idOrContainer) : null;
        },

        /**
         * Get SceneController instance
         */
        getController(idOrContainer) {
            return manager ? manager.getController(idOrContainer) : null;
        },

        /**
         * Get registered scene names
         */
        getRegisteredScenes() {
            return manager ? manager.getRegisteredScenes() : ['energy-network', 'energy-globe', 'versorger-flow'];
        },

        /**
         * Destroy a scene instance
         */
        destroy(idOrContainer) {
            return manager ? manager.destroy(idOrContainer) : false;
        },

        /**
         * Destroy all active scenes
         */
        destroyAll() {
            if (manager) manager.destroyAll();
        },

        /**
         * Pause all active rendering loops
         */
        pauseAll() {
            if (manager) manager.pauseAll();
        },

        /**
         * Resume all paused rendering loops
         */
        resumeAll() {
            if (manager) manager.resumeAll();
        },

        /**
         * Check WebGL support
         */
        isWebGLSupported() {
            if (window.AlphaThreeManager && window.AlphaThreeManager.WebGLDetector) {
                return window.AlphaThreeManager.WebGLDetector.isSupported();
            }
            try {
                const canvas = document.createElement('canvas');
                return Boolean(canvas.getContext('webgl2') || canvas.getContext('webgl'));
            } catch (e) {
                return false;
            }
        },

        initHUD(root = document) {
            initHUDControls(root);
        },

        get manager() {
            return manager;
        },

        get PALETTE() {
            return window.AlphaThreeManager ? window.AlphaThreeManager.PALETTE : null;
        }
    };

    /**
     * Automatic declarative HUD binding for mode buttons & burst triggers
     */
    function initHUDControls(root = document) {
        if (!root || !root.querySelectorAll) return;

        // 1. Mode switchers
        const modeButtons = root.querySelectorAll('[data-mode]');
        modeButtons.forEach(btn => {
            if (btn.dataset.threeBound === 'true') return;
            btn.dataset.threeBound = 'true';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const mode = btn.getAttribute('data-mode');
                const targetSelector = btn.getAttribute('data-scene-target');

                let container = targetSelector ? document.querySelector(targetSelector) : null;
                if (!container) {
                    const parentCard = btn.closest('.energy-3d-card, .scene-card, .showcase-card, section');
                    container = parentCard ? parentCard.querySelector('[data-three-scene]') : null;
                }
                if (!container) {
                    container = document.querySelector('[data-three-scene]');
                }

                if (container) {
                    const scene = AlphaThree.getScene(container);
                    if (scene && typeof scene.setMode === 'function') {
                        scene.setMode(mode);
                    }
                    // Update active UI classes
                    const group = btn.closest('.hud-mode-selector, [role="group"]') || btn.parentElement;
                    if (group) {
                        group.querySelectorAll('[data-mode]').forEach(b => {
                            b.classList.remove('active');
                            b.setAttribute('aria-pressed', 'false');
                        });
                        btn.classList.add('active');
                        btn.setAttribute('aria-pressed', 'true');
                    }

                    // Update mode labels smoothly if present
                    const context = btn.closest('.energy-3d-card, .scene-card, .showcase-card, section') || root;
                    const labelEls = context.querySelectorAll('[data-mode-label], .mode-status-text, .alpha-mode-label');
                    labelEls.forEach(lbl => {
                        if (scene && scene.currentConfig && scene.currentConfig.label) {
                            lbl.textContent = scene.currentConfig.label;
                        } else {
                            lbl.textContent = mode.toUpperCase();
                        }
                    });
                }
            });
        });

        // 2. Pulse / Burst Triggers
        const burstButtons = root.querySelectorAll('[data-action="burst"], [data-action="pulse"], #btn-pulse-burst, #btn-burst, #btn-pulse, #btn-globe-pulse');
        burstButtons.forEach(btn => {
            if (btn.dataset.threeBound === 'true') return;
            btn.dataset.threeBound = 'true';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const targetSelector = btn.getAttribute('data-scene-target');

                let container = targetSelector ? document.querySelector(targetSelector) : null;
                if (!container) {
                    const parentCard = btn.closest('.energy-3d-card, .scene-card, .showcase-card, section');
                    container = parentCard ? parentCard.querySelector('[data-three-scene]') : null;
                }
                if (!container) {
                    container = document.querySelector('[data-three-scene]');
                }

                if (container) {
                    const scene = AlphaThree.getScene(container);
                    if (scene && typeof scene.pulseBurst === 'function') {
                        scene.pulseBurst();
                    } else if (scene && typeof scene.pulse === 'function') {
                        scene.pulse();
                    }
                }
            });
        });

        // 3. Dynamic Consumption Controls (kWh)
        const consumptionInputs = root.querySelectorAll('[data-action="consumption"], #consumption-slider, [data-consumption-slider], [data-consumption-input]');
        consumptionInputs.forEach(input => {
            if (input.dataset.threeBound === 'true') return;
            input.dataset.threeBound = 'true';

            const onInput = () => {
                const val = parseFloat(input.value || input.getAttribute('data-consumption'));
                const targetSelector = input.getAttribute('data-scene-target');

                let container = targetSelector ? document.querySelector(targetSelector) : null;
                if (!container) {
                    const parentCard = input.closest('.energy-3d-card, .scene-card, .showcase-card, section');
                    container = parentCard ? parentCard.querySelector('[data-three-scene]') : null;
                }
                if (!container) {
                    container = document.querySelector('[data-three-scene]');
                }

                if (container) {
                    const scene = AlphaThree.getScene(container);
                    if (scene && typeof scene.setConsumption === 'function') {
                        scene.setConsumption(val);
                    }
                }

                const context = input.closest('.energy-3d-card, .scene-card, .showcase-card, section') || root;
                const displayEl = context.querySelector('#consumption-val, [data-consumption-val]');
                if (displayEl && !isNaN(val)) {
                    displayEl.textContent = `${val.toLocaleString('de-DE')} kWh`;
                }
            };

            input.addEventListener('input', onInput);
            input.addEventListener('change', onInput);
        });

        // 4. Hotspot Focus Controls (Solar, Wärmepumpe, Wallbox, Overview)
        const focusButtons = root.querySelectorAll('[data-focus]');
        focusButtons.forEach(btn => {
            if (btn.dataset.threeBound === 'true') return;
            btn.dataset.threeBound = 'true';

            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const focusTarget = btn.getAttribute('data-focus');
                const targetSelector = btn.getAttribute('data-scene-target');

                let container = targetSelector ? document.querySelector(targetSelector) : null;
                if (!container) {
                    const parentCard = btn.closest('.energy-3d-card, .scene-card, .showcase-card, section');
                    container = parentCard ? parentCard.querySelector('[data-three-scene]') : null;
                }
                if (!container) {
                    container = document.querySelector('[data-three-scene]');
                }

                if (container) {
                    const scene = AlphaThree.getScene(container);
                    if (scene && typeof scene.setFocus === 'function') {
                        scene.setFocus(focusTarget);
                    }
                    const group = btn.closest('.hud-focus-selector, [role="group"]') || btn.parentElement;
                    if (group) {
                        group.querySelectorAll('[data-focus]').forEach(b => {
                            b.classList.remove('active');
                            b.setAttribute('aria-pressed', 'false');
                        });
                        btn.classList.add('active');
                        btn.setAttribute('aria-pressed', 'true');
                    }
                }
            });
        });
    }

    // Expose globally
    window.AlphaThree = AlphaThree;

    // Auto-bootstrap on DOM ready
    function onDOMLoaded() {
        // Auto initialize if any declarative [data-three-scene] exists
        const scenesInDOM = document.querySelectorAll('[data-three-scene]');
        if (scenesInDOM.length > 0) {
            AlphaThree.autoInit();
        } else {
            initHUDControls(document);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', onDOMLoaded);
    } else {
        // Already loaded, run immediately
        setTimeout(onDOMLoaded, 0);
    }

})(typeof window !== 'undefined' ? window : this, typeof document !== 'undefined' ? document : {});

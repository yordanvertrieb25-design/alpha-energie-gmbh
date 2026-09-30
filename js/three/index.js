/**
 * Alpha Energie GmbH - Three.js Engine ES Module Entry Point
 * @license Proprietary - Alpha Energie GmbH 2026
 */

import * as THREE from './vendor/three.module.js';
import ManagerModule from './three-manager.js';
import EnergyNetworkScene from './scenes/energy-network.js';
import EnergyGlobeScene from './scenes/energy-globe.js';
import VersorgerFlowScene from './scenes/versorger-flow.js';

const {
    PALETTE,
    WebGLDetector,
    ThreeSceneBase,
    SceneController,
    ThreeManager,
    createGlowTexture
} = ManagerModule;

// Singleton instance
const managerInstance = new ThreeManager();
managerInstance.registerScene('energy-network', EnergyNetworkScene);
managerInstance.registerScene('energy-globe', EnergyGlobeScene);
managerInstance.registerScene('versorger-flow', VersorgerFlowScene);

export const AlphaThree = {
    version: '1.0.0',
    manager: managerInstance,
    PALETTE,
    WebGLDetector,
    ThreeSceneBase,
    SceneController,
    ThreeManager,
    EnergyNetworkScene,
    EnergyGlobeScene,
    VersorgerFlowScene,
    createGlowTexture,

    init(containerOrSelector, sceneName, options = {}) {
        return managerInstance.create(containerOrSelector, sceneName, Object.assign({ THREE }, options));
    },

    autoInit(root = document) {
        return managerInstance.autoInit(root);
    },

    registerScene(name, SceneClass) {
        managerInstance.registerScene(name, SceneClass);
    },

    getScene(idOrContainer) {
        return managerInstance.getSceneInstance(idOrContainer);
    },

    getController(idOrContainer) {
        return managerInstance.getController(idOrContainer);
    },

    getRegisteredScenes() {
        return managerInstance.getRegisteredScenes();
    },

    destroy(idOrContainer) {
        return managerInstance.destroy(idOrContainer);
    },

    destroyAll() {
        managerInstance.destroyAll();
    },

    pauseAll() {
        managerInstance.pauseAll();
    },

    resumeAll() {
        managerInstance.resumeAll();
    },

    isWebGLSupported() {
        return WebGLDetector.isSupported();
    }
};

export {
    THREE,
    PALETTE,
    WebGLDetector,
    ThreeSceneBase,
    SceneController,
    ThreeManager,
    EnergyNetworkScene,
    EnergyGlobeScene,
    VersorgerFlowScene,
    createGlowTexture
};

export default AlphaThree;

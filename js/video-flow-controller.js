/**
 * Alpha Energie GmbH - Smart Home Showcase Video Flow Controller
 * Frame-accurate, timestamp-synchronized video scrollytelling controller.
 *
 * Coordinates:
 * - Viewport Center Detection & Autoplay (rect.top <= 45% && rect.bottom >= 55%)
 * - Smooth viewport centering alignment & accessible scroll-lock mechanism
 * - Dynamic playback rate modulation:
 *     * 0.0s - 2.5s: 1.0x (Normal speed, intro)
 *     * 2.5s - 4.6s: 0.35x (Smooth slow-motion Wallbox Zoom)
 *     * 4.6s - 5.2s: 1.0x (Transition)
 *     * 5.2s - 6.8s: 0.35x (Smooth slow-motion Wärmepumpe Zoom)
 *     * 6.8s - 7.5s: 1.0x (Transition)
 *     * 7.5s - 10.0s: 0.45x (Smooth slow-motion Ganzes Haus / 100 % Ökostrom)
 *     * >= 10.0s: 1.0x (Ended, unlocked, replay option)
 * - Isolated floating callout banners (single active banner at any time)
 * - Interactive stepper pills ([data-video-step="wallbox|waerme|haus"])
 * - Two-way sync with Live-Tarifrechner (#rechner)
 */
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.AlphaVideoFlow = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {
    'use strict';

    // -------------------------------------------------------------
    // Configuration & Stage Definitions
    // -------------------------------------------------------------
    var CONFIG = {
        videoSelector: '#versorger-video, .versorger-video-fullformat-element, video.versorger-video, #scrolly-flow-section video',
        sectionSelector: '#scrolly-flow-section, .versorger-video-fullformat-section, .versorger-flow-section',
        stepperSelector: '[data-video-step], [data-scrolly-step]',
        progressBarSelector: '#scrolly-progress-bar, [data-video-progress]',
        statusBadgeSelector: '#video-status-badge, [data-video-status], #scrolly-step-badge',
        statusLabelSelector: '#scrolly-step-label, [data-video-label]',
        skipButtonSelector: '#btn-video-skip, [data-video-action="skip"], .btn-video-skip',
        replayButtonSelector: '#btn-video-replay, [data-video-action="replay"], .btn-video-replay',
        rechnerSelector: '#rechner, .tarifrechner-card',
        defaultVideoSrc: 'videos/smart-home-flow.mp4',
        fallbackVideoSrc: 'public/videos/smart-home-flow.mp4',
        durationFallback: 10.005
    };

    var STAGES = [
        {
            id: 'intro',
            start: 0.0,
            end: 2.5,
            speed: 1.0,
            banner: null,
            step: null,
            badge: '🏡 Smart Home Tour',
            label: 'Station 1: Haushaltsstrom & Zähler',
            seekTime: 0.0
        },
        {
            id: 'wallbox',
            start: 2.5,
            end: 4.6,
            speed: 0.35,
            banner: 'wallbox',
            step: 'wallbox',
            badge: '🔌 Wallbox-Tarif im Fokus',
            label: 'Station: Wallbox & E-Mobilität',
            seekTime: 2.6
        },
        {
            id: 'transition_waerme',
            start: 4.6,
            end: 5.2,
            speed: 1.0,
            banner: null,
            step: null,
            badge: 'Übergang zur Wärmepumpe...',
            label: 'Kamerafahrt zum Wärmepumpenmodul',
            seekTime: 4.6
        },
        {
            id: 'waerme',
            start: 5.2,
            end: 6.8,
            speed: 0.35,
            banner: 'waerme',
            step: 'waerme',
            badge: '♨️ Wärmepumpen-Tarif im Fokus',
            label: 'Station: Wärmepumpe (§ 14a EnWG)',
            seekTime: 5.3
        },
        {
            id: 'transition_haus',
            start: 6.8,
            end: 7.5,
            speed: 1.0,
            banner: null,
            step: null,
            badge: 'Übergang zur Gesamthausansicht...',
            label: 'Kamerafahrt zur Gebäudeübersicht',
            seekTime: 6.8
        },
        {
            id: 'haus',
            start: 7.5,
            end: 10.0,
            speed: 0.45,
            banner: 'haus', // maps to 'haus' or 'strom'
            step: 'haus',
            badge: '💡 100 % Ökostrom für Ihr Haus',
            label: 'Station: 100 % Ökostrom für Ihr Haus',
            seekTime: 7.6
        },
        {
            id: 'completed',
            start: 10.0,
            end: 999.0,
            speed: 1.0,
            banner: null,
            step: null,
            badge: '✓ Tour abgeschlossen',
            label: 'Alpha Energie Smart Home Tour beendet',
            seekTime: 10.0
        }
    ];

    // -------------------------------------------------------------
    // Controller Internal State
    // -------------------------------------------------------------
    var state = {
        initialized: false,
        video: null,
        section: null,
        isLocked: false,
        hasAutoPlayed: false,
        hasCompletedOnce: false,
        currentStage: null,
        activeBanner: null,
        activeStep: null,
        playbackRate: 1.0,
        rafId: null,
        centerObserver: null,
        lastKnownTime: 0,
        duration: CONFIG.durationFallback,
        listeners: {}
    };

    // -------------------------------------------------------------
    // Event Emitter Helpers
    // -------------------------------------------------------------
    function on(event, callback) {
        if (!state.listeners[event]) state.listeners[event] = [];
        state.listeners[event].push(callback);
    }

    function off(event, callback) {
        if (!state.listeners[event]) return;
        state.listeners[event] = state.listeners[event].filter(function(cb) {
            return cb !== callback;
        });
    }

    function emit(event, data) {
        if (!state.listeners[event]) return;
        state.listeners[event].forEach(function(cb) {
            try { cb(data); } catch (err) { console.error('[AlphaVideoFlow] Event error:', err); }
        });
    }

    // -------------------------------------------------------------
    // CSS Injection for Scroll Lock & Video Hardware Acceleration
    // -------------------------------------------------------------
    function injectDefaultStyles() {
        if (document.getElementById('alpha-video-flow-injected-styles')) return;

        var styleEl = document.createElement('style');
        styleEl.id = 'alpha-video-flow-injected-styles';
        styleEl.textContent = [
            '/* Video Scroll Lock Base */',
            'html.video-scroll-locked, body.video-scroll-locked {',
            '    overflow: hidden !important;',
            '    overscroll-behavior: none !important;',
            '    touch-action: none !important;',
            '}',
            '',
            '/* High-Performance Hardware Accelerated Video Container */',
            '#versorger-video, .versorger-video, .versorger-video-fullformat-element {',
            '    transform: translateZ(0);',
            '    backface-visibility: hidden;',
            '    will-change: transform;',
            '    cursor: pointer;',
            '}'
        ].join('\n');

        document.head.appendChild(styleEl);
    }

    // -------------------------------------------------------------
    // Dynamic Fallback Banner & Control Injection (Disabled for Clean Full-Format)
    // -------------------------------------------------------------
    function ensureBannersAndControls() {
        // Clean Full-Format Cinematic Mode:
        // Explicit directive: "kein text oder playbuttons zeigen und video in vollformat"
        // Do NOT dynamically inject banners or HUD buttons onto the video viewport.
        return;
    }

    // -------------------------------------------------------------
    // Scroll Lock Mechanism
    // -------------------------------------------------------------
    var BLOCKED_KEY_CODES = new Set([
        'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ', 'Space'
    ]);

    function onWheelPrevent(e) {
        if (state.isLocked) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function onTouchPrevent(e) {
        if (state.isLocked) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function onKeydownPrevent(e) {
        if (!state.isLocked) return;

        // Escape cancels scroll lock immediately
        if (e.key === 'Escape' || e.keyCode === 27) {
            e.preventDefault();
            unlockScroll('escape_key');
            return;
        }

        if (BLOCKED_KEY_CODES.has(e.key) || BLOCKED_KEY_CODES.has(e.code)) {
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    }

    function lockScroll() {
        if (state.isLocked) return;

        // Honor user motion preferences
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            return;
        }

        state.isLocked = true;

        // Non-passive event interception for 100% reliable wheel/touch freeze
        window.addEventListener('wheel', onWheelPrevent, { passive: false });
        window.addEventListener('touchmove', onTouchPrevent, { passive: false });
        window.addEventListener('keydown', onKeydownPrevent, { passive: false });

        // CSS class toggle
        document.body.classList.add('video-scroll-locked');
        document.documentElement.classList.add('video-scroll-locked');

        // Toggle buttons
        toggleSkipButton(true);
        toggleReplayButton(false);

        emit('scrollLockChange', { isLocked: true });
    }

    function unlockScroll(reason) {
        if (!state.isLocked) return;

        state.isLocked = false;

        window.removeEventListener('wheel', onWheelPrevent);
        window.removeEventListener('touchmove', onTouchPrevent);
        window.removeEventListener('keydown', onKeydownPrevent);

        document.body.classList.remove('video-scroll-locked');
        document.documentElement.classList.remove('video-scroll-locked');

        toggleSkipButton(false);

        emit('scrollLockChange', { isLocked: false, reason: reason || 'manual' });
    }

    function isLocked() {
        return state.isLocked;
    }

    function toggleSkipButton(visible) {
        var skipBtn = document.querySelector(CONFIG.skipButtonSelector);
        if (!skipBtn) return;
        if (visible) {
            skipBtn.classList.remove('is-hidden');
            skipBtn.style.display = '';
            skipBtn.setAttribute('aria-hidden', 'false');
        } else {
            skipBtn.classList.add('is-hidden');
            skipBtn.style.display = 'none';
            skipBtn.setAttribute('aria-hidden', 'true');
        }
    }

    function toggleReplayButton(visible) {
        var replayBtn = document.querySelector(CONFIG.replayButtonSelector);
        if (!replayBtn) return;
        if (visible) {
            replayBtn.classList.remove('is-hidden');
            replayBtn.style.display = 'inline-flex';
            replayBtn.setAttribute('aria-hidden', 'false');
        } else {
            replayBtn.classList.add('is-hidden');
            replayBtn.style.display = 'none';
            replayBtn.setAttribute('aria-hidden', 'true');
        }
    }

    // -------------------------------------------------------------
    // Viewport Centering & Smooth Alignment
    // -------------------------------------------------------------
    function alignToCenter(smooth) {
        var target = state.section || state.video;
        if (!target) return;

        var rect = target.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;
        var currentCenter = rect.top + (rect.height / 2);
        var targetCenter = vh / 2;
        var offset = currentCenter - targetCenter;

        if (Math.abs(offset) > 24) {
            window.scrollBy({
                top: offset,
                behavior: smooth !== false ? 'smooth' : 'auto'
            });
        }
    }

    function checkCenterViewport() {
        // Do NOT forcefully re-lock if completed or already autoplayed once
        if (state.hasAutoPlayed || state.hasCompletedOnce || state.isLocked) return;

        var target = state.section || state.video;
        if (!target) return;

        var rect = target.getBoundingClientRect();
        var vh = window.innerHeight || document.documentElement.clientHeight;

        // Viewport Center condition:
        // rect.top <= window.innerHeight * 0.45 && rect.bottom >= window.innerHeight * 0.55
        var isAtCenter = (rect.top <= vh * 0.45) && (rect.bottom >= vh * 0.55);

        if (isAtCenter) {
            state.hasAutoPlayed = true;

            // Smoothly align into center
            alignToCenter(true);

            // Allow smooth scroll glide to initiate before full scroll lock
            setTimeout(function() {
                lockScroll();
                play();
            }, 180);
        }
    }

    // -------------------------------------------------------------
    // Dynamic Timestamp & Playback Rate Modulation
    // -------------------------------------------------------------
    function getStageForTime(time) {
        for (var i = 0; i < STAGES.length; i++) {
            var st = STAGES[i];
            if (time >= st.start && time < st.end) {
                return st;
            }
        }
        return STAGES[STAGES.length - 1];
    }

    function setSpeed(rate) {
        if (!state.video) return;
        var target = Math.max(0.1, Math.min(4.0, rate));
        if (Math.abs(state.video.playbackRate - target) > 0.02) {
            state.video.playbackRate = target;
            state.playbackRate = target;
        }
    }

    function updateBanners(activeBannerKey) {
        var banners = document.querySelectorAll('[data-video-banner], [data-banner-id], .video-tariff-banner, .video-callout-banner');
        if (!banners || banners.length === 0) return;

        banners.forEach(function(banner) {
            var bannerId = banner.getAttribute('data-video-banner') ||
                           banner.getAttribute('data-banner-id') ||
                           (banner.classList.contains('banner-wallbox') ? 'wallbox' :
                            banner.classList.contains('banner-waerme') ? 'waerme' :
                            banner.classList.contains('banner-haus') ? 'haus' : null);

            var isActive = false;
            if (activeBannerKey) {
                if (bannerId === activeBannerKey) {
                    isActive = true;
                } else if (activeBannerKey === 'haus' && (bannerId === 'strom' || bannerId === 'hausstrom')) {
                    isActive = true;
                }
            }

            if (isActive) {
                banner.classList.add('active');
                banner.setAttribute('aria-hidden', 'false');
            } else {
                banner.classList.remove('active');
                banner.setAttribute('aria-hidden', 'true');
            }
        });

        state.activeBanner = activeBannerKey;
    }

    function updateHud(time, speed) {
        var curEl = document.getElementById('video-time-cur');
        if (curEl) {
            var safeTime = Math.max(0, time || 0);
            var m = Math.floor(safeTime / 60);
            var s = Math.floor(safeTime % 60);
            curEl.textContent = m + ':' + (s < 10 ? '0' : '') + s;
        }
        var durEl = document.getElementById('video-time-dur');
        if (durEl) {
            var dur = (state.video && state.video.duration && !isNaN(state.video.duration)) ? state.video.duration : state.duration;
            var dm = Math.floor(dur / 60);
            var ds = Math.floor(dur % 60);
            durEl.textContent = dm + ':' + (ds < 10 ? '0' : '') + ds;
        }
        var speedEl = document.getElementById('video-speed-display');
        if (speedEl) {
            var curSpeed = speed || state.playbackRate || 1.0;
            var val = parseFloat(curSpeed);
            speedEl.textContent = (Math.abs(val - 1.0) < 0.01 ? '1.0' : val.toFixed(2).replace(/0$/, '')) + 'x';
        }
        var togglePlayBtn = document.getElementById('btn-video-toggle-play');
        if (togglePlayBtn && state.video) {
            var isPaused = state.video.paused || state.video.ended;
            var icon = togglePlayBtn.querySelector('.hud-play-icon');
            var text = togglePlayBtn.querySelector('.hud-btn-text');
            if (icon) icon.textContent = isPaused ? '▶' : '❚❚';
            if (text) text.textContent = isPaused ? 'Play' : 'Pause';
            togglePlayBtn.setAttribute('aria-label', isPaused ? 'Video abspielen' : 'Video pausieren');
        }
    }

    function updateSteppers(activeStepKey) {
        var pills = document.querySelectorAll(CONFIG.stepperSelector);
        if (!pills || pills.length === 0) return;

        pills.forEach(function(pill) {
            var step = pill.getAttribute('data-video-step') || pill.getAttribute('data-scrolly-step');
            var matches = false;

            if (activeStepKey) {
                if (step === activeStepKey) {
                    matches = true;
                } else if (activeStepKey === 'haus' && (step === 'strom' || step === 'hausstrom')) {
                    matches = true;
                }
            }

            if (matches) {
                pill.classList.add('active');
                pill.setAttribute('aria-selected', 'true');
            } else {
                pill.classList.remove('active');
                pill.setAttribute('aria-selected', 'false');
            }
        });

        state.activeStep = activeStepKey;
    }

    function updateProgressBar(currentTime) {
        var progressBars = document.querySelectorAll(CONFIG.progressBarSelector);
        if (!progressBars || progressBars.length === 0) return;

        var total = (state.video && state.video.duration) ? state.video.duration : state.duration;
        var percent = Math.min(100, Math.max(0, (currentTime / total) * 100));

        progressBars.forEach(function(bar) {
            bar.style.width = percent.toFixed(1) + '%';
        });
    }

    function updateStatusBadges(stage) {
        if (!stage) return;

        var badges = document.querySelectorAll(CONFIG.statusBadgeSelector);
        badges.forEach(function(el) {
            if (el.id === 'scrolly-step-badge') {
                if (stage.id === 'wallbox') el.textContent = 'Station 1 von 3';
                else if (stage.id === 'waerme') el.textContent = 'Station 2 von 3';
                else if (stage.id === 'haus') el.textContent = 'Station 3 von 3';
                else if (stage.id === 'completed') el.textContent = '✓ Abgeschlossen';
                else el.textContent = 'Smart Home Tour';
            } else {
                el.textContent = stage.badge;
            }
        });

        var labels = document.querySelectorAll(CONFIG.statusLabelSelector);
        labels.forEach(function(el) {
            el.textContent = stage.label;
        });
    }

    function evaluateFrame(time) {
        state.lastKnownTime = time;
        var stage = getStageForTime(time);

        // Dynamic Playback Rate Modulation
        setSpeed(stage.speed);

        // Stage change event
        if (state.currentStage !== stage.id) {
            state.currentStage = stage.id;
            emit('stageChange', stage);
        }

        // Isolated Banner Display
        updateBanners(stage.banner);

        // Stepper Pills Sync
        updateSteppers(stage.step);

        // Progress Line Sync
        updateProgressBar(time);

        // Status Badges & Labels
        updateStatusBadges(stage);

        // Update HUD Controls (Timer, Speed, Play/Pause)
        updateHud(time, stage.speed);

        // Completion Handling (>= 10.0s or ended)
        if (time >= 10.0 || (state.video && state.video.ended)) {
            handleTourEnded();
        }
    }

    function handleTourEnded() {
        if (state.hasCompletedOnce && !state.isLocked) return;

        state.hasCompletedOnce = true;
        setSpeed(1.0);
        unlockScroll('tour_ended');

        toggleSkipButton(false);
        toggleReplayButton(true);

        var stage = STAGES[STAGES.length - 1]; // completed
        updateStatusBadges(stage);
        updateBanners(null);
        updateHud(state.duration, 1.0);

        emit('ended', { completed: true });
    }

    // -------------------------------------------------------------
    // Animation Frame Loop
    // -------------------------------------------------------------
    function startLoop() {
        if (state.rafId) return;

        function tick() {
            if (state.video && !state.video.paused && !state.video.ended) {
                evaluateFrame(state.video.currentTime);
                state.rafId = requestAnimationFrame(tick);
            } else {
                state.rafId = null;
            }
        }

        state.rafId = requestAnimationFrame(tick);
    }

    function stopLoop() {
        if (state.rafId) {
            cancelAnimationFrame(state.rafId);
            state.rafId = null;
        }
    }

    // -------------------------------------------------------------
    // Public Playback Methods
    // -------------------------------------------------------------
    function play() {
        if (!state.video) return Promise.reject(new Error('Video not initialized'));

        // Always ensure audio is muted for guaranteed mobile/desktop autoplay policy compliance
        state.video.muted = true;

        var playPromise = state.video.play();
        if (playPromise !== undefined) {
            return playPromise.then(function() {
                startLoop();
                emit('play', { currentTime: state.video.currentTime });
            }).catch(function(err) {
                console.warn('[AlphaVideoFlow] Autoplay prevented by browser:', err);
                // Graceful fallback: do not lock scroll if autoplay fails
                unlockScroll('autoplay_prevented');
            });
        }
        return Promise.resolve();
    }

    function pause() {
        if (!state.video) return;
        state.video.pause();
        stopLoop();

        // If user manually pauses, release scroll lock so they aren't trapped
        unlockScroll('user_paused');
        emit('pause', { currentTime: state.video.currentTime });
    }

    function seek(timeInSeconds, andPlay) {
        if (!state.video) return;

        var safeTime = Math.max(0, Math.min(state.duration, timeInSeconds));
        state.video.currentTime = safeTime;

        evaluateFrame(safeTime);

        if (andPlay) {
            play();
        }
    }

    function replay() {
        state.hasCompletedOnce = false;
        seek(0.0, false);
        setSpeed(1.0);
        alignToCenter(true);

        setTimeout(function() {
            lockScroll();
            play();
        }, 150);

        toggleReplayButton(false);
        toggleSkipButton(true);
        emit('replay', { timestamp: 0.0 });
    }

    function skip() {
        state.hasCompletedOnce = true;
        unlockScroll('skipped_by_user');
        toggleSkipButton(false);
        toggleReplayButton(true);
        emit('skip', { currentTime: state.video ? state.video.currentTime : 0 });
    }

    // -------------------------------------------------------------
    // Two-Way Sync with Live-Tarifrechner (#rechner)
    // -------------------------------------------------------------
    function syncToRechner(targetBranch, targetFocus) {
        // 1. Release scroll lock so user can navigate to the calculator
        unlockScroll('rechner_sync');

        var branch = targetBranch || 'strom';

        // 2. Select matching calculator tab (Ökostrom | Wärmestrom | Erdgas)
        var matchingTab = document.querySelector('.calc-tab-btn[data-branch="' + branch + '"]');
        if (matchingTab) {
            if (!matchingTab.classList.contains('active')) {
                matchingTab.click();
            }
            var allTabs = document.querySelectorAll('.calc-tab-btn');
            allTabs.forEach(function(t) {
                t.classList.remove('active');
                t.setAttribute('aria-selected', 'false');
            });
            matchingTab.classList.add('active');
            matchingTab.setAttribute('aria-selected', 'true');
        }

        // 3. Smoothly scroll down or up to #rechner
        var rechnerEl = document.querySelector(CONFIG.rechnerSelector);
        if (rechnerEl) {
            rechnerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });

            // Apply attention glow pulse
            rechnerEl.classList.remove('calc-highlight-pulse');
            void rechnerEl.offsetWidth; // Reflow trigger
            rechnerEl.classList.add('calc-highlight-pulse');

            setTimeout(function() {
                rechnerEl.classList.remove('calc-highlight-pulse');
            }, 3200);
        }

        emit('rechnerSync', { branch: branch, focus: targetFocus });
    }

    // -------------------------------------------------------------
    // Event Delegation & UI Wire-Up
    // -------------------------------------------------------------
    function setupInteractions() {
        // Global Escape key handler to immediately unlock scrolling at any time
        window.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' || e.keyCode === 27) {
                if (state.isLocked) {
                    unlockScroll('escape_key');
                }
            }
        }, true);

        // Click delegation on document
        document.addEventListener('click', function(e) {
            // Click on video or full-format container unlocks scroll & toggles playback
            var clickedVideo = e.target.closest(CONFIG.videoSelector) ||
                               e.target.closest('#versorger-video-container') ||
                               e.target.closest('.versorger-video-fullformat-container') ||
                               e.target.closest('.versorger-video-fullformat-section');
            if (clickedVideo && !e.target.closest('a, button')) {
                e.preventDefault();
                if (state.isLocked) {
                    unlockScroll('video_click');
                }
                if (state.video) {
                    if (state.video.paused || state.video.ended) {
                        play();
                    } else {
                        pause();
                    }
                }
                return;
            }

            // Stepper pills click navigation
            var stepBtn = e.target.closest(CONFIG.stepperSelector);
            if (stepBtn) {
                e.preventDefault();
                var stepKey = stepBtn.getAttribute('data-video-step') || stepBtn.getAttribute('data-scrolly-step');

                if (stepKey === 'wallbox') {
                    seek(2.6, true);
                    setSpeed(0.35);
                } else if (stepKey === 'waerme') {
                    seek(5.3, true);
                    setSpeed(0.35);
                } else if (stepKey === 'haus' || stepKey === 'strom') {
                    seek(7.6, true);
                    setSpeed(0.45);
                } else if (stepKey === 'solar') {
                    seek(8.5, true);
                    setSpeed(0.45);
                }
                return;
            }

            // Skip button click
            var skipBtn = e.target.closest(CONFIG.skipButtonSelector);
            if (skipBtn) {
                e.preventDefault();
                skip();
                return;
            }

            // Replay button click
            var replayBtn = e.target.closest(CONFIG.replayButtonSelector);
            if (replayBtn) {
                e.preventDefault();
                replay();
                return;
            }

            // Video HUD Play/Pause toggle
            var togglePlayBtn = e.target.closest('#btn-video-toggle-play, .video-hud-btn');
            if (togglePlayBtn) {
                e.preventDefault();
                if (state.video) {
                    if (state.video.paused || state.video.ended) {
                        play();
                    } else {
                        pause();
                    }
                }
                return;
            }

            // Banner CTA click (Two-Way Sync to #rechner)
            var bannerCta = e.target.closest('.btn-rechner-sync, [data-video-banner] a[href="#rechner"]');
            if (bannerCta) {
                e.preventDefault();
                var branch = bannerCta.getAttribute('data-branch') ||
                             (bannerCta.closest('[data-video-banner="waerme"]') ? 'waerme' : 'strom');
                var focus = bannerCta.getAttribute('data-focus') || branch;
                syncToRechner(branch, focus);
                return;
            }
        });

        // Window scroll & viewport detection
        var scrollThrottle = false;
        window.addEventListener('scroll', function() {
            if (scrollThrottle) return;
            scrollThrottle = true;
            requestAnimationFrame(function() {
                checkCenterViewport();
                scrollThrottle = false;
            });
        }, { passive: true });

        // IntersectionObserver for pre-warming video and triggering center check
        if ('IntersectionObserver' in window && state.section) {
            state.centerObserver = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        checkCenterViewport();
                    }
                });
            }, {
                threshold: [0.1, 0.25, 0.45, 0.55, 0.75]
            });

            state.centerObserver.observe(state.section);
        }
    }

    // -------------------------------------------------------------
    // Video Element Initialization & Normalization
    // -------------------------------------------------------------
    function setupVideoElement() {
        var video = document.querySelector(CONFIG.videoSelector);

        // Self-healing: If no video tag exists, create one inside #scrolly-flow-section
        if (!video && state.section) {
            var container = state.section.querySelector('#versorger-video-container') ||
                            state.section.querySelector('.versorger-video-fullformat-container') ||
                            state.section.querySelector('.scrolly-sticky-frame') ||
                            state.section.querySelector('.versorger-3d-viewport') ||
                            state.section;

            video = document.createElement('video');
            video.id = 'versorger-video';
            video.className = 'versorger-video-fullformat-element';
            video.src = CONFIG.defaultVideoSrc;
            video.style.cssText = 'width: 100%; height: 100%; object-fit: cover; border: none;';
            container.appendChild(video);
        }

        if (!video) return null;

        // Force bulletproof HTML5 attributes
        video.muted = true;
        video.defaultMuted = true;
        video.playsInline = true;
        video.setAttribute('playsinline', '');
        video.setAttribute('webkit-playsinline', '');
        video.preload = 'auto';
        video.loop = false;

        // Ensure video has a source
        if (!video.src && video.querySelectorAll('source').length === 0) {
            video.src = CONFIG.defaultVideoSrc;
        }

        // Direct click on video to toggle playback & unlock scroll
        video.addEventListener('click', function(e) {
            e.preventDefault();
            if (state.isLocked) {
                unlockScroll('video_click');
            }
            if (video.paused || video.ended) {
                play();
            } else {
                pause();
            }
        });

        // Video event listeners
        video.addEventListener('loadedmetadata', function() {
            if (video.duration && !isNaN(video.duration)) {
                state.duration = video.duration;
            }
        });

        video.addEventListener('timeupdate', function() {
            evaluateFrame(video.currentTime);
        });

        video.addEventListener('ended', function() {
            handleTourEnded();
        });

        video.addEventListener('pause', function() {
            // Unlock scrolling immediately on pause
            unlockScroll('video_paused');
        });

        video.addEventListener('error', function(err) {
            console.warn('[AlphaVideoFlow] Primary video source load issue, checking fallback...', err);
            if (video.src && !video.src.includes('public/videos') && CONFIG.fallbackVideoSrc) {
                video.src = CONFIG.fallbackVideoSrc;
                video.load();
            }
            unlockScroll('video_error');
        });

        video.addEventListener('stalled', function() {
            // Safety unlock on stalled connection
            unlockScroll('video_stalled');
        });

        return video;
    }

    // -------------------------------------------------------------
    // Initialization Entry Point
    // -------------------------------------------------------------
    function init(options) {
        if (state.initialized) {
            return this;
        }

        if (options && typeof options === 'object') {
            for (var k in options) {
                if (options.hasOwnProperty(k) && CONFIG.hasOwnProperty(k)) {
                    CONFIG[k] = options[k];
                }
            }
        }

        state.section = document.querySelector(CONFIG.sectionSelector);
        state.video = setupVideoElement();

        // Inject styles & dynamic DOM banners
        injectDefaultStyles();
        ensureBannersAndControls();

        // Set up interactions & scroll checks
        setupInteractions();

        state.initialized = true;

        // Initial viewport check in case user refreshed mid-page
        setTimeout(function() {
            checkCenterViewport();
        }, 120);

        emit('init', { video: state.video, section: state.section });
        return this;
    }

    function destroy() {
        stopLoop();
        unlockScroll('destroy');

        if (state.centerObserver && state.section) {
            state.centerObserver.unobserve(state.section);
            state.centerObserver.disconnect();
        }

        state.initialized = false;
        state.listeners = {};
    }

    function getState() {
        return {
            initialized: state.initialized,
            isPlaying: state.video ? (!state.video.paused && !state.video.ended) : false,
            isLocked: state.isLocked,
            currentTime: state.video ? state.video.currentTime : 0,
            duration: state.duration,
            playbackRate: state.playbackRate,
            currentStage: state.currentStage,
            activeBanner: state.activeBanner,
            activeStep: state.activeStep,
            hasAutoPlayed: state.hasAutoPlayed,
            hasCompletedOnce: state.hasCompletedOnce
        };
    }

    // Auto-initialize on DOM ready if running in browser
    if (typeof document !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                init();
            });
        } else {
            setTimeout(function() {
                init();
            }, 10);
        }
    }

    // -------------------------------------------------------------
    // Export Public API
    // -------------------------------------------------------------
    return {
        init: init,
        play: play,
        pause: pause,
        seek: seek,
        setSpeed: setSpeed,
        lockScroll: lockScroll,
        unlockScroll: unlockScroll,
        isLocked: isLocked,
        replay: replay,
        skip: skip,
        syncToRechner: syncToRechner,
        getState: getState,
        destroy: destroy,
        on: on,
        off: off,
        STAGES: STAGES,
        CONFIG: CONFIG
    };
}));

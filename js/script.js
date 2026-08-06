/* ══════════════════════════════════════════════════════════
   VITALSENSE — SITE SCRIPT
   Replicated design system: particles, cursor, reveal,
   tilt, magnetic, interactive demo, parallax orbs
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ─────────────────────────────────────
    // 1. PARTICLE SYSTEM
    // ─────────────────────────────────────
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = -1000, mouseY = -1000;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor() { this.reset(); }

        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.8 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.5 + 0.1;
            // Cyan (185°) / Purple (260°) / Teal (165°)
            const r = Math.random();
            this.hue = r > 0.6 ? 91 : (r > 0.3 ? 91 : 271);
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse repel
            const dx = this.x - mouseX;
            const dy = this.y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 120) {
                const force = (120 - dist) / 120 * 0.8;
                this.x += (dx / dist) * force;
                this.y += (dy / dist) * force;
            }

            // Wrap
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 80%, 65%, ${this.opacity})`;
            ctx.fill();
        }
    }

    function initParticles() {
        const count = Math.min(Math.floor((canvas.width * canvas.height) / 12000), 120);
        particles = [];
        for (let i = 0; i < count; i++) particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 100) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(115, 217, 20, ${0.06 * (1 - dist / 100)})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => { p.update(); p.draw(); });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }

    resizeCanvas();
    initParticles();
    animateParticles();

    window.addEventListener('resize', () => { resizeCanvas(); initParticles(); });
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

    // ─────────────────────────────────────
    // 2. NAVBAR SCROLL EFFECT
    // ─────────────────────────────────────
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 80);
    }, { passive: true });

    // ─────────────────────────────────────
    // ORB SCROLL MORPH  (clip-path: circle)
    // Hidden on hero → full-bleed appears + contracts
    // into the orb circle as user scrolls to the
    // problem section. Lands exactly when anchor is centred.
    // ─────────────────────────────────────
    const orbOverlay = document.getElementById('orb-overlay');
    const orbAnchor  = document.getElementById('orb-anchor');
    const orbImg     = document.getElementById('orb-img');

    if (orbOverlay && orbAnchor && orbImg) {
        const lerp = (a, b, t) => a + (b - a) * t;
        const vmax = () => Math.max(window.innerWidth, window.innerHeight);

        // State — starts as a tiny invisible circle (so it pops in, not a big blob)
        let curR  = 0;
        let curCX = window.innerWidth  / 2;
        let curCY = window.innerHeight / 2;
        let curOpacity = 0;

        function getTargets() {
            const scrollY = window.scrollY;
            const vw      = window.innerWidth;
            const vh      = window.innerHeight;
            const heroEl  = document.getElementById('hero');
            const heroH   = heroEl ? heroEl.offsetHeight : vh;

            // -- When is progress = 1? --
            // When the anchor's centre is at the viewport centre.
            const anchorRect     = orbAnchor.getBoundingClientRect();
            const anchorCenterY  = anchorRect.top + anchorRect.height / 2;
            // scrollY at which anchor centre == vh/2  (i.e. centred in viewport)
            const scrollAtLand   = scrollY + anchorCenterY - vh / 2;
            // Animation runs from scrollY=heroH*0.15 → scrollAtLand
            const scrollStart    = heroH * 0.15;
            const scrollEnd      = Math.max(scrollStart + 1, scrollAtLand);
            const progress       = Math.max(0, Math.min(1,
                (scrollY - scrollStart) / (scrollEnd - scrollStart)
            ));

            // START state: huge circle at viewport centre (fully covers everything)
            const startR  = vmax() * 1.5;
            const startCX = vw / 2;
            const startCY = vh / 2;

            // END state: exact circle at anchor centre
            const destCX  = anchorRect.left + anchorRect.width  / 2;
            const destCY  = anchorCenterY;
            const destR   = anchorRect.width / 2;

            return {
                r:       progress < 0.001 ? 0 : lerp(startR, destR, progress),
                cx:      lerp(startCX, destCX, progress),
                cy:      lerp(startCY, destCY, progress),
                // opacity 0 on hero, ramps up quickly once scroll starts, full at progress=0.3
                opacity: Math.min(1, progress / 0.3),
            };
        }

        function orbRAF() {
            const target   = getTargets();
            const lerpAmt  = 0.09;

            curR       = lerp(curR,       target.r,       lerpAmt);
            curCX      = lerp(curCX,      target.cx,      lerpAmt);
            curCY      = lerp(curCY,      target.cy,      lerpAmt);
            curOpacity = lerp(curOpacity, target.opacity, lerpAmt);

            // Only show overlay if we've started scrolling at all
            if (curOpacity < 0.005) {
                orbOverlay.style.visibility = 'hidden';
            } else {
                orbOverlay.style.visibility = 'visible';
                orbOverlay.style.clipPath        = `circle(${Math.max(0, curR).toFixed(1)}px at ${curCX.toFixed(1)}px ${curCY.toFixed(1)}px)`;
                orbOverlay.style.webkitClipPath  = orbOverlay.style.clipPath;
                orbImg.style.opacity             = curOpacity.toFixed(3);
            }

            requestAnimationFrame(orbRAF);
        }

        orbRAF();
    }

    // ─────────────────────────────────────
    // EXPANDABLE CARD STACK (Key Capabilities)
    // ─────────────────────────────────────
    const capStack = document.getElementById('cap-stack');
    if (capStack) {
        const cards = capStack.querySelectorAll('.cap-card');
        let openCard = null;

        cards.forEach((card, idx) => {
            // Set CSS variable for accent color used by CSS selectors
            const accent = card.dataset.accent || 'var(--cyan)';
            card.style.setProperty('--cap-accent', accent);
            card.style.setProperty('--accent', accent);
            // Initial z-index: top card on top
            card.style.zIndex = cards.length - idx;

            card.addEventListener('click', () => {
                const isAlreadyOpen = card.classList.contains('cap-open');

                // Close any open card
                if (openCard && openCard !== card) {
                    openCard.classList.remove('cap-open');
                    openCard.style.zIndex = cards.length - [...cards].indexOf(openCard);
                }

                if (isAlreadyOpen) {
                    card.classList.remove('cap-open');
                    card.style.zIndex = cards.length - idx;
                    openCard = null;
                } else {
                    card.classList.add('cap-open');
                    card.style.zIndex = 20;
                    openCard = card;
                }
            });
        });
    }



    // ─────────────────────────────────────
    // 3. MOBILE NAV TOGGLE
    // ─────────────────────────────────────
    const navToggle = document.getElementById('nav-toggle');
    const navLinks = document.getElementById('nav-links');

    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('active');
            navLinks.classList.toggle('open');
        });
        navLinks.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                navToggle.classList.remove('active');
                navLinks.classList.remove('open');
            });
        });
    }

    // ─────────────────────────────────────
    // 4. SCROLL REVEAL (IntersectionObserver)
    // ─────────────────────────────────────
    const revealItems = document.querySelectorAll('.reveal-item');
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revealItems.forEach(item => revealObserver.observe(item));

    // ── Horizontal card flow reveal (staggered) ──
    const hCards = document.querySelectorAll('.reveal-hcard');
    const hCardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const idx = [...hCards].indexOf(entry.target);
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, idx * 120);
                hCardObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15, rootMargin: '0px 0px -30px 0px' });
    hCards.forEach(card => hCardObserver.observe(card));

    // ─────────────────────────────────────
    // 5. SMOOTH ANCHOR SCROLLING
    // ─────────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                e.preventDefault();
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // ─────────────────────────────────────
    // 6. INTERACTIVE DEMO — Rotate / Lock-In
    // ─────────────────────────────────────
    const demoDevice = document.getElementById('demo-device');
    const demoPortrait = document.getElementById('demo-portrait');
    const demoLandscape = document.getElementById('demo-landscape');
    const demoCountdown = document.getElementById('demo-countdown');
    const demoRisk = document.getElementById('demo-risk');

    let isLandscape = false;
    let isAnimating = false;
    let riskInterval = null;

    if (demoDevice) {
        demoDevice.addEventListener('click', handleDemoToggle);
        // Keyboard accessibility
        demoDevice.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleDemoToggle();
            }
        });
    }

    function handleDemoToggle() {
        if (isAnimating) return;
        isAnimating = true;
        isLandscape = !isLandscape;

        if (isLandscape) {
            // ─── Enter Landscape (Risk Monitor Mode) ───
            demoDevice.classList.add('landscape-mode');
            demoPortrait.classList.add('hidden');

            setTimeout(() => {
                demoLandscape.classList.add('active');
                if (demoRisk) { demoRisk.classList.remove('active'); demoRisk.style.display = 'none'; }

                runCountdown(3, () => {
                    demoCountdown.classList.remove('active');
                    demoCountdown.style.display = 'none';
                    if (demoRisk) {
                        demoRisk.style.display = 'flex';
                        demoRisk.classList.add('active');
                    }
                    isAnimating = false;
                    startRiskAnimation();
                });
            }, 500);
        } else {
            // ─── Exit to Portrait ───
            demoDevice.classList.remove('landscape-mode');
            demoLandscape.classList.remove('active');
            if (riskInterval) clearInterval(riskInterval);

            setTimeout(() => {
                demoPortrait.classList.remove('hidden');
                if (demoRisk) { demoRisk.classList.remove('active'); demoRisk.style.display = 'none'; }
                demoCountdown.classList.remove('active');
                demoCountdown.style.display = 'none';
                isAnimating = false;
            }, 500);
        }
    }

    function runCountdown(from, done) {
        let count = from;
        demoCountdown.style.display = 'block';
        demoCountdown.classList.add('active');
        demoCountdown.textContent = count;

        demoCountdown.style.animation = 'none';
        demoCountdown.offsetHeight; // reflow
        demoCountdown.style.animation = 'countdownPop 0.5s var(--ease-spring)';

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                demoCountdown.textContent = count;
                demoCountdown.style.animation = 'none';
                demoCountdown.offsetHeight;
                demoCountdown.style.animation = 'countdownPop 0.5s var(--ease-spring)';
            } else {
                clearInterval(interval);
                if (done) done();
            }
        }, 1000);
    }

    function startRiskAnimation() {
        // Cycle through risk score states as a demo
        const riskValueEl = document.getElementById('demo-risk-value');
        const riskBadgeEl = document.getElementById('demo-risk-badge');
        if (!riskValueEl || !riskBadgeEl) return;

        const states = [
            { score: 'LOW', badge: 'LOW RISK', cls: 'risk-low-style' },
            { score: 'MED', badge: 'MEDIUM RISK', cls: 'risk-med-style' },
            { score: 'LOW', badge: 'LOW RISK', cls: 'risk-low-style' },
        ];
        let idx = 0;

        function applyState(s) {
            riskValueEl.textContent = s.score;
            riskBadgeEl.textContent = s.badge;
            riskBadgeEl.className = 'demo-risk-badge';
            if (s.score === 'LOW') {
                riskBadgeEl.style.background = 'rgba(0,229,160,0.15)';
                riskBadgeEl.style.color = '#00e5a0';
                riskBadgeEl.style.borderColor = 'rgba(0,229,160,0.3)';
            } else {
                riskBadgeEl.style.background = 'rgba(255,165,60,0.15)';
                riskBadgeEl.style.color = '#ffaa3c';
                riskBadgeEl.style.borderColor = 'rgba(255,165,60,0.3)';
            }
        }

        applyState(states[0]);
        riskInterval = setInterval(() => {
            idx = (idx + 1) % states.length;
            applyState(states[idx]);
        }, 3000);
    }

    // ─────────────────────────────────────
    // 7. 3D TILT ON HOVER (cards)
    // ─────────────────────────────────────
    document.querySelectorAll('.state-card, .feature-card, .team-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -4;
            const rotY = ((x - cx) / cx) * 4;
            card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-4px)`;
        });
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ─────────────────────────────────────
    // 8. PARALLAX ORBS ON SCROLL
    // ─────────────────────────────────────
    const orbs = document.querySelectorAll('.orb');
    let ticking = false;

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(() => {
                const scrollY = window.scrollY;
                orbs.forEach((orb, i) => {
                    const speed = 0.02 + i * 0.01;
                    orb.style.transform = `translateY(${scrollY * speed}px)`;
                });
                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // ─────────────────────────────────────
    // 9. CUSTOM CURSOR
    // ─────────────────────────────────────
    const cursorDot = document.getElementById('cursor-dot');
    const cursorGlow = document.getElementById('cursor-glow');

    if (cursorDot && cursorGlow) {
        let glowX = window.innerWidth / 2;
        let glowY = window.innerHeight / 2;
        let currentX = window.innerWidth / 2;
        let currentY = window.innerHeight / 2;

        document.addEventListener('mousemove', e => {
            currentX = e.clientX;
            currentY = e.clientY;
            cursorDot.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
        });

        document.addEventListener('mousedown', () => cursorGlow.classList.add('click'));
        document.addEventListener('mouseup', () => cursorGlow.classList.remove('click'));

        function animateCursor() {
            glowX += (currentX - glowX) * 0.2;
            glowY += (currentY - glowY) * 0.2;
            cursorGlow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
            requestAnimationFrame(animateCursor);
        }
        requestAnimationFrame(animateCursor);

        const interactiveEls = document.querySelectorAll(
            'a, button, .demo-device, .feature-card, .state-card, .team-card, .nav-vs-badge, #hero-visual'
        );
        interactiveEls.forEach(el => {
            el.addEventListener('mouseenter', () => {
                cursorDot.classList.add('hover');
                cursorGlow.classList.add('hover');
            });
            el.addEventListener('mouseleave', () => {
                cursorDot.classList.remove('hover');
                cursorGlow.classList.remove('hover');
            });
        });
    }

    // ─────────────────────────────────────
    // 10. MAGNETIC BUTTONS
    // ─────────────────────────────────────
    const magneticBtns = document.querySelectorAll('.btn-primary, .btn-ghost, .nav-cta-btn, .nav-vs-badge');
    magneticBtns.forEach(btn => {
        btn.classList.add('magnetic');
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const dx = (e.clientX - (rect.left + rect.width / 2)) * 0.35;
            const dy = (e.clientY - (rect.top + rect.height / 2)) * 0.35;
            btn.style.transform = `translate(${dx}px, ${dy}px)`;
        });
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0px, 0px)';
        });
    });

    // ─────────────────────────────────────
    // 11. 3D TILT FOR HERO VISUAL
    // ─────────────────────────────────────
    const heroVisual = document.getElementById('hero-visual');
    if (heroVisual) {
        heroVisual.addEventListener('mousemove', (e) => {
            const rect = heroVisual.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const cx = rect.width / 2;
            const cy = rect.height / 2;
            const rotX = ((y - cy) / cy) * -15;
            const rotY = ((x - cx) / cx) * 15;
            heroVisual.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg)`;
        });
        heroVisual.addEventListener('mouseleave', () => {
            heroVisual.style.transition = 'transform 0.5s ease';
            heroVisual.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
            setTimeout(() => { heroVisual.style.transition = ''; }, 500);
        });
    }

    // ─────────────────────────────────────
    // 12. TEAM COVERFLOW CAROUSEL
    // ─────────────────────────────────────
    const tcCards    = [...document.querySelectorAll('.tc-card')];
    const tcDots     = [...document.querySelectorAll('.tc-dot')];
    const tcPrev     = document.getElementById('tc-prev');
    const tcNext     = document.getElementById('tc-next');
    const tcCarousel = document.getElementById('team-carousel');

    if (tcCards.length) {
        const total       = tcCards.length;
        let current       = 0;
        let paused        = false;        // true while hovered or touched
        let rafId         = null;
        let lastStamp     = null;
        const INTERVAL_MS = 3200;         // advance every 3.2 s
        let elapsed       = 0;

        // ── position logic ──
        function getPos(cardIdx) {
            const diff = ((cardIdx - current) % total + total) % total;
            if (diff === 0)                    return 'active';
            if (diff === 1)                    return 'next';
            if (diff === total - 1)            return 'prev';
            if (diff <= Math.floor(total / 2)) return 'far-next';
            return 'far-prev';
        }

        function applyPositions() {
            tcCards.forEach((card, i) => {
                // Clear inline styles left from turntable mode
                card.style.transform = '';
                card.style.opacity = '';
                card.style.pointerEvents = '';
                card.setAttribute('data-pos', getPos(i));
                card.classList.remove('tc-active');
            });
            tcDots.forEach((dot, i)   => dot.classList.toggle('active', i === current));
        }

        function advance(dir) {
            current = ((current + dir) % total + total) % total;
            applyPositions();
            elapsed = 0; // reset timer after manual advance
        }

        // ── RAF-based smooth auto-rotation ──
        function tick(stamp) {
            if (lastStamp !== null && !paused) {
                elapsed += stamp - lastStamp;
                if (elapsed >= INTERVAL_MS) {
                    current = (current + 1) % total;
                    applyPositions();
                    elapsed = 0;
                }
            }
            lastStamp = stamp;
            rafId = requestAnimationFrame(tick);
        }

        // init
        applyPositions();
        rafId = requestAnimationFrame(tick);

        // ── Pause: hover ──
        if (tcCarousel) {
            tcCarousel.addEventListener('mouseenter', () => { paused = true;  elapsed = 0; });
            tcCarousel.addEventListener('mouseleave', () => { paused = false; lastStamp = null; });
        }

        // ── Pause: touch (finger on screen stops rotation) ──
        let touchX = null;
        if (tcCarousel) {
            tcCarousel.addEventListener('touchstart', e => {
                paused = true;
                elapsed = 0;
                touchX = e.touches[0].clientX;
            }, { passive: true });

            tcCarousel.addEventListener('touchend', e => {
                // swipe detection
                if (touchX !== null) {
                    const dx = e.changedTouches[0].clientX - touchX;
                    if (Math.abs(dx) > 40) advance(dx < 0 ? 1 : -1);
                }
                touchX = null;
                paused = false;
                lastStamp = null; // smooth resume — don't count paused time
            });

            tcCarousel.addEventListener('touchcancel', () => {
                touchX = null;
                paused = false;
                lastStamp = null;
            });
        }

        // ── Buttons ──
        tcPrev && tcPrev.addEventListener('click', () => advance(-1));
        tcNext && tcNext.addEventListener('click', () => advance(1));

        // ── Dots ──
        tcDots.forEach(dot => {
            dot.addEventListener('click', () => {
                current = +dot.dataset.i;
                applyPositions();
                elapsed = 0;
            });
        });

        // ── Click side card to bring to front ──
        tcCards.forEach(card => {
            card.addEventListener('click', () => {
                const pos = card.getAttribute('data-pos');
                if (pos === 'next')     advance(1);
                if (pos === 'prev')     advance(-1);
                if (pos === 'far-next') advance(2);
                if (pos === 'far-prev') advance(-2);
            });
        });

        // ── Keyboard ──
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') advance(1);
            if (e.key === 'ArrowLeft')  advance(-1);
        });
    }

});


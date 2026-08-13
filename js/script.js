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
                // Fade out background orb image slightly as it reaches anchor to seamlessly reveal pie chart
                const fadeFactor = curR < 260 ? Math.max(0.15, (curR - 150) / 110) : 1;
                orbImg.style.opacity             = (curOpacity * fadeFactor).toFixed(3);
            }

            if (window.checkOrbPieVisibility) {
                window.checkOrbPieVisibility(curOpacity);
            }

            requestAnimationFrame(orbRAF);
        }

        orbRAF();
    }

    // ─────────────────────────────────────
    // INTERACTIVE PIE CHART & LEGEND (Problem Section Orb Component)
    // ─────────────────────────────────────
    (function initOrbPieChart() {
        const pieContainer    = document.getElementById('orb-pie-container');
        const slicesGroup     = document.getElementById('pie-slices-group');
        const legendContainer = document.getElementById('pie-legend');
        const centerVal       = document.getElementById('pie-center-val');
        const centerLbl       = document.getElementById('pie-center-lbl');

        if (!pieContainer || !slicesGroup || !legendContainer) return;

        // Metrics values requested:
        // 40%: Government Hospitals
        // 35%: Home care Patients
        // 15%: Nursing Homes & Rehabilitation Centres
        // 10%: Private Hospitals
        const pieData = [
            { label: 'Government Hospitals', value: 40, color: '#1EADA0' },
            { label: 'Home care Patients', value: 35, color: '#7D07EB' },
            { label: 'Nursing & Rehab', value: 15, color: '#0284c7' },
            { label: 'Private Hospitals', value: 10, color: '#ffaa55' }
        ];

        let hoveredIndex = null;

        // SVG Arc Generator
        function createArcPath(cx, cy, rInner, rOuter, startAngle, endAngle) {
            const startRad = (startAngle - 90) * Math.PI / 180;
            const endRad   = (endAngle - 90) * Math.PI / 180;

            const x1Out = cx + rOuter * Math.cos(startRad);
            const y1Out = cy + rOuter * Math.sin(startRad);
            const x2Out = cx + rOuter * Math.cos(endRad);
            const y2Out = cy + rOuter * Math.sin(endRad);

            const x2In = cx + rInner * Math.cos(endRad);
            const y2In = cy + rInner * Math.sin(endRad);
            const x1In = cx + rInner * Math.cos(startRad);
            const y1In = cy + rInner * Math.sin(startRad);

            const largeArc = (endAngle - startAngle) > 180 ? 1 : 0;

            return `M ${x1Out.toFixed(2)} ${y1Out.toFixed(2)} ` +
                   `A ${rOuter} ${rOuter} 0 ${largeArc} 1 ${x2Out.toFixed(2)} ${y2Out.toFixed(2)} ` +
                   `L ${x2In.toFixed(2)} ${y2In.toFixed(2)} ` +
                   `A ${rInner} ${rInner} 0 ${largeArc} 0 ${x1In.toFixed(2)} ${y1In.toFixed(2)} Z`;
        }

        // Render Slices & Legend matching requested react component structure
        const cx = 100, cy = 100, innerRadius = 55, outerRadius = 85;
        let cumulativeAngle = 0;

        slicesGroup.innerHTML = '';
        legendContainer.innerHTML = '';

        pieData.forEach((item, i) => {
            const sliceAngle = (item.value / 100) * 360;
            const startAngle = cumulativeAngle + 1.5;
            const endAngle   = cumulativeAngle + sliceAngle - 1.5;
            cumulativeAngle += sliceAngle;

            const d = createArcPath(cx, cy, innerRadius, outerRadius, startAngle, endAngle);

            // PieSlice Component
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            path.setAttribute('d', d);
            path.setAttribute('fill', item.color);
            path.setAttribute('class', 'pie-slice-path');
            path.setAttribute('data-index', i);
            path.style.setProperty('--slice-color', item.color);
            slicesGroup.appendChild(path);

            // LegendItemComponent with LegendMarker and LegendLabel
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item-component';
            legendItem.setAttribute('data-index', i);
            legendItem.innerHTML = `
                <span class="legend-marker" style="background: ${item.color}; color: ${item.color};"></span>
                <span class="legend-label">
                    <span class="legend-name" title="${item.label}">${item.label}</span>
                    <span class="legend-val">${item.value}%</span>
                </span>
            `;
            legendContainer.appendChild(legendItem);
        });

        // Hover Sync (setHoveredIndex)
        function updateHoverState(idx) {
            if (hoveredIndex === idx) return;
            hoveredIndex = idx;

            const slicePaths = slicesGroup.querySelectorAll('.pie-slice-path');
            const legendItems = legendContainer.querySelectorAll('.legend-item-component');

            if (idx === null) {
                slicesGroup.classList.remove('has-hover');
                legendContainer.classList.remove('has-hover');
                slicePaths.forEach(el => el.classList.remove('is-hovered'));
                legendItems.forEach(el => el.classList.remove('is-hovered'));

                if (centerVal) { centerVal.textContent = '100%'; centerVal.style.fill = 'var(--text-1)'; }
                if (centerLbl) { centerLbl.textContent = 'Affected Patients'; }
            } else {
                slicesGroup.classList.add('has-hover');
                legendContainer.classList.add('has-hover');

                slicePaths.forEach((el, i) => el.classList.toggle('is-hovered', i === idx));
                legendItems.forEach((el, i) => el.classList.toggle('is-hovered', i === idx));

                const data = pieData[idx];
                if (centerVal) { centerVal.textContent = `${data.value}%`; centerVal.style.fill = data.color; }
                if (centerLbl) { centerLbl.textContent = data.label; }
            }
        }

        // Attach event handlers (onHoverChange)
        slicesGroup.querySelectorAll('.pie-slice-path').forEach((path, i) => {
            path.addEventListener('mouseenter', () => updateHoverState(i));
            path.addEventListener('mouseleave', () => updateHoverState(null));
        });

        legendContainer.querySelectorAll('.legend-item-component').forEach((item, i) => {
            item.addEventListener('mouseenter', () => updateHoverState(i));
            item.addEventListener('mouseleave', () => updateHoverState(null));
        });

        // Check visibility when scroll morph arrives at sphere anchor
        window.checkOrbPieVisibility = function(opacity) {
            if (opacity > 0.4) {
                pieContainer.classList.add('visible');
            } else {
                pieContainer.classList.remove('visible');
            }
        };
    })();

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
    // 12. TEAM DIRECTIONAL SLIDE (AnimatePresence-style)
    // ─────────────────────────────────────
    (function initTeamSlider() {
        const stage  = document.getElementById('ts-stage');
        const btnPrev = document.getElementById('tc-prev');
        const btnNext = document.getElementById('tc-next');
        const dots   = [...document.querySelectorAll('.tc-dot')];
        const carousel = document.getElementById('team-carousel');
        if (!stage) return;

        // ── Member data ──────────────────────────────────────────────────
        const members = [
            {
                num: '01', name: 'Abhishek Kumar Rai', role: 'Firmware & App Lead',
                img: 'assets/team_ak.png', imgAlt: 'Abhishek Kumar Rai',
                glow: 'glow-1', accent: '#1EADA0',
                desc: 'Device firmware, on-device model deployment, Flutter mobile app, and site development.',
                tags: ['Firmware','Flutter','Edge AI','Web']
            },
            {
                num: '02', name: 'Arpan Gupta', role: 'Systems Software',
                img: 'assets/team_ag.jpeg', imgAlt: 'Arpan Gupta',
                glow: 'glow-2', accent: '#7D07EB',
                desc: 'Raspberry Pi-based hospital-side data pipeline, backend systems, and dashboard infrastructure.',
                tags: ['Raspberry Pi','Pipeline','Backend']
            },
            {
                num: '03', name: 'Basudeo Krishnan', role: 'Hardware Lead',
                img: 'assets/team_bk.jpg', imgAlt: 'Basudeo Krishnan',
                glow: 'glow-3', accent: '#147C72',
                desc: 'Sensing plate design, wiring, and bed module integration — the physical foundation of VitalSense.',
                tags: ['Hardware','PCB','FSR']
            },
            {
                num: '04', name: 'Bhargavi Siva', role: 'ML Lead',
                img: 'assets/team_bs.jpg', imgAlt: 'Bhargavi Siva',
                glow: 'glow-4', accent: '#48C5B9',
                desc: 'Model development, data collection strategy, and training the on-device risk-prediction model.',
                tags: ['Machine Learning','TinyML','Data']
            }
        ];

        let current   = 0;
        let direction = 1;        // 1 = next (→), -1 = prev (←)
        let animating = false;
        let paused    = false;
        let elapsed   = 0;
        let lastStamp = null;
        const INTERVAL_MS = 3500;

        // ── Build a card DOM element ─────────────────────────────────────
        function buildCard(m) {
            const card = document.createElement('div');
            card.className = 'ts-card';
            card.style.setProperty('--ts-accent', m.accent);
            card.innerHTML = `
                <div class="ts-portrait">
                    <img src="${m.img}" alt="${m.imgAlt}" class="ts-img">
                    <div class="ts-portrait-glow ${m.glow}"></div>
                </div>
                <div class="ts-body">
                    <div class="ts-num">${m.num}</div>
                    <div class="ts-name">${m.name}</div>
                    <div class="ts-role">${m.role}</div>
                    <p class="ts-desc">${m.desc}</p>
                    <div class="team-tags">
                        ${m.tags.map(t => `<span class="team-tag">${t}</span>`).join('')}
                    </div>
                </div>`;
            return card;
        }

        // ── Update accent color on buttons (animate={{ backgroundColor }}) ─
        function setAccent(m) {
            const color = m.accent;
            document.documentElement.style.setProperty('--ts-accent', color);
            if (btnPrev) { btnPrev.style.backgroundColor = color; btnPrev.style.outlineColor = color; }
            if (btnNext) { btnNext.style.backgroundColor = color; btnNext.style.outlineColor = color; }
            dots.forEach((d, i) => {
                d.style.background = i === current ? color : '';
                d.style.width      = i === current ? '22px' : '';
                d.style.borderRadius = i === current ? '3px' : '';
                d.classList.toggle('active', i === current);
            });
        }

        // ── Initial render (no animation) ───────────────────────────────
        function renderInitial() {
            stage.innerHTML = '';
            const card = buildCard(members[current]);
            stage.appendChild(card);
            setAccent(members[current]);
        }

        // ── Slide transition ─────────────────────────────────────────────
        function slideTo(newIndex, dir) {
            if (animating) return;
            animating = true;

            const oldCard = stage.querySelector('.ts-card');
            const m = members[newIndex];
            const newCard = buildCard(m);

            // Add enter class before appending so it starts off-screen
            newCard.classList.add(dir === 1 ? 'ts-enter-next' : 'ts-enter-prev');
            stage.appendChild(newCard);

            // Exit old card
            if (oldCard) {
                oldCard.classList.add(dir === 1 ? 'ts-exit-next' : 'ts-exit-prev');
                oldCard.addEventListener('animationend', () => oldCard.remove(), { once: true });
            }

            // Update accent immediately so buttons animate their color
            current = newIndex;
            setAccent(m);

            // Clean up enter class after animation ends
            newCard.addEventListener('animationend', () => {
                newCard.classList.remove('ts-enter-next', 'ts-enter-prev');
                animating = false;
            }, { once: true });
        }

        function advance(dir) {
            const next = ((current + dir) % members.length + members.length) % members.length;
            direction = dir;
            slideTo(next, dir);
            elapsed = 0;
        }

        // ── Init ────────────────────────────────────────────────────────
        renderInitial();

        // ── Buttons ──
        btnPrev && btnPrev.addEventListener('click', () => advance(-1));
        btnNext && btnNext.addEventListener('click', () => advance(1));

        // whileTap scale — pure CSS :active handles it

        // ── Dots ──
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const i = +dot.dataset.i;
                if (i === current) return;
                advance(i > current ? 1 : -1);
                // jump directly rather than one step at a time
                current = ((current + (i > current ? 1 : -1)) % members.length + members.length) % members.length;
            });
        });

        // Simpler dot click: jump directly to target
        dots.forEach(dot => {
            dot.onclick = () => {
                const i = +dot.dataset.i;
                if (i === current || animating) return;
                const dir = i > current ? 1 : -1;
                slideTo(i, dir);
                elapsed = 0;
            };
        });

        // ── Auto-advance ──
        function tick(stamp) {
            if (lastStamp !== null && !paused) {
                elapsed += stamp - lastStamp;
                if (elapsed >= INTERVAL_MS) {
                    advance(1);
                    elapsed = 0;
                }
            }
            lastStamp = stamp;
            requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);

        // ── Pause on hover / touch ──
        if (carousel) {
            carousel.addEventListener('mouseenter', () => { paused = true; elapsed = 0; });
            carousel.addEventListener('mouseleave', () => { paused = false; lastStamp = null; });

            let touchX = null;
            carousel.addEventListener('touchstart', e => {
                paused = true; elapsed = 0;
                touchX = e.touches[0].clientX;
            }, { passive: true });
            carousel.addEventListener('touchend', e => {
                if (touchX !== null) {
                    const dx = e.changedTouches[0].clientX - touchX;
                    if (Math.abs(dx) > 40) advance(dx < 0 ? 1 : -1);
                }
                touchX = null; paused = false; lastStamp = null;
            });
        }

        // ── Keyboard ──
        document.addEventListener('keydown', e => {
            if (e.key === 'ArrowRight') advance(1);
            if (e.key === 'ArrowLeft')  advance(-1);
        });
    })();



    // ─────────────────────────────────────
    // 10. MODULE TAB SWITCHER (How It Works)
    // ─────────────────────────────────────
    (function initModuleSwitcher() {
        const tabs       = document.querySelectorAll('.module-tab');
        const indicator  = document.getElementById('module-tab-indicator');
        const panel      = document.getElementById('module-panel');

        // ── Data for each module ──────────────────────────────────────────
        const moduleData = {
            belt: {
                num:   'Module 01',
                title: 'Smart Belt',
                badge: 'System Brain',
                img:   'assets/module1.png',
                imgAlt:'Module 1 – Smart Belt',
                glowColor: 'rgba(30,173,160,0.4)',
                desc: 'Worn at the waist. Continuously tracks patient posture and acts as the system\'s brain — running all Edge AI inference locally with no cloud dependency.',
                specs: [
                    'Silicon Labs EFR32xG26 with built-in IMU & on-chip AI accelerator',
                    'Tracks posture: left / supine / right in real time',
                    'Communicates with the Bedsheet over BLE'
                ],
                chips: ['Edge AI', 'IMU Sensor', 'BLE']
            },
            sheet: {
                num:   'Module 02',
                title: 'Smart Bedsheet',
                badge: 'Pressure Sensing',
                img:   'assets/module2.png',
                imgAlt:'Module 2 – Smart Bedsheet',
                glowColor: 'rgba(91,110,247,0.35)',
                desc: 'Four detachable, repositionable sensing plates that measure pressure distribution across the bed. Stays idle until the Belt requests a reading — maximizing battery life.',
                specs: [
                    'Force Sensitive Resistors (FSR) built around an ESP32',
                    'Measures pressure, weight concentration & movement',
                    'Wake-on-demand power model for efficiency'
                ],
                chips: ['FSR Array', 'ESP32', 'Wake-on-Demand']
            }
        };

        let activeModule = 'belt';

        // ── Indicator positioning ─────────────────────────────────────────
        function positionIndicator(activeTab) {
            if (!indicator || !activeTab) return;
            const navRect = activeTab.closest('.module-tab-nav').getBoundingClientRect();
            const tabRect = activeTab.getBoundingClientRect();
            indicator.style.left  = (tabRect.left - navRect.left) + 'px';
            indicator.style.width = tabRect.width + 'px';
        }

        // Position on load (after paint)
        requestAnimationFrame(() => {
            const active = document.querySelector('.module-tab--active');
            positionIndicator(active);
        });

        // Reposition on resize
        window.addEventListener('resize', () => {
            const active = document.querySelector('.module-tab--active');
            positionIndicator(active);
        });

        // ── DOM update helper ─────────────────────────────────────────────
        function applyModuleData(key) {
            const d = moduleData[key];
            const img   = document.getElementById('mpanel-img');
            const glow  = document.getElementById('mpanel-img-glow');
            const badge = document.getElementById('mpanel-badge');
            const num   = document.getElementById('mpanel-num');
            const title = document.getElementById('mpanel-title');
            const desc  = document.getElementById('mpanel-desc');
            const specs = document.getElementById('mpanel-specs');
            const chips = document.getElementById('mpanel-chips');

            if (img)   { img.src = d.img; img.alt = d.imgAlt; }
            if (glow)  { glow.style.background = `radial-gradient(circle at 50% 80%, ${d.glowColor}, transparent 65%)`; }
            if (badge) { badge.textContent = d.badge; }
            if (num)   { num.textContent  = d.num; }
            if (title) { title.textContent = d.title; }
            if (desc)  { desc.textContent  = d.desc; }
            if (specs) {
                specs.innerHTML = d.specs.map(s => `<li>${s}</li>`).join('');
            }
            if (chips) {
                chips.innerHTML = d.chips.map(c => `<span class="mpanel-chip">${c}</span>`).join('');
            }
        }

        // ── Tab switch ────────────────────────────────────────────────────
        function switchTab(newKey, clickedTab) {
            if (newKey === activeModule) return;
            activeModule = newKey;

            // Update tab active state
            tabs.forEach(t => {
                const isActive = t.dataset.module === newKey;
                t.classList.toggle('module-tab--active', isActive);
                t.setAttribute('aria-selected', String(isActive));
            });

            // Slide indicator
            positionIndicator(clickedTab);

            // Content transition ─────────────────────────────────────────
            if (document.startViewTransition) {
                // Modern browsers: native View Transitions API
                // (same mechanism motion-dom's animateView wraps)
                document.startViewTransition(() => {
                    applyModuleData(newKey);
                });
            } else {
                // Fallback: CSS keyframe cross-fade
                panel.classList.add('panel-exit');
                panel.addEventListener('animationend', function onExit() {
                    panel.removeEventListener('animationend', onExit);
                    panel.classList.remove('panel-exit');
                    applyModuleData(newKey);
                    panel.classList.add('panel-enter');
                    panel.addEventListener('animationend', function onEnter() {
                        panel.removeEventListener('animationend', onEnter);
                        panel.classList.remove('panel-enter');
                    }, { once: true });
                }, { once: true });
            }
        }

        // ── Event listeners ───────────────────────────────────────────────
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                switchTab(tab.dataset.module, tab);
            });

            // Keyboard support (Enter / Space)
            tab.addEventListener('keydown', e => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    switchTab(tab.dataset.module, tab);
                }
            });

            tab.setAttribute('tabindex', '0');
        });
    })();

});


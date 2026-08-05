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
    const scrollIndicator = document.getElementById('scroll-indicator');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        navbar.classList.toggle('scrolled', scrollY > 80);
        if (scrollIndicator) {
            scrollIndicator.style.opacity = Math.max(0, 0.5 - scrollY / 400);
        }
    }, { passive: true });

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

});


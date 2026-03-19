// ===== Cursor Glow Effect =====
const cursorGlow = document.querySelector('.cursor-glow');
let mouseX = 0, mouseY = 0;
let glowX = 0, glowY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    glowX += (mouseX - glowX) * 0.1;
    glowY += (mouseY - glowY) * 0.1;

    if (cursorGlow) {
        cursorGlow.style.left = glowX + 'px';
        cursorGlow.style.top = glowY + 'px';
    }

    requestAnimationFrame(animateCursor);
}
animateCursor();

// ===== Particle Constellation Background =====
class ParticleConstellation {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.numParticles = 90;
        this.connectionDist = 160;
        this.mouseRadius = 200;
        this.resize();
        this.init();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    init() {
        // Pre-fill canvas so particles are visible immediately
        this.ctx.fillStyle = '#0a0a0b';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = 0; i < this.numParticles; i++) {
            this.particles.push(this.createParticle());
        }
        this.animate();
    }

    createParticle() {
        const w = this.canvas.width;
        const h = this.canvas.height;
        return {
            x: Math.random() * w,
            y: Math.random() * h,
            vx: (Math.random() - 0.5) * 0.35,
            vy: (Math.random() - 0.5) * 0.35,
            radius: Math.random() * 1.8 + 0.8,
            baseRadius: Math.random() * 1.8 + 0.8,
            opacity: Math.random() * 0.5 + 0.3,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.015 + Math.random() * 0.02,
            color: Math.random() > 0.15 ? '#d4a853' : (Math.random() > 0.5 ? '#6eb5ff' : '#b8923f'),
            trail: [],
            maxTrail: 5
        };
    }

    animate() {
        const { ctx, canvas } = this;
        const w = canvas.width;
        const h = canvas.height;

        // Subtle fade — trails accumulate for a dense constellation
        ctx.fillStyle = 'rgba(10, 10, 11, 0.15)';
        ctx.fillRect(0, 0, w, h);

        // Mouse position
        const mox = mouseX;
        const moy = mouseY - 40; // taskbar offset

        // Slow drift
        this.particles.forEach(p => {
            // Store trail
            p.trail.push({ x: p.x, y: p.y });
            if (p.trail.length > p.maxTrail) p.trail.shift();

            // Mouse attraction
            const mdx = mox - p.x;
            const mdy = moy - p.y;
            const md = Math.sqrt(mdx * mdx + mdy * mdy);
            if (md < this.mouseRadius) {
                const force = (1 - md / this.mouseRadius) * 0.04;
                p.vx += (mdx / md) * force;
                p.vy += (mdy / md) * force;
            }

            // Gentle random drift
            p.vx += (Math.random() - 0.5) * 0.03;
            p.vy += (Math.random() - 0.5) * 0.03;

            // Apply velocity
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.96;
            p.vy *= 0.96;

            // Soft bounce at edges
            const margin = 30;
            if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx) * 0.6; }
            if (p.x > w - margin) { p.x = w - margin; p.vx = -Math.abs(p.vx) * 0.6; }
            if (p.y < margin) { p.y = margin; p.vy = Math.abs(p.vy) * 0.6; }
            if (p.y > h - margin) { p.y = h - margin; p.vy = -Math.abs(p.vy) * 0.6; }

            // Pulse
            p.pulsePhase += p.pulseSpeed;
            p.radius = p.baseRadius + Math.sin(p.pulsePhase) * 0.4;

            // Draw trail
            if (p.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trail[0].x, p.trail[0].y);
                for (let i = 1; i < p.trail.length; i++) {
                    ctx.lineTo(p.trail[i].x, p.trail[i].y);
                }
                ctx.strokeStyle = p.color + '30';
                ctx.lineWidth = p.radius * 0.7;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.stroke();
            }

            // Draw glow
            const r = parseInt(p.color.slice(1, 3), 16);
            const g = parseInt(p.color.slice(3, 5), 16);
            const b = parseInt(p.color.slice(5, 7), 16);

            const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius * 8);
            glow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.45})`);
            glow.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${p.opacity * 0.12})`);
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * 8, 0, Math.PI * 2);
            ctx.fill();

            // Draw core dot
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Draw connections between close particles
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const a = this.particles[i];
                const b = this.particles[j];
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < this.connectionDist) {
                    const alpha = (1 - dist / this.connectionDist) * 0.35;

                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.strokeStyle = `rgba(212, 168, 83, ${alpha})`;
                    ctx.lineWidth = 0.6;
                    ctx.stroke();

                    // Bright spark at midpoint for very close pairs
                    if (dist < this.connectionDist * 0.35) {
                        const mx = (a.x + b.x) / 2;
                        const my = (a.y + b.y) / 2;
                        const sparkGlow = ctx.createRadialGradient(mx, my, 0, mx, my, 20);
                        sparkGlow.addColorStop(0, `rgba(212, 168, 83, ${alpha * 2.5})`);
                        sparkGlow.addColorStop(1, 'transparent');
                        ctx.fillStyle = sparkGlow;
                        ctx.beginPath();
                        ctx.arc(mx, my, 20, 0, Math.PI * 2);
                        ctx.fill();
                    }
                }
            }
        }

        // Draw ambient layer
        this.drawAmbientLayer();

        requestAnimationFrame(() => this.animate());
    }

    drawAmbientLayer() {
        const { ctx, canvas } = this;
        const t = Date.now() * 0.0003;

        const orbs = [
            { x: canvas.width * (0.2 + Math.sin(t * 0.7) * 0.15), y: canvas.height * (0.3 + Math.cos(t * 0.5) * 0.2), r: 300, color: 'rgba(212, 168, 83,' },
            { x: canvas.width * (0.75 + Math.cos(t * 0.4) * 0.12), y: canvas.height * (0.6 + Math.sin(t * 0.6) * 0.15), r: 250, color: 'rgba(110, 181, 255,' },
            { x: canvas.width * (0.5 + Math.sin(t * 0.3) * 0.2), y: canvas.height * (0.8 + Math.cos(t * 0.8) * 0.1), r: 200, color: 'rgba(184, 146, 63,' }
        ];

        orbs.forEach(orb => {
            const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
            gradient.addColorStop(0, orb.color + '0.025)');
            gradient.addColorStop(0.5, orb.color + '0.012)');
            gradient.addColorStop(1, 'transparent');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, orb.r, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

const desktopCanvas = document.getElementById('desktop-canvas');
if (desktopCanvas) {
    requestAnimationFrame(() => {
        const constellation = new ParticleConstellation(desktopCanvas);
    });
}

// ===== Window Manager =====
class WindowManager {
    constructor() {
        this.windows = {};
        this.zIndexCounter = 100;
        this.activeWindow = null;
        this.dragState = null;
        this.resizeState = null;
        this.defaultPositions = {
            about:         { x: 80,  y: 60,  w: 580, h: 520 },
            research:      { x: 160, y: 100, w: 560, h: 480 },
            publications:   { x: 240, y: 80,  w: 520, h: 460 },
            journey:       { x: 120, y: 120, w: 500, h: 440 },
            contact:       { x: 200, y: 140, w: 460, h: 400 }
        };

        this.init();
    }

    init() {
        // Initialize all windows
        ['about', 'research', 'publications', 'journey', 'contact'].forEach(id => {
            const win = document.getElementById(`window-${id}`);
            if (win) {
                this.windows[id] = {
                    el: win,
                    minimized: false,
                    maximized: false,
                    savedState: null
                };
            }
        });

        // Global mouse listeners
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));
        document.addEventListener('mouseup', () => this.onMouseUp());
        document.addEventListener('mousedown', (e) => this.onMouseDown(e));

        // Start clock
        this.updateClock();
        setInterval(() => this.updateClock(), 1000);

        // Show hint on first load
        setTimeout(() => {
            const hint = document.getElementById('click-hint');
            if (hint) hint.classList.add('show');
        }, 800);

        // Hide hint on first interaction
        document.querySelectorAll('.desktop-icon').forEach(icon => {
            icon.addEventListener('click', () => {
                const hint = document.getElementById('click-hint');
                if (hint) hint.classList.remove('show');
                icon.classList.add('clicked');
            }, { once: true });
        });

        // Show hint again if all windows are closed
        setInterval(() => {
            const anyOpen = Object.values(this.windows).some(w => w.el.classList.contains('visible') && !w.minimized);
            const hint = document.getElementById('click-hint');
            if (hint) {
                if (!anyOpen) {
                    hint.classList.add('show');
                } else {
                    hint.classList.remove('show');
                }
            }
        }, 500);
    }

    updateClock() {
        const clock = document.getElementById('taskbar-clock');
        if (clock) {
            const now = new Date();
            const h = now.getHours().toString().padStart(2, '0');
            const m = now.getMinutes().toString().padStart(2, '0');
            clock.textContent = `${h}:${m}`;
        }
    }

    openWindow(id) {
        const winData = this.windows[id];
        if (!winData) return;

        const win = winData.el;
        const pos = this.defaultPositions[id];

        if (winData.minimized) {
            winData.minimized = false;
            win.classList.remove('minimized');
        }

        if (!win.style.width || winData.maximized) {
            win.style.left = pos.x + 'px';
            win.style.top = pos.y + 'px';
            win.style.width = pos.w + 'px';
            win.style.height = pos.h + 'px';
        }

        win.classList.add('visible');
        this.bringToFront(id);
        this.updateTaskbar();

        const body = win.querySelector('.window-body');
        if (body) body.focus();
    }

    closeWindow(id) {
        const winData = this.windows[id];
        if (!winData) return;

        winData.el.classList.remove('visible');
        setTimeout(() => {
            winData.el.classList.remove('maximized');
            winData.maximized = false;
        }, 200);
        this.updateTaskbar();
    }

    minimizeWindow(id) {
        const winData = this.windows[id];
        if (!winData) return;

        winData.minimized = true;
        winData.el.classList.add('minimized');
        this.updateTaskbar();
    }

    maximizeWindow(id) {
        const winData = this.windows[id];
        if (!winData) return;

        const win = winData.el;

        if (winData.maximized) {
            win.classList.remove('maximized');
            winData.maximized = false;
            if (winData.savedState) {
                win.style.left = winData.savedState.left;
                win.style.top = winData.savedState.top;
                win.style.width = winData.savedState.width;
                win.style.height = winData.savedState.height;
            }
        } else {
            winData.savedState = {
                left: win.style.left,
                top: win.style.top,
                width: win.style.width,
                height: win.style.height
            };
            win.classList.add('maximized');
            winData.maximized = true;
        }
    }

    bringToFront(id) {
        this.zIndexCounter++;
        const winData = this.windows[id];
        if (winData) {
            winData.el.style.zIndex = this.zIndexCounter;
            this.activeWindow = id;
        }
        this.updateTaskbar();
    }

    updateTaskbar() {
        const container = document.getElementById('taskbar-windows');
        if (!container) return;

        container.innerHTML = '';

        const windowMeta = {
            about:        { label: 'About', svg: '<svg width="12" height="12" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="10" r="5" stroke="#d4a853" stroke-width="2"/><path d="M5 24c0-4.97 4.03-9 9-9s9 4.03 9 9" stroke="#d4a853" stroke-width="2" stroke-linecap="round"/></svg>' },
            research:     { label: 'Research', svg: '<svg width="12" height="12" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="10" stroke="#d4a853" stroke-width="2"/><circle cx="14" cy="14" r="5" stroke="#d4a853" stroke-width="2"/><circle cx="14" cy="14" r="2" fill="#d4a853"/></svg>' },
            publications:  { label: 'Publications', svg: '<svg width="12" height="12" viewBox="0 0 28 28" fill="none"><rect x="5" y="3" width="18" height="22" rx="2" stroke="#d4a853" stroke-width="2"/><line x1="9" y1="9" x2="19" y2="9" stroke="#d4a853" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="13" x2="19" y2="13" stroke="#d4a853" stroke-width="1.5" stroke-linecap="round"/><line x1="9" y1="17" x2="15" y2="17" stroke="#d4a853" stroke-width="1.5" stroke-linecap="round"/></svg>' },
            journey:      { label: 'Journey', svg: '<svg width="12" height="12" viewBox="0 0 28 28" fill="none"><circle cx="6" cy="7" r="2.5" stroke="#d4a853" stroke-width="2"/><circle cx="14" cy="14" r="2.5" stroke="#d4a853" stroke-width="2"/><circle cx="22" cy="21" r="2.5" stroke="#d4a853" stroke-width="2"/><path d="M8 7h4.5M16.5 14H22" stroke="#d4a853" stroke-width="1.5" stroke-linecap="round" stroke-dasharray="2 2"/></svg>' },
            contact:      { label: 'Contact', svg: '<svg width="12" height="12" viewBox="0 0 28 28" fill="none"><rect x="3" y="7" width="22" height="14" rx="2" stroke="#d4a853" stroke-width="2"/><path d="M3 9l11 8 11-8" stroke="#d4a853" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>' }
        };

        Object.keys(this.windows).forEach(id => {
            const winData = this.windows[id];
            if (winData.el.classList.contains('visible') && !winData.minimized) {
                const btn = document.createElement('button');
                btn.className = 'taskbar-window-btn' + (this.activeWindow === id ? ' active' : '');
                btn.innerHTML = `<span class="btn-icon">${windowMeta[id].svg}</span>${windowMeta[id].label}`;
                btn.onclick = () => this.bringToFront(id);
                container.appendChild(btn);
            }
        });
    }

    startDrag(e, id) {
        if (e.target.closest('.window-controls')) return;
        if (this.windows[id]?.maximized) return;

        const winData = this.windows[id];
        if (!winData) return;

        this.bringToFront(id);
        this.dragState = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            startLeft: parseInt(winData.el.style.left) || 0,
            startTop: parseInt(winData.el.style.top) || 0
        };
        winData.el.classList.add('dragging');
    }

    startResize(e, id) {
        const winData = this.windows[id];
        if (!winData || winData.maximized) return;

        e.stopPropagation();
        this.bringToFront(id);

        this.resizeState = {
            id,
            startX: e.clientX,
            startY: e.clientY,
            startW: winData.el.offsetWidth,
            startH: winData.el.offsetHeight
        };
        winData.el.classList.add('resizing');
    }

    onMouseDown(e) {
        const winEl = e.target.closest('.window');
        if (winEl) {
            const id = winEl.dataset.windowId;
            if (id && !this.windows[id]?.minimized) {
                this.bringToFront(id);
            }
        }
    }

    onMouseMove(e) {
        if (this.dragState) {
            const { id, startX, startY, startLeft, startTop } = this.dragState;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const winData = this.windows[id];
            if (winData) {
                winData.el.style.left = (startLeft + dx) + 'px';
                winData.el.style.top = (startTop + dy) + 'px';
            }
        }

        if (this.resizeState) {
            const { id, startX, startY, startW, startH } = this.resizeState;
            const dx = e.clientX - startX;
            const dy = e.clientY - startY;
            const winData = this.windows[id];
            if (winData) {
                const newW = Math.max(400, startW + dx);
                const newH = Math.max(300, startH + dy);
                winData.el.style.width = newW + 'px';
                winData.el.style.height = newH + 'px';
            }
        }
    }

    onMouseUp() {
        if (this.dragState) {
            this.windows[this.dragState.id].el.classList.remove('dragging');
            this.dragState = null;
        }
        if (this.resizeState) {
            this.windows[this.resizeState.id].el.classList.remove('resizing');
            this.resizeState = null;
        }
    }
}

const windowManager = new WindowManager();

// ===== Physics-Based Floating Cards =====
class PhysicsCards {
    constructor() {
        this.container = document.getElementById('floating-cards');
        this.cards = [];

        const cardSvgPaths = {
            ior: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><circle cx="14" cy="14" r="8" stroke="#d4a853" stroke-width="1.3"/><circle cx="14" cy="14" r="3" stroke="#d4a853" stroke-width="1.3"/><path d="M14 6v-3M14 25v-3M6 14H3M25 14h-3" stroke="#d4a853" stroke-width="1.3" stroke-linecap="round"/></svg>`,
            lgn: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><ellipse cx="14" cy="14" rx="10" ry="6" stroke="#d4a853" stroke-width="1.3" transform="rotate(-30 14 14)"/><ellipse cx="14" cy="14" rx="10" ry="6" stroke="#d4a853" stroke-width="1.3" transform="rotate(30 14 14)"/><circle cx="14" cy="14" r="2.5" fill="#d4a853"/></svg>`,
            bio: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M14 4c-5 6-8 10-8 14a8 8 0 0016 0c0-4-3-8-8-14z" stroke="#d4a853" stroke-width="1.3"/><path d="M14 12v8M10 16h8" stroke="#d4a853" stroke-width="1.3" stroke-linecap="round"/></svg>`,
            eye: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M3 14s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" stroke="#d4a853" stroke-width="1.3"/><circle cx="14" cy="14" r="4" stroke="#d4a853" stroke-width="1.3"/><circle cx="14" cy="14" r="1.5" fill="#d4a853"/></svg>`,
            vss: `<svg width="28" height="28" viewBox="0 0 28 28" fill="none"><rect x="5" y="5" width="18" height="18" rx="2" stroke="#d4a853" stroke-width="1.3"/><path d="M5 10l9 6 9-6" stroke="#d4a853" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/><line x1="14" y1="10" x2="14" y2="23" stroke="#d4a853" stroke-width="1.3"/></svg>`
        };

        const cardDefs = [
            { id: 'ior', title: 'IOR Study', svg: cardSvgPaths.ior, window: 'research' },
            { id: 'lgn', title: 'LGN Study', svg: cardSvgPaths.lgn, window: 'research' },
            { id: 'bio', title: 'Bio Model', svg: cardSvgPaths.bio, window: 'research' },
            { id: 'eye', title: 'Eye Track', svg: cardSvgPaths.eye, window: 'journey' },
            { id: 'vss', title: 'VSS 2024', svg: cardSvgPaths.vss, window: 'publications' }
        ];

        if (!this.container) return;

        const w = window.innerWidth;
        const h = window.innerHeight;

        cardDefs.forEach((def, i) => {
            const card = document.createElement('div');
            card.className = 'physics-card';
            card.innerHTML = `
                <span class="card-icon">${def.svg}</span>
                <span class="card-title">${def.title}</span>
            `;

            const x = 280 + i * 140 + Math.random() * 40;
            const y = 120 + Math.random() * (h - 500);

            card.style.left = x + 'px';
            card.style.top = y + 'px';
            card.style.transform = `rotate(${Math.random() * 10 - 5}deg)`;

            this.container.appendChild(card);

            const cardData = {
                el: card,
                x, y,
                vx: (Math.random() - 0.5) * 0.4,
                vy: (Math.random() - 0.5) * 0.4,
                rotation: Math.random() * 10 - 5,
                rotVel: (Math.random() - 0.5) * 0.05,
                settled: false,
                settleTimer: 0,
                w: 120,
                h: 160,
                windowId: def.window
            };

            this.cards.push(cardData);

            card.addEventListener('click', () => {
                windowManager.openWindow(def.window);
            });
            card.addEventListener('mouseenter', () => {
                cardData.settled = true;
                cardData.settleTimer = 0;
                cardData.vx *= 0.3;
                cardData.vy *= 0.3;
                card.classList.add('settled');
            });
            card.addEventListener('mouseleave', () => {
                cardData.settled = false;
                card.classList.remove('settled');
            });
        });

        this.animate();
    }

    animate() {
        const h = window.innerHeight;
        const w = window.innerWidth;
        const margin = 50;
        const taskbarH = 40;

        this.cards.forEach(card => {
            if (card.settled) {
                card.settleTimer++;
                if (card.settleTimer > 60) {
                    card.settled = false;
                    card.settleTimer = 0;
                }
                return;
            }

            card.x += card.vx;
            card.y += card.vy;
            card.rotation += card.rotVel;

            card.vx *= 0.998;
            card.vy *= 0.998;
            card.rotVel *= 0.99;

            const leftBound = 200;
            const rightBound = w - margin - card.w;
            const topBound = margin;
            const bottomBound = h - taskbarH - margin - card.h;

            if (card.x < leftBound) {
                card.x = leftBound;
                card.vx = Math.abs(card.vx) * 0.7;
                card.rotVel += (Math.random() - 0.5) * 0.1;
            }
            if (card.x > rightBound) {
                card.x = rightBound;
                card.vx = -Math.abs(card.vx) * 0.7;
                card.rotVel += (Math.random() - 0.5) * 0.1;
            }
            if (card.y < topBound) {
                card.y = topBound;
                card.vy = Math.abs(card.vy) * 0.7;
            }
            if (card.y > bottomBound) {
                card.y = bottomBound;
                card.vy = -Math.abs(card.vy) * 0.7;
            }

            card.el.style.left = card.x + 'px';
            card.el.style.top = card.y + 'px';
            card.el.style.transform = `rotate(${card.rotation}deg)`;
        });

        requestAnimationFrame(() => this.animate());
    }
}

const physicsCards = new PhysicsCards();

// ===== Init =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

console.log('Daniel Lougen — Visual Cognition Desktop Loaded');

// ===== Reduced Motion =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (prefersReducedMotion.matches) {
    if (cursorGlow) cursorGlow.style.display = 'none';
}

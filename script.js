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

// ===== Organic Fractal Trees =====
class FractalTree {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.trees = [];
        this.maxTrees = 10;
        this.resize();

        window.addEventListener('resize', () => this.resize());

        // Spawn initial trees from different edges
        for (let i = 0; i < 4; i++) {
            setTimeout(() => this.spawnTree(), i * 400);
        }
    }

    resize() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    }

    spawnTree() {
        if (this.trees.length >= this.maxTrees) return;

        const edge = Math.random();
        let x, y, angle;
        const centerX = this.canvas.width / 2;

        if (edge < 0.3) {
            // Bottom - grow up, angle away from center
            x = Math.random() * this.canvas.width;
            y = this.canvas.height + 5;
            // Angle outward: left side angles left, right side angles right
            const offsetFromCenter = (x - centerX) / centerX; // -1 to 1
            angle = -Math.PI / 2 + offsetFromCenter * 0.5 + (Math.random() - 0.5) * 0.2;
        } else if (edge < 0.5) {
            // Left - grow right
            x = -5;
            y = this.canvas.height * (0.15 + Math.random() * 0.7);
            angle = (Math.random() - 0.5) * 0.4;
        } else if (edge < 0.7) {
            // Right - grow left
            x = this.canvas.width + 5;
            y = this.canvas.height * (0.15 + Math.random() * 0.7);
            angle = Math.PI + (Math.random() - 0.5) * 0.4;
        } else if (edge < 0.85) {
            // Top - grow down, angle away from center
            x = Math.random() * this.canvas.width;
            y = -5;
            const offsetFromCenter = (x - centerX) / centerX;
            angle = Math.PI / 2 + offsetFromCenter * 0.5 + (Math.random() - 0.5) * 0.2;
        } else {
            // Corners
            const corner = Math.floor(Math.random() * 4);
            if (corner === 0) { x = -5; y = -5; angle = Math.PI / 4; }
            else if (corner === 1) { x = this.canvas.width + 5; y = -5; angle = 3 * Math.PI / 4; }
            else if (corner === 2) { x = -5; y = this.canvas.height + 5; angle = -Math.PI / 4; }
            else { x = this.canvas.width + 5; y = this.canvas.height + 5; angle = -3 * Math.PI / 4; }
            angle += (Math.random() - 0.5) * 0.2;
        }

        this.trees.push({
            x: x,
            y: y,
            angle: angle,
            curve: (Math.random() - 0.5) * 0.008,
            length: 0,
            targetLength: 100 + Math.random() * 80,
            thickness: 3.5 + Math.random() * 2,
            depth: 0,
            children: [],
            opacity: 0,
            growing: true,
            life: 1,
            fadeSpeed: 0.0003 + Math.random() * 0.00015
        });
    }

    growBranch(branch) {
        if (branch.growing) {
            // Grow with slight curve
            branch.length += branch.depth === 0 ? 1.4 : 1.1;
            branch.angle += branch.curve || 0;
            branch.opacity = Math.min(branch.opacity + 0.018, 0.75);

            if (branch.length >= branch.targetLength) {
                branch.growing = false;

                // Branch out like a tree - spiky style
                if (branch.depth < 6 && Math.random() > 0.08) {
                    // More children for spikier look
                    const numChildren = branch.depth < 2 ? 3 : (Math.random() > 0.3 ? 3 : 2);

                    for (let i = 0; i < numChildren; i++) {
                        // Sharper, spikier angles
                        const spreadBase = 0.4 + branch.depth * 0.08;
                        const spread = spreadBase + Math.random() * 0.35;
                        const direction = i === 0 ? -1 : (i === 1 ? 0 : 1);

                        const endX = branch.x + Math.cos(branch.angle) * branch.length;
                        const endY = branch.y + Math.sin(branch.angle) * branch.length;

                        branch.children.push({
                            x: endX,
                            y: endY,
                            angle: branch.angle + direction * spread,
                            curve: (Math.random() - 0.5) * 0.015,
                            length: 0,
                            targetLength: branch.targetLength * (0.65 + Math.random() * 0.15),
                            thickness: Math.max(0.4, branch.thickness * 0.8), // More gradual taper
                            depth: branch.depth + 1,
                            children: [],
                            opacity: 0,
                            growing: true
                        });
                    }
                }
            }
        }

        // Always grow children (this was the bug - it was inside the if block)
        branch.children.forEach(child => this.growBranch(child));
    }

    drawBranch(branch, globalOpacity) {
        if (branch.length <= 0) return;

        const endX = branch.x + Math.cos(branch.angle) * branch.length;
        const endY = branch.y + Math.sin(branch.angle) * branch.length;
        const alpha = branch.opacity * globalOpacity;

        // Glow for main branches
        if (branch.thickness > 1.2) {
            this.ctx.beginPath();
            this.ctx.moveTo(branch.x, branch.y);
            this.ctx.lineTo(endX, endY);
            this.ctx.strokeStyle = `rgba(212, 168, 83, ${alpha * 0.25})`;
            this.ctx.lineWidth = branch.thickness + 5;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();
        }

        // Main branch
        this.ctx.beginPath();
        this.ctx.moveTo(branch.x, branch.y);
        this.ctx.lineTo(endX, endY);
        this.ctx.strokeStyle = `rgba(212, 168, 83, ${alpha})`;
        this.ctx.lineWidth = branch.thickness;
        this.ctx.lineCap = 'round';
        this.ctx.stroke();

        branch.children.forEach(child => this.drawBranch(child, globalOpacity));
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        if (Math.random() < 0.02) {
            this.spawnTree();
        }

        this.trees = this.trees.filter(tree => {
            this.growBranch(tree);
            const stillGrowing = this.isAnyGrowing(tree);
            if (!stillGrowing) tree.life -= tree.fadeSpeed;
            this.drawBranch(tree, tree.life);
            return tree.life > 0;
        });

        requestAnimationFrame(() => this.animate());
    }

    isAnyGrowing(branch) {
        if (branch.growing) return true;
        return branch.children.some(child => this.isAnyGrowing(child));
    }
}

const perceptionCanvas = document.getElementById('perception-field');
if (perceptionCanvas) {
    const tree = new FractalTree(perceptionCanvas);
    tree.animate();
}

// ===== Eye Pupil Tracking =====
const eyePupil = document.querySelector('.eye-pupil');
const heroVisual = document.querySelector('.hero-visual');

if (eyePupil && heroVisual) {
    document.addEventListener('mousemove', (e) => {
        const rect = heroVisual.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), 150);
        const maxMove = 18;

        const moveX = (distance / 150) * maxMove * Math.cos(angle);
        const moveY = (distance / 150) * maxMove * Math.sin(angle);

        eyePupil.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px))`;
    });
}

// ===== Navigation =====
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

// Scroll state
let lastScroll = 0;
window.addEventListener('scroll', () => {
    const currentScroll = window.scrollY;

    if (currentScroll > 100) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }

    lastScroll = currentScroll;
});

// Mobile toggle
if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
        navToggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}

// ===== Smooth Scroll =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.scrollY - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Active Nav Highlighting =====
const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

function updateActiveNav() {
    const scrollY = window.scrollY;

    sections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollY >= sectionTop && scrollY < sectionTop + sectionHeight) {
            navItems.forEach(item => {
                item.classList.remove('active');
                if (item.getAttribute('href') === `#${sectionId}`) {
                    item.classList.add('active');
                }
            });
        }
    });
}

window.addEventListener('scroll', updateActiveNav);
updateActiveNav();

// ===== Scroll Reveal Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.section-label, .section-title, .about-text, .skill-item, .research-item, .timeline-item, .pub-item, .contact-text, .contact-links').forEach(el => {
    el.classList.add('reveal');
    observer.observe(el);
});

// ===== Staggered Card Animations =====
const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.skill-item, .research-item');
            cards.forEach((card, i) => {
                setTimeout(() => {
                    card.classList.add('revealed');
                }, i * 100);
            });
            staggerObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15 });

document.querySelectorAll('.skills-grid, .research-list').forEach(grid => {
    staggerObserver.observe(grid);
});

// ===== Timeline Animation =====
const timelineItems = document.querySelectorAll('.timeline-item');
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            timelineObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.3 });

timelineItems.forEach((item, i) => {
    item.style.transitionDelay = `${i * 0.15}s`;
    timelineObserver.observe(item);
});

// ===== School Logo Hover =====
const schoolNames = {
    toronto: 'University of Toronto',
    oregon: 'University of Oregon',
    landmark: 'Landmark College'
};

const timelineItemsForLogo = document.querySelectorAll('.timeline-item[data-school]');
const schoolLogos = document.querySelectorAll('.school-logo img');
const schoolNameEl = document.querySelector('.school-name');

if (timelineItemsForLogo.length && schoolLogos.length) {
    timelineItemsForLogo.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const school = item.dataset.school;

            // Update active logo
            schoolLogos.forEach(logo => {
                logo.classList.remove('active');
                if (logo.classList.contains(`logo-${school}`)) {
                    logo.classList.add('active');
                }
            });

            // Update school name
            if (schoolNameEl) {
                schoolNameEl.textContent = schoolNames[school];
            }
        });
    });
}

// ===== Hide Scroll Indicator =====
const scrollIndicator = document.querySelector('.hero-scroll');
if (scrollIndicator) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    });
}

// ===== Reduced Motion =====
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

if (prefersReducedMotion.matches) {
    document.querySelectorAll('.reveal').forEach(el => {
        el.classList.add('revealed');
    });

    if (cursorGlow) {
        cursorGlow.style.display = 'none';
    }
}

// ===== Page Load =====
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

console.log('Visual Cognition - Perception Interface Loaded');

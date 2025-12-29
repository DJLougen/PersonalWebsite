// ===== DOM Elements =====
const navbar = document.querySelector('.navbar');
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');

// ===== Mobile Navigation Toggle =====
navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('active');
    navToggle.classList.toggle('active');
});

// Close mobile nav when clicking a link
navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navLinks.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// ===== Smooth Scroll for Navigation =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 80;
            const elementPosition = target.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// ===== Intersection Observer for Animations =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const velocity = Math.abs(scrollVelocity);
            const scrollDirection = scrollVelocity > 0 ? 'down' : 'up';

            // Apply different animations based on velocity and direction
            if (velocity > 5) {
                entry.target.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            } else {
                entry.target.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            }

            if (scrollDirection === 'down') {
                entry.target.style.transform = 'translateY(0)';
            } else {
                entry.target.style.transform = 'translateY(0) scale(1.02)';
            }

            entry.target.classList.add('visible');
        }
    });
}, observerOptions);

// Observe elements for animation
document.querySelectorAll('.skill-card, .research-card, .timeline-item, .publication-item, .contact-card').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

// Add visible class styles
const style = document.createElement('style');
style.textContent = `
    .skill-card.visible,
    .research-card.visible,
    .timeline-item.visible,
    .publication-item.visible,
    .contact-card.visible {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
`;
document.head.appendChild(style);

// ===== Staggered Animation for Cards =====
const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.skill-card, .research-card, .contact-card');
            cards.forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('visible');
                }, index * 100);
            });
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.skills-grid, .research-grid, .contact-links').forEach(grid => {
    staggerObserver.observe(grid);
});

// ===== Mouse Tracking for Research Cards =====
document.querySelectorAll('.research-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        card.style.setProperty('--mouse-x', `${x}%`);
        card.style.setProperty('--mouse-y', `${y}%`);
    });
});

// ===== Combined Scroll Handler =====
let lastScroll = 0;
let lastScrollY = 0;
let scrollVelocity = 0;
let ticking = false;

const sections = document.querySelectorAll('section[id]');
const navItems = document.querySelectorAll('.nav-links a');

function handleScroll() {
    const currentScroll = window.pageYOffset;

    // Calculate scroll velocity
    scrollVelocity = currentScroll - lastScrollY;
    lastScrollY = currentScroll;

    // Navbar background on scroll
    if (currentScroll > 50) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
        navbar.style.boxShadow = '0 4px 30px rgba(0, 0, 0, 0.3)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.8)';
        navbar.style.boxShadow = 'none';
    }

    // Active nav link highlighting
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (currentScroll >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('href') === `#${current}`) {
            item.classList.add('active');
        }
    });

    // Neural network scroll response
    const neuronRings = document.querySelectorAll('.neuron-ring');
    const synapses = document.querySelectorAll('.synapse');
    neuronRings.forEach((ring, index) => {
        ring.style.animationDuration = `${30 - (index * 5)}s`;
    });
    if (Math.abs(scrollVelocity) > 2) {
        synapses.forEach(synapse => {
            synapse.style.opacity = '1';
        });
    }

    // Neural network scaling effect
    const hero = document.querySelector('.hero');
    if (hero) {
        const heroRect = hero.getBoundingClientRect();
        const heroVisible = heroRect.bottom > 0;

        if (heroVisible) {
            const scrollProgress = 1 - (heroRect.bottom / window.innerHeight);
            const neuronCore = document.querySelector('.neuron-core');
            const rings = document.querySelectorAll('.neuron-ring');

            if (neuronCore && scrollProgress >= 0) {
                const scale = 1 + (scrollProgress * 0.3);
                neuronCore.style.transform = `translate(-50%, -50%) scale(${scale})`;
                rings.forEach((ring) => {
                    const opacity = 1 - (scrollProgress * 0.5);
                    ring.style.opacity = Math.max(0.2, opacity);
                });
            }
        }
    }

    lastScroll = currentScroll;
    ticking = false;
}

window.addEventListener('scroll', () => {
    if (!ticking) {
        window.requestAnimationFrame(handleScroll);
        ticking = true;
    }
});

// Add active link style
const navStyle = document.createElement('style');
navStyle.textContent = `
    .nav-links a.active {
        color: var(--color-text);
    }
    .nav-links a.active::after {
        width: 100%;
    }
`;
document.head.appendChild(navStyle);

// ===== Parallax Effect for Gradient Orbs =====
let mouseX = 0;
let mouseY = 0;
let orbX = 0;
let orbY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 40;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 40;
});

function animateOrbs() {
    // Smooth lerping for organic movement
    orbX += (mouseX - orbX) * 0.05;
    orbY += (mouseY - orbY) * 0.05;

    const orbs = document.querySelectorAll('.gradient-orb');
    orbs.forEach((orb, index) => {
        const factor = index === 0 ? 1 : -1;
        orb.style.transform = `translate(${orbX * factor}px, ${orbY * factor}px)`;
    });

    requestAnimationFrame(animateOrbs);
}
animateOrbs();

// ===== Neural Visualization Enhancement =====
const neuronCore = document.querySelector('.neuron-core');
if (neuronCore) {
    document.addEventListener('mousemove', (e) => {
        const hero = document.querySelector('.hero');
        if (hero) {
            const rect = hero.getBoundingClientRect();
            if (e.clientY < rect.bottom) {
                const x = (e.clientX / window.innerWidth - 0.5) * 10;
                const y = (e.clientY / window.innerHeight - 0.5) * 10;
                neuronCore.style.transform = `translate(calc(-50% + ${x}px), calc(-50% + ${y}px))`;
            }
        }
    });
}

// ===== Particle System =====
const canvas = document.getElementById('particle-canvas');
if (canvas) {
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 50;
    const connectionDistance = 100;

    // Set canvas size
    function resizeCanvas() {
        canvas.width = 500;
        canvas.height = 500;
    }
    resizeCanvas();

    // Particle class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.5;
            this.vy = (Math.random() - 0.5) * 0.5;
            this.radius = Math.random() * 2 + 1;
            this.opacity = Math.random() * 0.5 + 0.2;
            this.hue = Math.random() * 60 + 240; // Purple to blue range
        }

        update() {
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off edges
            if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
            if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

            // Keep within bounds
            this.x = Math.max(0, Math.min(canvas.width, this.x));
            this.y = Math.max(0, Math.min(canvas.height, this.y));
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = `hsla(${this.hue}, 70%, 60%, ${this.opacity})`;
            ctx.fill();

            // Add glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = `hsla(${this.hue}, 70%, 60%, 0.5)`;
            ctx.fill();
            ctx.shadowBlur = 0;
        }
    }

    // Initialize particles
    function initParticles() {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    }

    // Draw connections between close particles
    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < connectionDistance) {
                    const opacity = (1 - distance / connectionDistance) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(99, 102, 241, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop
    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        drawConnections();

        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        requestAnimationFrame(animateParticles);
    }

    initParticles();
    animateParticles();
}

// ===== Page Load Animation =====
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';

    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
});

// ===== Skill Progress Rings Animation =====
function animateSkillProgress() {
    const skillCards = document.querySelectorAll('.skill-card[data-progress]');
    const radius = 20;
    const circumference = 2 * Math.PI * radius;

    skillCards.forEach(card => {
        const progress = parseInt(card.getAttribute('data-progress'));
        const offset = circumference - (progress / 100) * circumference;
        card.style.setProperty('--progress-offset', offset);
    });
}

// Initialize skill progress on load
animateSkillProgress();

// ===== Research Card Expansion =====
document.querySelectorAll('.research-expand-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const card = btn.closest('.research-card');
        card.classList.toggle('expanded');
        btn.textContent = card.classList.contains('expanded') ? 'Show less' : 'Read more';
    });
});

// ===== Animated Timeline Progress =====
const timelineObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const timeline = entry.target;
            timeline.classList.add('animated');

            // Animate markers sequentially
            const items = timeline.querySelectorAll('.timeline-item');
            items.forEach((item, index) => {
                setTimeout(() => {
                    item.classList.add('reached');
                }, index * 200);
            });
        }
    });
}, { threshold: 0.2 });

const timeline = document.querySelector('.timeline');
if (timeline) {
    timelineObserver.observe(timeline);
}

// ===== 3D Publication Card Transforms =====
document.querySelectorAll('.publication-item').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Calculate rotation angles (limited to ±5 degrees for subtle effect)
        const rotateX = ((y - centerY) / centerY) * -5;
        const rotateY = ((x - centerX) / centerX) * 5;

        card.style.setProperty('--mouse-x-rotation', `${rotateY}deg`);
        card.style.setProperty('--mouse-y-rotation', `${rotateX}deg`);
    });

    card.addEventListener('mouseleave', () => {
        card.style.setProperty('--mouse-x-rotation', '0deg');
        card.style.setProperty('--mouse-y-rotation', '0deg');
    });
});

console.log('✨ Personal website loaded successfully with enhanced interactions');

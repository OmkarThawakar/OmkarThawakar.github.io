document.addEventListener('DOMContentLoaded', () => {
  initParticles();
  initTypingEffect();
  initMobileMenu();
});

/* Mobile Menu Toggle */
function initMobileMenu() {
  const toggleBtn = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.navbar-nav');

  if (!toggleBtn || !navLinks) return;

  toggleBtn.addEventListener('click', () => {
    navLinks.classList.toggle('active');

    // Optional: Toggle icon between bars and times
    const icon = toggleBtn.querySelector('i');
    if (navLinks.classList.contains('active')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-times');
    } else {
      icon.classList.remove('fa-times');
      icon.classList.add('fa-bars');
    }
  });
}

/* Particle Network Animation */
function initParticles() {
  const canvas = document.getElementById('ai-background');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height;
  let particles = [];

  // Configuration
  const particleCount = 60;
  const connectionDistance = 150;
  const particleSpeed = 0.5;

  // Color Palette (Darker for better visibility)
  const colors = [
    'rgba(110, 30, 180, 0.8)', // Darker Violet
    'rgba(34, 153, 84, 0.8)',  // Darker Green
    'rgba(192, 57, 43, 0.8)',  // Darker Red
    'rgba(0, 86, 179, 0.8)'    // Darker Blue
  ];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }

  class Particle {
    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * particleSpeed;
      this.vy = (Math.random() - 0.5) * particleSpeed;
      this.size = Math.random() * 2 + 1;
      this.color = colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) this.vx *= -1;
      if (this.y < 0 || this.y > height) this.vy *= -1;
    }

    draw() {
      ctx.fillStyle = this.color;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function init() {
    resize();
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);

    // Draw connections
    ctx.strokeStyle = 'rgba(150, 150, 150, 0.2)'; // Neutral gray for connections
    ctx.lineWidth = 1;

    for (let i = 0; i < particles.length; i++) {
      const p1 = particles[i];
      p1.update();
      p1.draw();

      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p1.x - p2.x;
        const dy = p1.y - p2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  window.addEventListener('resize', () => {
    resize();
    particles = [];
    init();
  });

  init();
  animate();
}

/* Typing Effect */
function initTypingEffect() {
  const element = document.getElementById('typing-text');
  if (!element) return;

  const text = "Bridging the gap between Large Language Models and Vision.";
  let index = 0;

  function type() {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
      setTimeout(type, 50);
    }
  }

  type();
}

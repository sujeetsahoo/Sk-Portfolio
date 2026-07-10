/* ═══════════════════════════════════════
   SUJEET KUMAR PORTFOLIO — JAVASCRIPT
   Dynamic interactions, form, particles
   with Dark/Light theme toggle
   ═══════════════════════════════════════ */

'use strict';

/* ─── THEME TOGGLE ─── */
(function initTheme() {
  const saved = localStorage.getItem('portfolio-theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  }
})();

const themeToggle = document.getElementById('themeToggle');
themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'light' ? 'dark' : 'light';
  if (next === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
  } else {
    document.documentElement.removeAttribute('data-theme');
  }
  localStorage.setItem('portfolio-theme', next);
  // Update particle colors
  if (typeof updateParticleColors === 'function') updateParticleColors();
});

/* ─── HELPER: detect current theme ─── */
function isDarkTheme() {
  return document.documentElement.getAttribute('data-theme') !== 'light';
}

/* ─── LOADER ─── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    loader.classList.add('hidden');
    document.body.style.overflow = 'visible';
    startCounters();
    initReveal();
  }, 1800);
});

/* ─── CURSOR GLOW ─── */
const cursorGlow = document.getElementById('cursorGlow');
document.addEventListener('mousemove', (e) => {
  cursorGlow.style.left = e.clientX + 'px';
  cursorGlow.style.top = e.clientY + 'px';
});

/* ─── PARTICLES CANVAS ─── */
let updateParticleColors; // exposed for theme toggle
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  function getColors() {
    if (isDarkTheme()) {
      return { dot: ['0,212,255', '180,220,240'], line: 'rgba(0,212,255,' };
    } else {
      return { dot: ['0,144,204', '80,160,200'], line: 'rgba(0,144,204,' };
    }
  }

  class Particle {
    constructor() { this.reset(); }
    reset() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 2 + 0.5;
      this.speedX = (Math.random() - 0.5) * 0.3;
      this.speedY = (Math.random() - 0.5) * 0.3;
      this.opacity = Math.random() * 0.5 + 0.1;
      const colors = getColors();
      this.color = Math.random() > 0.5 ? colors.dot[0] : colors.dot[1];
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) this.reset();
    }
    draw() {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${this.color},${this.opacity})`;
      ctx.fill();
    }
  }

  for (let i = 0; i < 80; i++) particles.push(new Particle());

  function drawLines() {
    const colors = getColors();
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `${colors.line}${(0.06 * (1 - dist / 120)).toFixed(3)})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    particles.forEach(p => { p.update(); p.draw(); });
    drawLines();
    requestAnimationFrame(animate);
  }
  animate();

  // Expose color updater for theme toggle
  updateParticleColors = function() {
    particles.forEach(p => {
      const colors = getColors();
      p.color = Math.random() > 0.5 ? colors.dot[0] : colors.dot[1];
    });
  };
})();

/* ─── NAVBAR ─── */
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const navOverlay = document.getElementById('navOverlay');
const allNavLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  const btn = document.getElementById('backToTop');
  btn.classList.toggle('visible', window.scrollY > 500);
  updateActiveNav();
});

function toggleMobileMenu() {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.classList.toggle('open');
  if (navOverlay) navOverlay.classList.toggle('active', isOpen);
  document.body.style.overflow = isOpen ? 'hidden' : '';
}

function closeMobileMenu() {
  hamburger.classList.remove('open');
  navLinks.classList.remove('open');
  if (navOverlay) navOverlay.classList.remove('active');
  document.body.style.overflow = '';
}

hamburger.addEventListener('click', toggleMobileMenu);
if (navOverlay) navOverlay.addEventListener('click', closeMobileMenu);

allNavLinks.forEach(link => {
  link.addEventListener('click', closeMobileMenu);
});

function updateActiveNav() {
  const sections = document.querySelectorAll('section[id]');
  let current = '';
  sections.forEach(section => {
    const sectionTop = section.offsetTop - 100;
    if (window.scrollY >= sectionTop) current = section.getAttribute('id');
  });
  allNavLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === '#' + current) link.classList.add('active');
  });
}

/* ─── BACK TO TOP ─── */
document.getElementById('backToTop').addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ─── SCROLL REVEAL ─── */
function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        const fills = entry.target.querySelectorAll('.sb-fill, .lang-fill');
        fills.forEach(fill => {
          const width = fill.dataset.width;
          if (width) setTimeout(() => { fill.style.width = width + '%'; }, 200);
        });
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });
  revealEls.forEach(el => observer.observe(el));

  const allFills = document.querySelectorAll('.sb-fill, .lang-fill');
  const fillObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const width = entry.target.dataset.width;
        if (width) setTimeout(() => { entry.target.style.width = width + '%'; }, 300);
        fillObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  allFills.forEach(el => fillObserver.observe(el));
}

/* ─── STAT COUNTERS ─── */
function startCounters() {
  const counters = document.querySelectorAll('.stat-num');
  counters.forEach(counter => {
    const target = parseInt(counter.dataset.target);
    let current = 0;
    const increment = target / 50;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) { current = target; clearInterval(timer); }
      counter.textContent = Math.floor(current);
    }, 40);
  });
}

/* ─── CONTACT FORM ─── */
const contactForm = document.getElementById('contactForm');
const formSuccess = document.getElementById('formSuccess');
const submitBtn = document.getElementById('submitBtn');

function validateForm() {
  let valid = true;

  const fields = [
    { id: 'firstName', errorId: 'firstNameError', label: 'First name' },
    { id: 'lastName', errorId: 'lastNameError', label: 'Last name' },
    { id: 'email', errorId: 'emailError', label: 'Email', type: 'email' },
    { id: 'subject', errorId: 'subjectError', label: 'Subject' },
    { id: 'message', errorId: 'messageError', label: 'Message' },
  ];

  fields.forEach(field => {
    const el = document.getElementById(field.id);
    const errorEl = document.getElementById(field.errorId);
    el.classList.remove('error');
    errorEl.textContent = '';

    if (!el.value.trim()) {
      el.classList.add('error');
      errorEl.textContent = `${field.label} is required.`;
      valid = false;
    } else if (field.type === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(el.value.trim())) {
        el.classList.add('error');
        errorEl.textContent = 'Please enter a valid email address.';
        valid = false;
      }
    }
  });

  return valid;
}

contactForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  const btnText = submitBtn.querySelector('.btn-text');
  const btnLoader = submitBtn.querySelector('.btn-loader');

  // UI: Loading state
  submitBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoader.style.display = 'block';

  // Collect data
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const subject = document.getElementById('subject').value;
  const budget = document.getElementById('budget').value;
  const message = document.getElementById('message').value.trim();
  const wantsWhatsapp = document.getElementById('whatsappNotify').checked;

  // ── SEND EMAIL via Web3Forms (free, no backend) ──
  const formData = new FormData(contactForm);
  formData.set('subject', 'Portfolio Enquiry: ' + subject + ' — from ' + firstName + ' ' + lastName);
  formData.set('from_name', firstName + ' ' + lastName);

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      // Show success
      contactForm.style.display = 'none';
      formSuccess.style.display = 'block';
      formSuccess.style.animation = 'fadeInDown 0.6s ease forwards';

      // ── OPEN WHATSAPP with pre-filled message ──
      if (wantsWhatsapp) {
        const waMessage = encodeURIComponent(
          `Hi Sujeet! I just submitted an enquiry on your portfolio.\n\n` +
          `*Name:* ${firstName} ${lastName}\n` +
          `*Email:* ${email}\n` +
          `*Phone:* ${phone || 'Not provided'}\n` +
          `*Subject:* ${subject}\n` +
          `*Budget:* ${budget || 'Not specified'}\n\n` +
          `*Message:* ${message}`
        );
        window.open(`https://wa.me/916206406515?text=${waMessage}`, '_blank');
      }
    } else {
      alert('⚠️ Failed to send message. Please try again or contact me directly at sahusujeet751@gmail.com');
      console.error('Web3Forms error:', result);
    }
  } catch (error) {
    alert('⚠️ Network error. Please check your connection and try again.');
    console.error('Network error:', error);
  } finally {
    // Reset button state
    submitBtn.disabled = false;
    btnText.style.display = 'block';
    btnLoader.style.display = 'none';
  }
});

/* ─── RESET FORM ─── */
window.resetForm = function() {
  contactForm.reset();
  contactForm.style.display = 'flex';
  formSuccess.style.display = 'none';
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
};

/* ─── SMOOTH SCROLL for anchor links ─── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const offset = 80;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ─── PROJECT CARD HOVER GLOW ─── */
document.querySelectorAll('.project-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const glow = card.querySelector('.pc-glow');
    if (glow) {
      glow.style.left = x - 100 + 'px';
      glow.style.top = y - 100 + 'px';
    }
  });
});

/* ─── TYPING EFFECT for hero role ─── */
(function initTyping() {
  const roles = [
    'Full Stack Web Developer',
    'WordPress Expert',
    'Shopify Specialist',
    'SEO Strategist',
    'WATI Integration Expert',
    'Zoho CRM Developer',
    'GMB Profile Expert',
    'Google Workspace Setup',
    'Google Merchant Center',
  ];
  const el = document.querySelector('.title-role');
  if (!el) return;
  let roleIdx = 0;
  let charIdx = 0;
  let isDeleting = false;

  function type() {
    const current = roles[roleIdx];
    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
    }

    let speed = isDeleting ? 60 : 100;
    if (!isDeleting && charIdx === current.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      roleIdx = (roleIdx + 1) % roles.length;
      speed = 400;
    }
    setTimeout(type, speed);
  }

  setTimeout(type, 2500);
})();

/* ─── TILT EFFECT on cards ─── */
function initTilt() {
  document.querySelectorAll('.project-card, .timeline-card, .about-card-big').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateZ(0)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}
setTimeout(initTilt, 2000);

/* ─── WHATSAPP FLOAT PULSE TOGGLE ─── */
const waFloat = document.getElementById('whatsappFloat');
window.addEventListener('scroll', () => {
  waFloat.style.opacity = window.scrollY > 300 ? '1' : '0.7';
});

console.log(
  '%c👋 Hey Developer! %cSujeet Kumar Portfolio',
  'color: #333; font-size: 16px; font-weight: bold;',
  'color: #888; font-size: 14px;'
);
console.log(
  '%c📧 sahusujeet751@gmail.com | 📞 +91 62064 06515',
  'color: #666; font-size: 12px;'
);

// ── PROJECT FILTERS ──
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Update active button
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const filter = btn.dataset.filter;

    projectCards.forEach(card => {
      if (filter === 'all' || card.dataset.category === filter) {
        card.classList.remove('hidden');
        card.style.animation = 'fadeInDown 0.4s ease forwards';
      } else {
        card.classList.add('hidden');
      }
    });
  });
});

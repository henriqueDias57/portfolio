/**
 * NEXUS OS — Script Principal v3.0
 * Sistemas: i18n, Terminal, Cursor, HUD, GSAP Animations,
 *           Tilt 3D, Progress Rings, Log Stream, Handshake, Counters
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // ============================================================
  // 0. ESTADO GLOBAL
  // ============================================================
  let currentLang = localStorage.getItem('portfolio_lang') || 'pt';
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // 1. SISTEMA DE TRADUÇÃO (i18n)
  // ============================================================
  const langToggleBtn = document.getElementById('langToggle');
  const langBtnText   = document.getElementById('langBtnText');

  function getNestedValue(obj, path) {
    return path.split('.').reduce((p, k) => (p ? p[k] : undefined), obj);
  }

  function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('portfolio_lang', lang);
    document.documentElement.lang = lang;

    const data = translations[lang];
    if (!data) return;

    if (langBtnText) langBtnText.textContent = data.header.langText;

    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const val = getNestedValue(data, key);
      if (val === undefined) return;
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = val;
      } else {
        el.innerHTML = val;
      }
    });

    updateExperienceLogStream(data.experience.tasks);
    updateTerminalWelcome();
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      updateLanguage(currentLang === 'pt' ? 'en' : 'pt');
    });
  }

  // ============================================================
  // 2. EXPERIENCE — LOG STREAM
  // ============================================================
  function updateExperienceLogStream(tasks) {
    const container = document.getElementById('expLogStream');
    if (!container || !tasks) return;
    container.innerHTML = '';
    tasks.forEach(task => {
      const line = document.createElement('div');
      line.classList.add('log-stream-line');
      line.innerHTML = `<span class="log-arrow">→</span><span>${task}</span>`;
      container.appendChild(line);
    });
    // Re-trigger reveal se já visível
    revealLogStream();
  }

  function revealLogStream() {
    const lines = document.querySelectorAll('.log-stream-line');
    lines.forEach((line, i) => {
      setTimeout(() => line.classList.add('revealed'), i * 120);
    });
  }

  // ============================================================
  // 3. TERMINAL INTERATIVO
  // ============================================================
  const terminalWelcomeEl = document.getElementById('terminalWelcome');
  const terminalPromptEl  = document.getElementById('terminalPromptText');
  const terminalOutput    = document.getElementById('terminalOutput');
  const terminalInput     = document.getElementById('terminalInput');
  const terminalBody      = document.getElementById('terminalBody');

  function updateTerminalWelcome() {
    const data = translations[currentLang];
    if (!data) return;
    if (terminalWelcomeEl) terminalWelcomeEl.textContent = data.terminal.welcome;
    if (terminalPromptEl)  terminalPromptEl.textContent  = data.terminal.prompt;
  }

  function appendTerminalLine(text, className = '') {
    const line = document.createElement('div');
    line.classList.add('t-line');
    if (className) line.classList.add(className);
    line.textContent = text;
    terminalOutput.appendChild(line);
    if (terminalBody) terminalBody.scrollTop = terminalBody.scrollHeight;
  }

  function processCommand(rawCmd) {
    const cmd = rawCmd.trim().toLowerCase();
    const t   = translations[currentLang].terminal;

    // Linha de eco do comando
    appendTerminalLine(`${translations[currentLang].terminal.prompt} ${rawCmd}`, 't-cmd');

    switch (cmd) {
      case 'help':       appendTerminalLine(t.cmdHelp,       't-ok');   break;
      case 'about':      appendTerminalLine(t.cmdAbout,      't-warn');  break;
      case 'skills':     appendTerminalLine(t.cmdSkills,     't-info');  break;
      case 'projects':   appendTerminalLine(t.cmdProjects,   't-line');  break;
      case 'experience': appendTerminalLine(t.cmdExperience, 't-ok');   break;
      case 'contact':    appendTerminalLine(t.cmdContact,    't-line');  break;
      case 'clear':
        terminalOutput.innerHTML = '';
        return;
      case 'whoami':
        appendTerminalLine('henrique_dias@nexus-os', 't-ok');
        break;
      case 'ls':
        appendTerminalLine('sys/profile  log/experience  academy.db  deploy/  stack.matrix  connect.sh', 't-info');
        break;
      case 'pwd':
        appendTerminalLine('/home/henrique_dias', 't-muted');
        break;
      default:
        appendTerminalLine(t.cmdNotFound, 't-err');
    }
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        if (val.trim()) processCommand(val);
        terminalInput.value = '';
      }
    });
  }

  // Click no terminal body foca o input
  if (terminalBody) {
    terminalBody.addEventListener('click', () => terminalInput && terminalInput.focus());
  }

  // ============================================================
  // 4. CURSOR CUSTOMIZADO NEXUS
  // ============================================================
  const cursor     = document.getElementById('nexusCursor');
  const cursorRing = document.getElementById('nexusCursorRing');

  if (cursor && cursorRing && !prefersReducedMotion && window.innerWidth >= 768) {
    let rX = 0, rY = 0;

    document.addEventListener('mousemove', e => {
      cursor.style.left = e.clientX + 'px';
      cursor.style.top  = e.clientY + 'px';

      // Ring segue com leve inércia via lerp
      rX += (e.clientX - rX) * 0.12;
      rY += (e.clientY - rY) * 0.12;
    });

    // Smooth ring update em RAF
    function updateRing() {
      requestAnimationFrame(updateRing);
      cursorRing.style.left = rX + 'px';
      cursorRing.style.top  = rY + 'px';
    }
    updateRing();

    // Expande ring em elementos interativos
    const interactiveEls = 'a, button, .heat-cell, .ide-card, .contact-link-card, .nav-link, .stat-node';
    document.querySelectorAll(interactiveEls).forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
  }

  // ============================================================
  // 5. HUD — HEADS UP DISPLAY
  // ============================================================
  const hud       = document.getElementById('hud');
  const hudX      = document.getElementById('hudX');
  const hudY      = document.getElementById('hudY');
  const hudModule = document.getElementById('hudModule');

  const MODULE_MAP = {
    hero:           'SYS/HERO',
    about:          'SYS/PROFILE',
    experience:     'LOG/EXPERIENCE',
    education:      'ACADEMY.DB',
    projects:       'DEPLOY/LIST',
    skills:         'STACK.MATRIX',
    extracurricular:'COMMUNITY.NET',
    contact:        'CONNECT.SH',
  };

  if (hud && !prefersReducedMotion) {
    // Mostra HUD após boot
    document.addEventListener('nexus:ready', () => {
      setTimeout(() => hud.classList.add('visible'), 500);
    });
    // Fallback: mostra após 3.5s mesmo sem evento boot
    setTimeout(() => hud.classList.add('visible'), 3500);

    document.addEventListener('mousemove', e => {
      if (hudX) hudX.textContent = String(e.clientX).padStart(4, '0');
      if (hudY) hudY.textContent = String(e.clientY).padStart(4, '0');
    });

    // IntersectionObserver atualiza MODULE ativo
    const sections = document.querySelectorAll('section[id]');
    const sectionObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && hudModule) {
          hudModule.textContent = MODULE_MAP[entry.target.id] || entry.target.id.toUpperCase();
        }
      });
    }, { threshold: 0.4 });

    sections.forEach(s => sectionObs.observe(s));
  }

  // ============================================================
  // 6. SCROLL PROGRESS BAR
  // ============================================================
  const scrollBar = document.getElementById('scrollProgress');
  if (scrollBar) {
    window.addEventListener('scroll', () => {
      const scrollTop = window.scrollY;
      const docH      = document.documentElement.scrollHeight - window.innerHeight;
      const pct       = docH > 0 ? (scrollTop / docH) * 100 : 0;
      scrollBar.style.height = pct + '%';
    }, { passive: true });
  }

  // ============================================================
  // 7. ACTIVE NAV LINK
  // ============================================================
  const navLinks = document.querySelectorAll('.nav-link[data-section]');
  const navObs   = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      const link = document.querySelector(`.nav-link[data-section="${entry.target.id}"]`);
      if (link) link.classList.toggle('active', entry.isIntersecting);
    });
  }, { threshold: 0.5 });

  document.querySelectorAll('section[id]').forEach(s => navObs.observe(s));

  // ============================================================
  // 8. MOBILE MENU
  // ============================================================
  const mobileBtn = document.getElementById('mobileMenuBtn');
  const navList   = document.getElementById('navList');

  if (mobileBtn && navList) {
    mobileBtn.addEventListener('click', () => {
      const isOpen = navList.classList.toggle('open');
      mobileBtn.setAttribute('aria-expanded', isOpen);
    });

    // Fecha ao clicar em link
    navList.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navList.classList.remove('open');
        mobileBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ============================================================
  // 9. PROGRESS RINGS — EDUCAÇÃO
  // ============================================================
  const CIRCUNFERENCE = 2 * Math.PI * 26; // r=26

  function animateRings() {
    document.querySelectorAll('.progress-ring-fill').forEach(ring => {
      const pct   = parseInt(ring.getAttribute('data-progress') || '0', 10);
      const label = document.getElementById(ring.id + 'Label');
      const offset = CIRCUNFERENCE * (1 - pct / 100);

      ring.style.strokeDasharray  = CIRCUNFERENCE;
      ring.style.strokeDashoffset = CIRCUNFERENCE; // começa vazio

      requestAnimationFrame(() => {
        ring.style.strokeDashoffset = offset;
      });

      // Anima o número
      if (label && !prefersReducedMotion) {
        let current = 0;
        const step = () => {
          current = Math.min(current + 2, pct);
          label.textContent = current + '%';
          if (current < pct) requestAnimationFrame(step);
        };
        setTimeout(step, 200);
      } else if (label) {
        label.textContent = pct + '%';
      }
    });
  }

  // Dispara rings quando Education entrar na viewport
  const eduSection = document.getElementById('education');
  if (eduSection) {
    const ringObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        animateRings();
        ringObs.disconnect();
      }
    }, { threshold: 0.3 });
    ringObs.observe(eduSection);
  }

  // ============================================================
  // 10. NUMERIC COUNTERS — ABOUT
  // ============================================================
  function animateCounter(el) {
    if (prefersReducedMotion) return;
    const target = parseInt(el.getAttribute('data-target') || '0', 10);
    const suffix = el.getAttribute('data-suffix') || '';
    const prefix = el.getAttribute('data-prefix') || '';

    let start = 0;
    const duration = 1200;
    const startTime = performance.now();

    function step(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      start = Math.floor(eased * target);
      el.textContent = prefix + String(start).padStart(2, '0') + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const aboutSection = document.getElementById('about');
  if (aboutSection) {
    const counterObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        document.querySelectorAll('.stat-num[data-target]').forEach(el => animateCounter(el));
        counterObs.disconnect();
      }
    }, { threshold: 0.4 });
    counterObs.observe(aboutSection);
  }

  // ============================================================
  // 11. TILT 3D — PROJECT CARDS
  // ============================================================
  if (!prefersReducedMotion && window.innerWidth >= 768) {
    document.querySelectorAll('.ide-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect   = card.getBoundingClientRect();
        const x      = (e.clientX - rect.left) / rect.width  - 0.5;
        const y      = (e.clientY - rect.top)  / rect.height - 0.5;
        const rotX   = -y * 12;
        const rotY   =  x * 12;
        card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0deg) rotateY(0deg) scale(1)';
        card.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
      });

      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });
  }

  // ============================================================
  // 12. HANDSHAKE ANIMATION — CONTACT
  // ============================================================
  const contactSection = document.getElementById('contact');
  if (contactSection) {
    const hsObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        const steps = ['hs1', 'hs2', 'hs3'];
        steps.forEach((id, i) => {
          setTimeout(() => {
            const el = document.getElementById(id);
            if (el) el.classList.add('revealed');
          }, i * 500);
        });
        hsObs.disconnect();
      }
    }, { threshold: 0.4 });
    hsObs.observe(contactSection);
  }

  // ============================================================
  // 13. LOG STREAM — EXPERIENCE
  // ============================================================
  const expSection = document.getElementById('experience');
  if (expSection) {
    const logObs = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        revealLogStream();
        logObs.disconnect();
      }
    }, { threshold: 0.3 });
    logObs.observe(expSection);
  }

  // ============================================================
  // 14. GSAP SCROLL ANIMATIONS
  // ============================================================
  function initGSAP() {
    if (typeof gsap === 'undefined' || prefersReducedMotion) return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero — entrada inicial
    gsap.fromTo('#heroContent',
      { opacity: 0, x: -40 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.2 }
    );
    gsap.fromTo('#heroPanel',
      { opacity: 0, x: 40 },
      { opacity: 1, x: 0, duration: 0.9, ease: 'power3.out', delay: 0.4 }
    );

    // Seções — scroll-triggered
    const fadeTargets = [
      '.bento-card', '.stat-node',
      '.git-card', '.edu-card',
      '.ide-card', '.skill-category',
      '.extra-card', '.contact-link-card',
      '.handshake-panel',
    ];

    fadeTargets.forEach(selector => {
      gsap.utils.toArray(selector).forEach((el, i) => {
        gsap.fromTo(el,
          { opacity: 0, y: 32 },
          {
            opacity: 1, y: 0,
            duration: 0.65,
            ease: 'power3.out',
            delay: i * 0.08,
            scrollTrigger: {
              trigger: el,
              start: 'top 88%',
              toggleActions: 'play none none none',
            },
          }
        );
      });
    });

    // Section headers
    gsap.utils.toArray('.section-header').forEach(el => {
      gsap.fromTo(el,
        { opacity: 0, y: 20 },
        {
          opacity: 1, y: 0,
          duration: 0.6,
          ease: 'power2.out',
          scrollTrigger: { trigger: el, start: 'top 85%' },
        }
      );
    });
  }

  // ============================================================
  // 15. LENIS SMOOTH SCROLL
  // ============================================================
  function initLenis() {
    if (typeof Lenis === 'undefined' || prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.2,
      easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Integração com ScrollTrigger GSAP
    if (typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
    }
  }

  // ============================================================
  // 16. INICIALIZAÇÃO
  // ============================================================
  function init() {
    updateLanguage(currentLang);
    initGSAP();
    initLenis();
  }

  // Aguarda boot sequence ou inicializa direto
  document.addEventListener('nexus:ready', () => {
    init();
  });

  // Fallback: se boot foi skipado (sessão já inicializada ou reduced-motion)
  if (sessionStorage.getItem('nexus_booted') === '1' ||
      prefersReducedMotion ||
      !document.getElementById('bootOverlay')) {
    init();
  }

});

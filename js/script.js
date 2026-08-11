// Script Principal — Henrique Dias Portfolio (Cyber-Engineering UX & i18n)

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = localStorage.getItem('portfolio_lang') || 'pt';

  // ==========================================================================
  // 1. SISTEMA DE TRADUÇÃO DINÂMICA (PT / EN)
  // ==========================================================================
  const langToggleBtn = document.getElementById('langToggle');
  const langBtnText = document.getElementById('langBtnText');

  function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('portfolio_lang', lang);
    document.documentElement.lang = lang;

    const data = translations[lang];
    if (!data) return;

    if (langBtnText) {
      langBtnText.textContent = data.header.langText;
    }

    // Atualiza elementos com data-i18n
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
      const keyPath = el.getAttribute('data-i18n');
      const value = getNestedValue(data, keyPath);
      if (value !== undefined) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = value;
        } else {
          el.innerHTML = value;
        }
      }
    });

    // Atualiza lista de tarefas da experiência
    updateExperienceTasks(data.experience.tasks);

    // Atualiza mensagem de boas-vindas do terminal se existente
    updateTerminalWelcome();
  }

  function getNestedValue(obj, path) {
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
  }

  function updateExperienceTasks(tasks) {
    const tasksContainer = document.getElementById('expTasksList');
    if (!tasksContainer || !tasks) return;

    tasksContainer.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="git-arrow">-></span> ${task}`;
      tasksContainer.appendChild(li);
    });
  }

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const newLang = currentLang === 'pt' ? 'en' : 'pt';
      updateLanguage(newLang);
    });
  }

  // ==========================================================================
  // 2. TERMINAL INTERATIVO NO HERO
  // ==========================================================================
  const terminalWelcome = document.getElementById('terminalWelcome');
  const terminalPromptText = document.getElementById('terminalPromptText');
  const terminalOutput = document.getElementById('terminalOutput');
  const terminalInput = document.getElementById('terminalInput');

  function updateTerminalWelcome() {
    const data = translations[currentLang].terminal;
    if (terminalWelcome) {
      terminalWelcome.textContent = data.welcome;
    }
    if (terminalPromptText) {
      terminalPromptText.textContent = data.promptUser;
    }
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const cmd = terminalInput.value.trim().toLowerCase();
        terminalInput.value = '';
        if (!cmd) return;

        // Cria a linha digitada no histórico do terminal
        const userLine = document.createElement('div');
        userLine.className = 'terminal-output-line';
        userLine.style.color = '#38bdf8';
        userLine.textContent = `${translations[currentLang].terminal.promptUser} ${cmd}`;
        terminalOutput.appendChild(userLine);

        // Processa os comandos
        const respLine = document.createElement('div');
        respLine.className = 'terminal-output-line';
        respLine.style.margin = '0.4rem 0 0.8rem 0';

        const tData = translations[currentLang].terminal;

        switch (cmd) {
          case 'help':
            respLine.classList.add('terminal-output-line', 'success');
            respLine.textContent = tData.cmdHelp;
            break;
          case 'about':
            respLine.classList.add('terminal-output-line', 'warning');
            respLine.textContent = tData.cmdAbout;
            break;
          case 'skills':
            respLine.classList.add('terminal-output-line', 'info');
            respLine.textContent = tData.cmdSkills;
            break;
          case 'projects':
            respLine.classList.add('terminal-output-line');
            respLine.style.color = '#c084fc';
            respLine.textContent = tData.cmdProjects;
            break;
          case 'experience':
            respLine.classList.add('terminal-output-line', 'success');
            respLine.textContent = tData.cmdExperience;
            break;
          case 'contact':
            respLine.classList.add('terminal-output-line');
            respLine.style.color = '#f472b6';
            respLine.textContent = tData.cmdContact;
            break;
          case 'clear':
            terminalOutput.innerHTML = '';
            return;
          default:
            respLine.classList.add('terminal-output-line', 'error');
            respLine.textContent = tData.cmdNotFound;
        }

        terminalOutput.appendChild(respLine);

        // Rola automaticamente para o fim do terminal
        const termBody = document.getElementById('terminalBody');
        if (termBody) {
          termBody.scrollTop = termBody.scrollHeight;
        }
      }
    });
  }

  // Inicializa i18n
  updateLanguage(currentLang);

  // ==========================================================================
  // 3. MENU HAMBÚRGUER MOBILE & SMOOTH SCROLL
  // ==========================================================================
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileMenuBtn.classList.toggle('open');
    });

    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('open');
      });
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
      }
    });
  });

  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // ==========================================================================
  // 4. FUNDO CANVAS INTERATIVO (CYBER MATRIX & NODE GRID)
  // ==========================================================================
  const canvas = document.getElementById('bgCanvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let mouse = { x: width / 2, y: height / 2, radius: 150 };

    window.addEventListener('mousemove', (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    });

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    // Cria nós cibernéticos flutuantes
    const nodeCount = window.innerWidth < 768 ? 25 : 55;
    const nodes = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 2 + 1
      });
    }

    function animateCanvas() {
      ctx.clearRect(0, 0, width, height);

      // Renderiza linhas de grade ortogonais fracas
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.02)';
      ctx.lineWidth = 1;
      const gridSize = 60;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Atualiza e desenha os nós cibernéticos
      for (let i = 0; i < nodes.length; i++) {
        const n = nodes[i];
        n.x += n.vx;
        n.y += n.vy;

        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.fillStyle = 'rgba(6, 182, 212, 0.4)';
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        // Linhas de conexão entre nós próximos
        for (let j = i + 1; j < nodes.length; j++) {
          const n2 = nodes[j];
          const dist = Math.hypot(n.x - n2.x, n.y - n2.y);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(6, 182, 212, ${0.25 * (1 - dist / 120)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        // Conexão com o cursor do mouse
        const distMouse = Math.hypot(n.x - mouse.x, n.y - mouse.y);
        if (distMouse < mouse.radius) {
          ctx.strokeStyle = `rgba(6, 182, 212, ${0.4 * (1 - distMouse / mouse.radius)})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(mouse.x, mouse.y);
          ctx.stroke();
        }
      }

      requestAnimationFrame(animateCanvas);
    }

    // Só roda o canvas animado se o usuário não ativou reduz movimento
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      animateCanvas();
    }
  }

  // ==========================================================================
  // 5. ANIMAÇÕES GSAP SCROLLTRIGGER (REVELAÇÃO SUAVE DE SEÇÕES)
  // ==========================================================================
  if (typeof gsap !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);

    gsap.utils.toArray('.section').forEach(section => {
      gsap.from(section, {
        opacity: 0,
        y: 40,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      });
    });
  }
});

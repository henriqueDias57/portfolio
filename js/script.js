// Script para controle de Idioma (PT/EN), Animações e Interatividade

document.addEventListener('DOMContentLoaded', () => {
  let currentLang = localStorage.getItem('portfolio_lang') || 'pt';

  // Elementos do DOM com suporte a i18n
  const langToggleBtn = document.getElementById('langToggle');
  const langBtnText = document.getElementById('langBtnText');

  // Função para atualizar os textos com base no idioma selecionado
  function updateLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('portfolio_lang', lang);
    document.documentElement.lang = lang;

    const data = translations[lang];
    if (!data) return;

    // Atualiza o texto do botão de alternância
    if (langBtnText) {
      langBtnText.textContent = lang === 'pt' ? 'EN' : 'PT';
    }

    // Percorre todos os elementos com data-i18n
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

    // Atualiza listas (ex: tarefas da experiência)
    updateExperienceTasks(data.experience.tasks);
  }

  // Helper para buscar chaves aninhadas (ex: "hero.greeting")
  function getNestedValue(obj, path) {
    return path.split('.').reduce((prev, curr) => (prev ? prev[curr] : undefined), obj);
  }

  // Atualiza dinamicamente os itens da lista de tarefas da experiência
  function updateExperienceTasks(tasks) {
    const tasksContainer = document.getElementById('expTasksList');
    if (!tasksContainer || !tasks) return;

    tasksContainer.innerHTML = '';
    tasks.forEach(task => {
      const li = document.createElement('li');
      li.innerHTML = `<span class="bullet">▹</span> ${task}`;
      tasksContainer.appendChild(li);
    });
  }

  // Event listener para alternar idioma
  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      const newLang = currentLang === 'pt' ? 'en' : 'pt';
      updateLanguage(newLang);
    });
  }

  // Inicializa o idioma na carga da página
  updateLanguage(currentLang);

  // Menu Hambúrguer Responsivo Mobile
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');

  if (mobileMenuBtn && navMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      mobileMenuBtn.classList.toggle('open');
    });

    // Fecha o menu ao clicar em um link
    navMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        mobileMenuBtn.classList.remove('open');
      });
    });
  }

  // Scroll suave para links da navegação
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

  // Efeito Header Sticky com sombra ao rolar
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });
});

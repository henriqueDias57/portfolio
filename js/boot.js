/**
 * NEXUS OS — Boot Sequence
 * Sequência de inicialização coreografada antes de revelar o portfólio.
 * Duração total: ~2.2s
 */

(function () {
  'use strict';

  const overlay = document.getElementById('bootOverlay');
  const bootLog = document.getElementById('bootLog');
  if (!overlay || !bootLog) return;

  // Respeita prefers-reduced-motion: skip imediatamente
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    overlay.style.display = 'none';
    document.body.classList.add('boot-done');
    return;
  }

  // Detecta se já passou pelo boot nesta sessão (evita repetição em refresh)
  if (sessionStorage.getItem('nexus_booted') === '1') {
    overlay.style.display = 'none';
    document.body.classList.add('boot-done');
    return;
  }

  const LINES = [
    { text: '> Verificando módulos do sistema...',      status: 'OK',    delay: 0   },
    { text: '> Carregando perfil: henrique_dias.cfg',   status: 'OK',    delay: 220 },
    { text: '> Montando filesystem: /sys/experience',   status: 'OK',    delay: 420 },
    { text: '> Conectando ao github.com/henriqueDias57',status: 'OK',    delay: 650 },
    { text: '> Compilando stack de habilidades...',     status: 'OK',    delay: 870 },
    { text: '> Renderizando interface neural...',       status: 'OK',    delay: 1060 },
    { text: '> Interface inicializada. Bem-vindo.',     status: 'READY', delay: 1280 },
  ];

  // Cria e injeta cada linha com delay
  LINES.forEach(({ text, status, delay }) => {
    setTimeout(() => {
      const line = document.createElement('div');
      line.classList.add('boot-log-line');

      const pathSpan = document.createElement('span');
      pathSpan.classList.add('log-path');
      pathSpan.textContent = text;

      const statusSpan = document.createElement('span');
      statusSpan.classList.add(status === 'READY' ? 'log-ready' : 'log-ok');
      statusSpan.textContent = `  [${status}]`;

      line.appendChild(pathSpan);
      line.appendChild(statusSpan);
      bootLog.appendChild(line);

      // Força reflow antes de adicionar classe para animar
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          line.classList.add('visible');
        });
      });
    }, delay);
  });

  // Após todas as linhas, esconde o overlay
  const TOTAL_DURATION = LINES[LINES.length - 1].delay + 600;

  setTimeout(() => {
    overlay.classList.add('hiding');

    // Remove do DOM após a transição
    setTimeout(() => {
      overlay.style.display = 'none';
      document.body.classList.add('boot-done');
      sessionStorage.setItem('nexus_booted', '1');

      // Dispara evento para o script.js iniciar animações GSAP
      document.dispatchEvent(new CustomEvent('nexus:ready'));
    }, 900);
  }, TOTAL_DURATION);

})();

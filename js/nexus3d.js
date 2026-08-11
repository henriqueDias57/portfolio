/**
 * NEXUS OS — Núcleo 3D Neural (Three.js)
 * Esfera de partículas interconectadas reagindo ao mouse.
 * Fallback automático: canvas 2D se WebGL indisponível.
 * Pausado via IntersectionObserver quando fora da viewport.
 */

(function () {
  'use strict';

  // Aguarda o DOM estar pronto
  document.addEventListener('DOMContentLoaded', initNexus3D);

  function initNexus3D() {
    // Respeita prefers-reduced-motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Mobile: skip Three.js (fallback CSS gradient)
    if (window.innerWidth < 768) return;

    const canvas = document.getElementById('nexusCanvas');
    if (!canvas) return;

    // Tenta inicializar Three.js
    if (typeof THREE !== 'undefined') {
      try {
        initThreeJS(canvas);
      } catch (e) {
        console.warn('[NEXUS3D] Three.js falhou, usando fallback 2D.', e);
        initFallback2D(canvas);
      }
    } else {
      initFallback2D(canvas);
    }
  }

  // ============================================================
  // THREE.JS — ESFERA DE PARTÍCULAS INTERCONECTADAS
  // ============================================================
  function initThreeJS(canvas) {
    const W = canvas.offsetWidth;
    const H = canvas.offsetHeight;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    // Cena e câmera
    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 1000);
    camera.position.z = 3.2;

    // ---- Partículas (pontos na esfera) ----
    const N_POINTS  = 180;
    const RADIUS    = 1.4;
    const positions = new Float32Array(N_POINTS * 3);
    const colors    = new Float32Array(N_POINTS * 3);

    // Distribuição uniforme na esfera (golden angle)
    for (let i = 0; i < N_POINTS; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / N_POINTS);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      positions[i * 3]     = RADIUS * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = RADIUS * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = RADIUS * Math.cos(phi);

      // Cor base: cyan com variação sutil
      colors[i * 3]     = 0.0 + Math.random() * 0.2;
      colors[i * 3 + 1] = 0.7 + Math.random() * 0.3;
      colors[i * 3 + 2] = 0.9 + Math.random() * 0.1;
    }

    const geoPts = new THREE.BufferGeometry();
    geoPts.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geoPts.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const matPts = new THREE.PointsMaterial({
      size: 0.042,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const points = new THREE.Points(geoPts, matPts);
    scene.add(points);

    // ---- Linhas de conexão (arestas do grafo) ----
    const MAX_CONN_DIST = 0.75;
    const linePositions = [];

    const posArr = geoPts.getAttribute('position');
    for (let i = 0; i < N_POINTS; i++) {
      for (let j = i + 1; j < N_POINTS; j++) {
        const ax = posArr.getX(i), ay = posArr.getY(i), az = posArr.getZ(i);
        const bx = posArr.getX(j), by = posArr.getY(j), bz = posArr.getZ(j);
        const dist = Math.sqrt((ax-bx)**2 + (ay-by)**2 + (az-bz)**2);
        if (dist < MAX_CONN_DIST) {
          linePositions.push(ax, ay, az, bx, by, bz);
        }
      }
    }

    const geoLines = new THREE.BufferGeometry();
    geoLines.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));

    const matLines = new THREE.LineSegmentsGeometry
      ? null // evita importar extras
      : new THREE.LineBasicMaterial({
          color: 0x00d4ff,
          transparent: true,
          opacity: 0.18,
        });

    // Usa LineSegments nativo (sem extensões)
    const lineSeg = new THREE.LineSegments(
      geoLines,
      new THREE.LineBasicMaterial({ color: 0x00d4ff, transparent: true, opacity: 0.18 })
    );
    scene.add(lineSeg);

    // ---- Mouse influence ----
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    });

    // ---- Resize ----
    const resizeObs = new ResizeObserver(() => {
      const nW = canvas.offsetWidth;
      const nH = canvas.offsetHeight;
      renderer.setSize(nW, nH);
      camera.aspect = nW / nH;
      camera.updateProjectionMatrix();
    });
    resizeObs.observe(canvas);

    // ---- IntersectionObserver — pausa quando fora de viewport ----
    let isVisible = true;
    const visObs = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0.05 }
    );
    visObs.observe(canvas);

    // ---- Animation Loop ----
    let animId;
    let lastTime = 0;
    const TARGET_FPS = 60;
    const FRAME_TIME = 1000 / TARGET_FPS;

    function animate(ts) {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      const delta = ts - lastTime;
      if (delta < FRAME_TIME * 0.8) return; // throttle
      lastTime = ts;

      const t = ts * 0.0004;

      // Rotação base suave
      targetRotX += (mouseY * 0.3 - targetRotX) * 0.04;
      targetRotY += (mouseX * 0.5 - targetRotY) * 0.04;

      points.rotation.x = targetRotX + Math.sin(t * 0.5) * 0.05;
      points.rotation.y = targetRotY + t * 0.15;
      lineSeg.rotation.x = points.rotation.x;
      lineSeg.rotation.y = points.rotation.y;

      // Pulse de opacidade suave
      matPts.opacity   = 0.75 + Math.sin(t * 2) * 0.1;
      matLines.opacity = 0.14 + Math.sin(t * 1.5) * 0.04;

      renderer.render(scene, camera);
    }

    animate(0);

    // Cleanup ao descarregar
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animId);
      renderer.dispose();
    });
  }

  // ============================================================
  // FALLBACK 2D — Canvas simples sem WebGL
  // ============================================================
  function initFallback2D(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const N   = 60;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: 1.5 + Math.random() * 1.5,
    }));

    let mX = canvas.width / 2, mY = canvas.height / 2;

    document.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      mX = e.clientX - rect.left;
      mY = e.clientY - rect.top;
    });

    function draw() {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        const distM = Math.hypot(p.x - mX, p.y - mY);
        const glow  = distM < 120 ? 1 - distM / 120 : 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, ${Math.floor(180 + glow * 75)}, 255, ${0.5 + glow * 0.5})`;
        ctx.fill();
      });

      // Conexões entre pontos próximos
      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 100) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.12 * (1 - d / 100)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    draw();

    window.addEventListener('resize', () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    });
  }

})();

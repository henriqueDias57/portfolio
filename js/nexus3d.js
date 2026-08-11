/**
 * NEXUS OS — Núcleo 3D Neural (Three.js)
 * Esfera de partículas interconectadas reagindo ao mouse.
 * High-performance, zero uncaught errors, pixelRatio=1, IntersectionObserver.
 */

(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', initNexus3D);

  function initNexus3D() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    if (window.innerWidth < 768) return;

    const canvas = document.getElementById('nexusCanvas');
    if (!canvas) return;

    if (typeof THREE !== 'undefined') {
      try {
        initThreeJS(canvas);
      } catch (e) {
        console.warn('[NEXUS3D] Three.js fallback 2D:', e);
        initFallback2D(canvas);
      }
    } else {
      initFallback2D(canvas);
    }
  }

  function initThreeJS(canvas) {
    const W = canvas.offsetWidth || window.innerWidth;
    const H = canvas.offsetHeight || window.innerHeight;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(1); // 1x pixel ratio for maximum performance
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);

    const scene  = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, W / H, 0.1, 100);
    camera.position.z = 3.2;

    // ---- Partículas (120 pontos para leveza extrema) ----
    const N_POINTS  = 120;
    const RADIUS    = 1.4;
    const positions = new Float32Array(N_POINTS * 3);
    const colors    = new Float32Array(N_POINTS * 3);

    for (let i = 0; i < N_POINTS; i++) {
      const phi   = Math.acos(1 - 2 * (i + 0.5) / N_POINTS);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;

      positions[i * 3]     = RADIUS * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = RADIUS * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = RADIUS * Math.cos(phi);

      colors[i * 3]     = 0.0;
      colors[i * 3 + 1] = 0.8;
      colors[i * 3 + 2] = 1.0;
    }

    const geoPts = new THREE.BufferGeometry();
    geoPts.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geoPts.setAttribute('color',    new THREE.BufferAttribute(colors, 3));

    const matPts = new THREE.PointsMaterial({
      size: 0.045,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const points = new THREE.Points(geoPts, matPts);
    scene.add(points);

    // ---- Arestas do Grafo ----
    const MAX_CONN_DIST = 0.8;
    const linePositions = [];

    const posArr = geoPts.getAttribute('position');
    for (let i = 0; i < N_POINTS; i++) {
      for (let j = i + 1; j < N_POINTS; j++) {
        const ax = posArr.getX(i), ay = posArr.getY(i), az = posArr.getZ(i);
        const bx = posArr.getX(j), by = posArr.getY(j), bz = posArr.getZ(j);
        const dist = Math.hypot(ax-bx, ay-by, az-bz);
        if (dist < MAX_CONN_DIST) {
          linePositions.push(ax, ay, az, bx, by, bz);
        }
      }
    }

    const geoLines = new THREE.BufferGeometry();
    geoLines.setAttribute('position', new THREE.BufferAttribute(new Float32Array(linePositions), 3));

    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00d4ff,
      transparent: true,
      opacity: 0.2,
    });

    const lineSeg = new THREE.LineSegments(geoLines, lineMat);
    scene.add(lineSeg);

    // ---- Mouse Interaction ----
    let mouseX = 0, mouseY = 0;
    let targetRotX = 0, targetRotY = 0;

    const onMouseMove = (e) => {
      mouseX = (e.clientX / window.innerWidth  - 0.5) * 1.5;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
    };
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    // ---- Visibility Observer ----
    let isVisible = true;
    const visObs = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
    }, { threshold: 0.05 });
    visObs.observe(canvas);

    // ---- Animation Loop ----
    let animId;
    let lastTime = 0;

    function animate(ts) {
      animId = requestAnimationFrame(animate);
      if (!isVisible) return;

      // Throttle a ~45-60 FPS para evitar aquecimento de GPU
      if (ts - lastTime < 16) return;
      lastTime = ts;

      const t = ts * 0.0003;

      targetRotX += (mouseY * 0.2 - targetRotX) * 0.05;
      targetRotY += (mouseX * 0.4 - targetRotY) * 0.05;

      points.rotation.x  = targetRotX + Math.sin(t * 0.5) * 0.04;
      points.rotation.y  = targetRotY + t * 0.2;
      lineSeg.rotation.x = points.rotation.x;
      lineSeg.rotation.y = points.rotation.y;

      matPts.opacity  = 0.75 + Math.sin(t * 2) * 0.1;
      lineMat.opacity = 0.16 + Math.sin(t * 1.5) * 0.04;

      renderer.render(scene, camera);
    }

    animate(0);

    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
    });
  }

  function initFallback2D(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width  = canvas.offsetWidth || window.innerWidth;
    canvas.height = canvas.offsetHeight || window.innerHeight;

    const N   = 40;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
    }));

    function draw() {
      requestAnimationFrame(draw);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      pts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width)  p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.6)';
        ctx.fill();
      });

      for (let i = 0; i < N; i++) {
        for (let j = i + 1; j < N; j++) {
          const d = Math.hypot(pts[i].x - pts[j].x, pts[i].y - pts[j].y);
          if (d < 90) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = `rgba(0, 212, 255, ${0.15 * (1 - d / 90)})`;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }
    }

    draw();
  }

})();

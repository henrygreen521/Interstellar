// Lightweight falling white-dots background
(function () {
  // Don't run on chat or watch pages (user requested exclusion)
  const EXCLUDE_PATHS = ['/chat.html', '/watch.html'];
  try {
    if (EXCLUDE_PATHS.includes(window.location.pathname)) {
      // early-exit so those pages keep their original backgrounds
      // canvas may still be present in the DOM (e.g. chat.html), but we won't draw on it
      console.log('bg-dots: disabled on', window.location.pathname);
      return;
    }
  } catch (e) {
    // If accessing location throws for any reason, fall through and run
  }

  const MAX_PARTICLES = 90; // adjust density
  const SPAWN_PADDING = 60;
  let canvas, ctx, particles = [], w = 0, h = 0, dpr = 1, rafId;

  function makeCanvas() {
    canvas = document.getElementById('bg-dots-canvas');
    if (!canvas) {
      canvas = document.createElement('canvas');
      canvas.id = 'bg-dots-canvas';
      document.body.insertBefore(canvas, document.body.firstChild);
    }
    canvas.style.position = 'fixed';
    canvas.style.top = 0;
    canvas.style.left = 0;
    canvas.style.width = '100vw';
    canvas.style.height = '100vh';
    canvas.style.zIndex = 0;
    canvas.style.pointerEvents = 'none';
    canvas.setAttribute('aria-hidden', 'true');
    ctx = canvas.getContext('2d');
  }

  function resize() {
    dpr = Math.max(1, window.devicePixelRatio || 1);
    w = Math.max(1, Math.floor(window.innerWidth));
    h = Math.max(1, Math.floor(window.innerHeight));
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function spawnParticle(yStart) {
    return {
      x: rand(-SPAWN_PADDING, w + SPAWN_PADDING),
      y: (typeof yStart === 'number') ? yStart : rand(-h * 0.5, h),
      vy: rand(0.2, 0.9),       // vertical speed (slow)
      vx: rand(-0.2, 0.2),      // slight horizontal drift
      size: rand(0.6, 3.2),
      alpha: rand(0.08, 0.9),
      fadeRate: rand(0.0008, 0.003) // slow fade
    };
  }

  function initParticles() {
    particles = new Array(MAX_PARTICLES).fill(0).map(() => spawnParticle(rand(-h, h)));
  }

  function step() {
    ctx.clearRect(0, 0, w, h);
    // subtle glow via shadow (kept small)
    ctx.shadowColor = 'rgba(255,255,255,0.08)';
    ctx.shadowBlur = 6;

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= p.fadeRate;
      // draw
      ctx.globalAlpha = Math.max(0, Math.min(1, p.alpha));
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      // respawn when invisible or out of bounds
      if (p.y - p.size > h + SPAWN_PADDING || p.alpha <= 0.01) {
        particles[i] = spawnParticle(rand(-h * 0.5, -10));
      }
    }
    ctx.globalAlpha = 1;
    rafId = requestAnimationFrame(step);
  }

  function start() {
    makeCanvas();
    resize();
    initParticles();
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(step);
    window.addEventListener('resize', onResizeThrottled);
    window.addEventListener('orientationchange', resize);
  }

  let resizeTimer;
  function onResizeThrottled() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 120);
  }

  // Start after DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }

  // Expose for debugging
  window.__bgDots = {
    start: start,
    stop: () => { if (rafId) cancelAnimationFrame(rafId); window.removeEventListener('resize', onResizeThrottled); }
  };
})();

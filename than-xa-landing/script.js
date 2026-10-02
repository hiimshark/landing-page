/* =========================================================
   THẦN XÀ — High-Performance Interactive Script
   Lenis + GSAP Synchronized, Throttled 3D Parallax & Web Audio
   ========================================================= */

document.addEventListener('DOMContentLoaded', () => {

  // --- 1. LENIS SMOOTH SCROLL (SYNCHRONIZED WITH GSAP TICKER) ---
  let lenis = null;
  if (typeof Lenis !== 'undefined') {
    lenis = new Lenis({
      duration: 0.9, // Snappy & ultra-smooth, no floaty lag
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.5,
    });

    if (typeof ScrollTrigger !== 'undefined' && typeof gsap !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
      });
      gsap.ticker.lagSmoothing(0);
    } else {
      function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    }
  }

  // --- 2. OPTIMIZED 3D MOUSE PARALLAX TILT (LERPED & THROTTLED) ---
  const heroArtLayer = document.getElementById('hero-art-layer');
  const heroSection = document.getElementById('hero');

  let isHeroVisible = true;
  if ('IntersectionObserver' in window && heroSection) {
    const observer = new IntersectionObserver((entries) => {
      isHeroVisible = entries[0].isIntersecting;
    }, { threshold: 0.1 });
    observer.observe(heroSection);
  }

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  window.addEventListener('mousemove', (e) => {
    if (!isHeroVisible) return;
    targetX = (e.clientX / window.innerWidth - 0.5) * 2; // -1 to 1
    targetY = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  function renderHeroTilt() {
    if (isHeroVisible && heroArtLayer) {
      // Smooth linear interpolation (lerp)
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;

      const tiltX = (-currentY * 6).toFixed(2);
      const tiltY = (currentX * 6).toFixed(2);
      const panX = (-currentX * 12).toFixed(2);
      const panY = (-currentY * 12).toFixed(2);

      heroArtLayer.style.transform = `scale(1.06) translate3d(${panX}px, ${panY}px, 0) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`;
    }
    requestAnimationFrame(renderHeroTilt);
  }
  requestAnimationFrame(renderHeroTilt);

  // --- 3. GSAP ENTRANCE & SCROLL ANIMATIONS ---
  if (typeof gsap !== 'undefined') {
    // Quick Hero reveal
    gsap.from('.hero-fade-in', {
      opacity: 0,
      y: 25,
      stagger: 0.12,
      duration: 0.8,
      ease: 'power2.out',
      delay: 0.1,
    });

    if (typeof ScrollTrigger !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);

      gsap.from('.myth-card', {
        scrollTrigger: {
          trigger: '#myth',
          start: 'top 85%',
          once: true,
        },
        y: 20,
        opacity: 0.5,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'all', // Clears all inline styles after animation finishes so opacity is always 100%
      });

      gsap.from('.power-card', {
        scrollTrigger: {
          trigger: '#powers',
          start: 'top 85%',
          once: true,
        },
        y: 20,
        opacity: 0.5,
        stagger: 0.1,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'all',
      });
    }
  }

  // --- 4. LIGHTWEIGHT CANVAS PARTICLES (OPTIMIZED 20 PARTICLES) ---
  const canvas = document.getElementById('ambient-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let resizeTimeout;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
      }, 200);
    }, { passive: true });

    const particles = [];
    const particleCount = 20; // Reduced from 45 for 60-120fps smooth performance

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: Math.random() * 1.5 + 0.8,
        speedY: Math.random() * 0.4 + 0.2,
        speedX: (Math.random() - 0.5) * 0.2,
        alpha: (Math.random() * 0.4 + 0.2).toFixed(2),
        isEmber: Math.random() > 0.65,
      });
    }

    function animateParticles() {
      // Pause drawing if tab is in background
      if (document.hidden) {
        requestAnimationFrame(animateParticles);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particleCount; i++) {
        const p = particles[i];
        p.y -= p.speedY;
        p.x += p.speedX;

        if (p.y < -10) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = p.isEmber
          ? `rgba(224, 74, 67, ${p.alpha})`
          : `rgba(212, 175, 55, ${p.alpha})`;
        ctx.fill();
      }

      requestAnimationFrame(animateParticles);
    }
    requestAnimationFrame(animateParticles);
  }

  // --- 5. BACKGROUND MUSIC & SOUNDSCAPE ---
  const bgAudio = document.getElementById('bg-audio');
  const btnAudio = document.getElementById('btn-audio');
  const audioLabel = document.getElementById('audio-label');
  const audioIconWave = document.getElementById('audio-icon-wave');

  let audioCtx = null;
  let isAudioPlaying = false;
  let fadeInterval = null;

  // Initialize Web Audio for interactive Tibetan bell chimes
  function initBellContext() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playBellChime() {
    if (!audioCtx) return;
    try {
      const chimeOsc = audioCtx.createOscillator();
      const chimeGain = audioCtx.createGain();

      chimeOsc.type = 'sine';
      chimeOsc.frequency.setValueAtTime(432, audioCtx.currentTime); // 432Hz harmonic chime

      chimeGain.gain.setValueAtTime(0.08, audioCtx.currentTime);
      chimeGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 2.2);

      chimeOsc.connect(chimeGain);
      chimeGain.connect(audioCtx.destination);

      chimeOsc.start();
      chimeOsc.stop(audioCtx.currentTime + 2.3);
    } catch (e) {
      // AudioContext fallback
    }
  }

  function fadeInMusic(audioEl, targetVol = 0.45, durationMs = 1200) {
    if (!audioEl) return;
    clearInterval(fadeInterval);
    audioEl.volume = 0;
    audioEl.play().catch(() => {});
    const stepTime = 50;
    const stepDelta = targetVol / (durationMs / stepTime);

    fadeInterval = setInterval(() => {
      if (audioEl.volume + stepDelta >= targetVol) {
        audioEl.volume = targetVol;
        clearInterval(fadeInterval);
      } else {
        audioEl.volume += stepDelta;
      }
    }, stepTime);
  }

  function fadeOutMusic(audioEl, durationMs = 800) {
    if (!audioEl) return;
    clearInterval(fadeInterval);
    const stepTime = 50;
    const stepDelta = audioEl.volume / (durationMs / stepTime);

    fadeInterval = setInterval(() => {
      if (audioEl.volume - stepDelta <= 0) {
        audioEl.volume = 0;
        audioEl.pause();
        clearInterval(fadeInterval);
      } else {
        audioEl.volume -= stepDelta;
      }
    }, stepTime);
  }

  btnAudio?.addEventListener('click', () => {
    initBellContext();

    if (!isAudioPlaying) {
      // Bật nhạc nền
      isAudioPlaying = true;
      fadeInMusic(bgAudio, 0.45);
      if (audioLabel) audioLabel.textContent = 'NHẠC THIỀN: BẬT';
      audioIconWave?.classList.remove('opacity-0');
      btnAudio.classList.add('border-gold-bright', 'bg-gold-bright/10');
      playBellChime();
    } else {
      // Tắt nhạc nền
      isAudioPlaying = false;
      fadeOutMusic(bgAudio);
      if (audioLabel) audioLabel.textContent = 'ÂM THANH: TẮT';
      audioIconWave?.classList.add('opacity-0');
      btnAudio.classList.remove('border-gold-bright', 'bg-gold-bright/10');
    }
  });

  document.querySelectorAll('.hotspot').forEach((spot) => {
    spot.addEventListener('mouseenter', () => {
      playBellChime();
    }, { passive: true });
  });

  // --- 6. ZEN MODE (Chiêm Ngưỡng Thuần Túy) ---
  const btnZen = document.getElementById('btn-zen');
  const zenText = btnZen?.querySelector('.zen-text');

  btnZen?.addEventListener('click', () => {
    document.body.classList.toggle('zen-active');
    const isZen = document.body.classList.contains('zen-active');

    if (zenText) {
      zenText.textContent = isZen ? 'THOÁT CHIÊM NGƯỠNG' : 'CHIÊM NGƯỠNG';
    }
  });

  // --- 7. COVENANT MODAL ---
  const btnOpenModal = document.getElementById('btn-open-covenant');
  const modal = document.getElementById('covenant-modal');
  const btnCloseModal = document.getElementById('btn-close-modal');
  const form = document.getElementById('covenant-form');
  const successMsg = document.getElementById('covenant-success');

  btnOpenModal?.addEventListener('click', () => {
    modal.classList.remove('opacity-0', 'pointer-events-none');
    playBellChime();
  });

  btnCloseModal?.addEventListener('click', () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
  });

  modal?.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.add('opacity-0', 'pointer-events-none');
    }
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    form.style.display = 'none';
    successMsg.classList.remove('hidden');
    playBellChime();
  });

});

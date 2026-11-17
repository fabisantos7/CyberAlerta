/* =========================================================
   CYBER ALERTA · SIPAT 2026 — Cyberpunk SOC edition
   --------------------------------------------------------
   Funcionalidades:
   - Quiz interativo (5 perguntas + correção + resultado)
   - Checklist com barra de progresso e percentual
   - Typing animation no hero
   - Relógio do sistema no header
   - Scroll reveal (IntersectionObserver)
   - Barra de progresso de leitura
   - Scroll spy na navegação
   - Menu mobile (hamburger)
   - Botão voltar ao topo
   - Contadores animados
   ========================================================= */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;

  /* =========================================================
     1. QUIZ
     ========================================================= */
  const questions = [
    { q: "Você recebe um vídeo de alguém conhecido pedindo uma transferência urgente. Qual é a atitude mais segura?",
      a: ["Transferir, pois o rosto parece verdadeiro.", "Confirmar o pedido por outro canal, usando um contato que você já conhece.", "Pedir que a pessoa envie o vídeo novamente."],
      correct: 1,
      why: "A imagem e a voz podem ser manipuladas. Confirme por um canal independente antes de qualquer pagamento." },
    { q: "O que é um deepfake?",
      a: ["Um conteúdo de áudio, imagem ou vídeo manipulado ou gerado com IA para parecer real.", "Um tipo de antivírus.", "Uma cópia de segurança automática."],
      correct: 0,
      why: "Deepfakes usam técnicas de inteligência artificial para criar ou alterar conteúdos de forma convincente." },
    { q: "Um anúncio mostra uma pessoa famosa oferecendo uma promoção muito vantajosa e leva a um site desconhecido. O que fazer?",
      a: ["Pagar rapidamente antes que a promoção acabe.", "Compartilhar com amigos para confirmar.", "Verificar a oferta nos canais oficiais da empresa e conferir o endereço do site."],
      correct: 2,
      why: "Anúncios podem usar imagens e vozes sem autorização. Procure a promoção diretamente no canal oficial." },
    { q: "Qual atitude ajuda a proteger suas contas?",
      a: ["Usar a mesma senha em todos os serviços.", "Ativar a verificação em duas etapas e usar senhas diferentes.", "Enviar sua senha para alguém de confiança guardar."],
      correct: 1,
      why: "Senhas únicas e autenticação em duas etapas reduzem o risco de acesso indevido." },
    { q: "Ao terminar de usar um computador compartilhado, o que você deve fazer?",
      a: ["Deixar o e-mail aberto para facilitar o próximo acesso.", "Salvar a senha no navegador.", "Fazer logout, fechar documentos e não deixar arquivos pessoais em locais públicos."],
      correct: 2,
      why: "Encerrar as sessões e fechar os arquivos ajuda a impedir que outra pessoa acesse suas informações." }
  ];

  let current = 0, score = 0, answered = false, restartBound = false;
  const qEl = document.getElementById('quiz-question');
  const optsEl = document.getElementById('quiz-options');
  const feedback = document.getElementById('quiz-feedback');
  const next = document.getElementById('quiz-next');
  const countEl = document.getElementById('question-count');
  const progressEl = document.getElementById('quiz-progress');

  function renderQuestion(initial) {
    answered = false;
    next.disabled = true;
    next.innerHTML = current === questions.length - 1
      ? '<span class="btn-glyph">&gt;</span> view_result →'
      : '<span class="btn-glyph">&gt;</span> next_query →';

    countEl.textContent = `QUERY ${String(current + 1).padStart(2, '0')} / 05`;
    progressEl.style.width = `${(current + 1) * 20}%`;

    const item = questions[current];
    if (initial || prefersReducedMotion) {
      paintQuestion(item);
    } else {
      qEl.classList.add('fading');
      setTimeout(() => {
        paintQuestion(item);
        qEl.classList.remove('fading');
      }, 200);
    }
  }

  function paintQuestion(item) {
    qEl.innerHTML = `<span class="q-label">&gt; QUERY_${String(current + 1).padStart(2, '0')}</span><h3>${item.q}</h3>`;
    optsEl.innerHTML = '';
    feedback.textContent = '';
    item.a.forEach((answer, i) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.innerHTML = `<span class="letter">${String.fromCharCode(65 + i)}</span><span>${answer}</span>`;
      btn.addEventListener('click', () => selectAnswer(i));
      optsEl.appendChild(btn);
    });
  }

  function selectAnswer(index) {
    if (answered) return;
    answered = true;
    const item = questions[current];
    const buttons = [...optsEl.children];
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (i === item.correct) b.classList.add('correct');
      if (i === index && i !== item.correct) b.classList.add('wrong');
    });
    if (index === item.correct) score++;
    const ok = index === item.correct;
    feedback.innerHTML = (ok
      ? '<span style="color:var(--neon)">[ OK ]</span> '
      : '<span style="color:var(--magenta)">[ FAIL ]</span> ') + item.why;
    next.disabled = false;
  }

  next.addEventListener('click', () => {
    if (current < questions.length - 1) {
      current++;
      renderQuestion(false);
    } else {
      showResult();
    }
  });

  function showResult() {
    countEl.textContent = 'RESULT // FINAL';
    progressEl.style.width = '100%';
    const headline = score === 5 ? 'EXCELLENT. Você está alerta.' :
                      score >= 3 ? 'Bom. Continue treinando.' :
                      'Reveja os protocolos.';

    if (prefersReducedMotion) {
      paintResult(headline);
    } else {
      qEl.classList.add('fading');
      setTimeout(() => {
        paintResult(headline);
        qEl.classList.remove('fading');
      }, 200);
    }
  }

  function paintResult(headline) {
    qEl.innerHTML = `<span class="q-label">&gt; SCORE_REPORT</span><div class="result-score">${score}/5</div><h3>${headline}</h3>`;
    optsEl.innerHTML = '';
    feedback.innerHTML = '<span style="color:var(--text-dimmer)">// system_note:</span> não confie apenas na voz ou na imagem. Confirme pedidos e ofertas por canais oficiais.';
    next.innerHTML = '<span class="btn-glyph">&gt;</span> retry_challenge ↺';
    next.disabled = false;
    if (!restartBound) {
      next.onclick = () => {
        current = 0; score = 0;
        next.onclick = null;
        restartBound = false;
        renderQuestion(false);
      };
      restartBound = true;
    }
  }

  renderQuestion(true);

  /* =========================================================
     2. CHECKLIST
     ========================================================= */
  const checks = [...document.querySelectorAll('.check-item')];
  const progressNumber = document.getElementById('progress-number');
  const progressBarFill = document.getElementById('progress-bar-fill');

  function updateChecklist() {
    const done = checks.filter(c => c.checked).length;
    const percent = Math.round(done / checks.length * 100);
    progressNumber.textContent = percent + '%';
    if (progressBarFill) progressBarFill.style.width = percent + '%';
  }

  checks.forEach(c => c.addEventListener('change', updateChecklist));
  document.getElementById('reset-checklist').addEventListener('click', () => {
    checks.forEach(c => c.checked = false);
    updateChecklist();
  });
  updateChecklist();

  /* =========================================================
     3. TYPING ANIMATION no hero
     ========================================================= */
  const typedEl = document.getElementById('typed-hero');
  const typedText = 'run --alert deepfake_voice_clone.exe';
  if (typedEl && !prefersReducedMotion) {
    let i = 0;
    function type() {
      if (i <= typedText.length) {
        typedEl.textContent = typedText.slice(0, i);
        i++;
        setTimeout(type, 55 + Math.random() * 40);
      }
    }
    setTimeout(type, 500);
  } else if (typedEl) {
    typedEl.textContent = typedText;
  }

  /* =========================================================
     4. SYSTEM CLOCK
     ========================================================= */
  const clockEl = document.getElementById('sys-clock');
  if (clockEl) {
    function updateClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      clockEl.textContent = `${h}:${m}:${s}`;
    }
    updateClock();
    setInterval(updateClock, 1000);
  }

  /* =========================================================
     5. SCROLL REVEAL
     ========================================================= */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    revealEls.forEach(el => {
      const delay = parseInt(el.dataset.revealDelay || '0', 10);
      if (delay) el.style.transitionDelay = `${delay}ms`;
    });
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('is-visible'));
  }

  /* =========================================================
     6. READING PROGRESS BAR
     ========================================================= */
  const readingProgress = document.getElementById('reading-progress');
  const topbar = document.getElementById('topbar');
  function updateReadingProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = docHeight > 0 ? window.scrollY / docHeight : 0;
    readingProgress.style.width = (scrolled * 100) + '%';
    if (window.scrollY > 8) topbar.classList.add('scrolled');
    else topbar.classList.remove('scrolled');
  }
  updateReadingProgress();
  window.addEventListener('scroll', updateReadingProgress, { passive: true });
  window.addEventListener('resize', updateReadingProgress);

  /* =========================================================
     7. SCROLL SPY
     ========================================================= */
  const navLinks = [...document.querySelectorAll('.topbar nav a')];
  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute('href')))
    .filter(Boolean);

  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = '#' + entry.target.id;
          navLinks.forEach(a => {
            if (a.getAttribute('href') === id) a.classList.add('active');
            else a.classList.remove('active');
          });
        }
      });
    }, { rootMargin: '-50% 0px -45% 0px' });
    sections.forEach(s => spy.observe(s));
  }

  /* =========================================================
     8. MOBILE NAV TOGGLE
     ========================================================= */
  const navToggle = document.getElementById('nav-toggle');
  const mainNav = document.getElementById('main-nav');
  navToggle.addEventListener('click', () => {
    const isOpen = mainNav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', String(isOpen));
    navToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
  });
  mainNav.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      mainNav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      navToggle.setAttribute('aria-label', 'Abrir menu');
    });
  });

  /* =========================================================
     9. BACK TO TOP
     ========================================================= */
  const backToTop = document.getElementById('back-to-top');
  function updateBackToTop() {
    if (window.scrollY > window.innerHeight * 0.6) backToTop.classList.add('is-visible');
    else backToTop.classList.remove('is-visible');
  }
  updateBackToTop();
  window.addEventListener('scroll', updateBackToTop, { passive: true });
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  });

  /* =========================================================
     10. CONTADORES ANIMADOS
     ========================================================= */
  const counters = document.querySelectorAll('[data-counter]');
  function animateCounter(el) {
    const target = parseInt(el.dataset.counter, 10);
    const duration = 900;
    const start = performance.now();
    function step(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = String(Math.round(target * eased)).padStart(2, '0');
      if (t < 1) requestAnimationFrame(step);
      else el.textContent = String(target).padStart(2, '0');
    }
    requestAnimationFrame(step);
  }
  if (!prefersReducedMotion && 'IntersectionObserver' in window) {
    const cObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          cObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach(c => cObserver.observe(c));
  }

  /* =========================================================
     11. SMOOTH SCROLL COM OFFSET
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#' || href.length < 2) return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const headerH = 60;
      const top = target.getBoundingClientRect().top + window.scrollY - headerH;
      window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
    });
  });

  /* =========================================================
     12. LIGHTBOX (galeria de prints)
     ========================================================= */
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightbox-img');
  const lightboxCaption = document.getElementById('lightbox-caption');
  const lightboxClose = document.getElementById('lightbox-close');
  const lightboxPrev = document.getElementById('lightbox-prev');
  const lightboxNext = document.getElementById('lightbox-next');
  const lightboxTriggers = [...document.querySelectorAll('[data-lightbox="prints"]')];
  let currentLbIndex = 0;

  function openLightbox(index) {
    if (!lightboxTriggers[index]) return;
    currentLbIndex = index;
    const trigger = lightboxTriggers[index];
    const imgSrc = trigger.getAttribute('href');
    const title = trigger.getAttribute('data-title') || '';
    lightboxImg.src = imgSrc;
    lightboxImg.alt = title;
    lightboxCaption.textContent = title;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  function nextLightbox() {
    currentLbIndex = (currentLbIndex + 1) % lightboxTriggers.length;
    openLightbox(currentLbIndex);
  }

  function prevLightbox() {
    currentLbIndex = (currentLbIndex - 1 + lightboxTriggers.length) % lightboxTriggers.length;
    openLightbox(currentLbIndex);
  }

  lightboxTriggers.forEach((trigger, i) => {
    trigger.addEventListener('click', (e) => {
      e.preventDefault();
      openLightbox(i);
    });
  });

  if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
  if (lightboxNext) lightboxNext.addEventListener('click', nextLightbox);
  if (lightboxPrev) lightboxPrev.addEventListener('click', prevLightbox);

  // Click on backdrop closes
  if (lightbox) {
    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowRight') nextLightbox();
    else if (e.key === 'ArrowLeft') prevLightbox();
  });

})();

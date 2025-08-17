/* ===== interactions, animations, bg, form ===== */

/* NAV: smooth scroll & active state */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const id = link.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({behavior:'smooth', block:'start'});
    // close mobile nav
    document.body.classList.remove('nav-open');
  });
});

/* mobile nav toggle */
const navToggle = document.getElementById('navToggle');
navToggle?.addEventListener('click', () => document.body.classList.toggle('nav-open'));

/* active nav on scroll */
const navLinks = Array.from(document.querySelectorAll('.nav-link'));
const sections = navLinks.map(a => document.getElementById(a.getAttribute('href').slice(1)));
function updateActive() {
  const y = window.scrollY + 140;
  sections.forEach((sec, i) => {
    if (!sec) return;
    const top = sec.offsetTop, bottom = top + sec.offsetHeight;
    if (y >= top && y < bottom) {
      navLinks.forEach(n => n.classList.remove('active'));
      navLinks[i]?.classList.add('active');
    }
  });
  // back-to-top visibility
  const back = document.getElementById('backToTop');
  if (window.scrollY > 420) back.classList.add('show'); else back.classList.remove('show');
}
window.addEventListener('scroll', updateActive);
updateActive();

/* back to top */
document.getElementById('backToTop')?.addEventListener('click', () => window.scrollTo({top:0,behavior:'smooth'}));

/* reveal on scroll */
const io = new IntersectionObserver(entries => {
  entries.forEach(en => {
    if (en.isIntersecting) en.target.classList.add('in');
  });
}, {threshold:0.14});
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* tilt hover microinteraction */
document.querySelectorAll('.tilt').forEach(el => {
  el.addEventListener('mousemove', e => {
    const r = el.getBoundingClientRect();
    const dx = (e.clientX - (r.left + r.width/2)) / r.width;
    const dy = (e.clientY - (r.top + r.height/2)) / r.height;
    el.style.transform = `perspective(700px) rotateX(${dy * -6}deg) rotateY(${dx * 6}deg) translateY(-6px)`;
  });
  el.addEventListener('mouseleave', () => el.style.transform = '');
});

/* contact form submit (Formspree placeholder) */
const form = document.getElementById('contactForm');
const statusEl = document.getElementById('formStatus');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    try {
      const URL = 'https://formspree.io/f/YOUR_FORM_ID'; // <- replace with your Formspree endpoint
      const res = await fetch(URL, {method:'POST', body:data, headers:{'Accept':'application/json'}});
      if (res.ok) {
        statusEl.textContent = 'Thanks! Message sent.';
        form.reset();
      } else {
        statusEl.textContent = 'Submission failed — please email me directly.';
      }
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Network error — try emailing me directly.';
    }
  });
}

/* animated background: particles + lines */
(function background(){
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  let W = canvas.width = innerWidth;
  let H = canvas.height = innerHeight;
  const DPR = window.devicePixelRatio || 1;
  const N = Math.max(60, Math.round((W*H) / 160000));
  const particles = [];

  function rand(a,b){ return Math.random()*(b-a)+a; }
  function init(){
    particles.length = 0;
    for (let i=0;i<N;i++){
      particles.push({
        x: rand(0,W),
        y: rand(0,H),
        vx: rand(-0.3,0.3),
        vy: rand(-0.3,0.3),
        r: rand(0.9,2.5)
      });
    }
  }
  init();

  function resize(){
    W = canvas.width = innerWidth;
    H = canvas.height = innerHeight;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  addEventListener('resize', () => { resize(); init(); });

  function step(){
    ctx.clearRect(0,0,W,H);

    // soft wash
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,'rgba(34,211,238,0.02)');
    g.addColorStop(1,'rgba(255,78,203,0.02)');
    ctx.fillStyle = g;
    ctx.fillRect(0,0,W,H);

    // connect lines
    for (let i=0;i<particles.length;i++){
      const a = particles[i];
      for (let j=i+1;j<particles.length;j++){
        const b = particles[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx,dy);
        if (d < 110) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(34,211,238,${0.08*(1-d/110)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
      }
    }

    // draw particles
    for (const p of particles){
      p.x += p.vx; p.y += p.vy;
      if (p.x < -10) p.x = W + 10;
      if (p.x > W + 10) p.x = -10;
      if (p.y < -10) p.y = H + 10;
      if (p.y > H + 10) p.y = -10;

      // glow
      const rg = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r*6);
      rg.addColorStop(0,'rgba(255,78,203,0.06)');
      rg.addColorStop(1,'rgba(255,78,203,0)');
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r*4, 0, Math.PI*2);
      ctx.fill();

      ctx.beginPath();
      ctx.fillStyle = 'rgba(34,211,238,0.85)';
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }
  step();
})();

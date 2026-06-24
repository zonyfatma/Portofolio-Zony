// Small helper script for portfolio
document.getElementById('year').textContent = new Date().getFullYear();

// Smooth scroll for internal links
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const target = document.querySelector(a.getAttribute('href'));
    if(target){e.preventDefault();target.scrollIntoView({behavior:'smooth',block:'start'});}  
  })
});

// Add accessible focus-visible outlines for interactive elements
document.querySelectorAll('a, button').forEach(el=>{
  el.addEventListener('keydown', (e)=>{
    if(e.key === 'Tab') el.classList.add('focus-visible');
  });
  el.addEventListener('blur', ()=> el.classList.remove('focus-visible'));
});

// Profile image fallback: replace with styled placeholder if image fails to load
const profileImg = document.querySelector('.profile-photo');
if(profileImg){
  profileImg.addEventListener('error', ()=>{
    try{
      const placeholder = document.createElement('div');
      placeholder.className = 'profile-placeholder';
      placeholder.setAttribute('role','img');
      placeholder.setAttribute('aria-label','Foto profil tidak tersedia');
      const initials = document.createElement('span');
      initials.className = 'placeholder-initials';
      initials.textContent = 'ZF';
      placeholder.appendChild(initials);
      profileImg.replaceWith(placeholder);
    }catch(e){
      profileImg.style.display = 'none';
    }
  });
}

// Ensure main sections have the 'reveal' class before observing
document.querySelectorAll('main > section').forEach(s => { if(!s.classList.contains('reveal')) s.classList.add('reveal'); });

// Reveal on scroll with subtle stagger
const reveals = document.querySelectorAll('.reveal');
if('IntersectionObserver' in window && reveals.length){
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        // compute index from current NodeList for consistent stagger
        const all = Array.from(document.querySelectorAll('.reveal'));
        const idx = Math.max(0, all.indexOf(e.target));
        setTimeout(()=>{ e.target.classList.add('visible'); }, Math.min(600, idx * 90));
        io.unobserve(e.target);
      }
    });
  },{threshold:0.12});
  reveals.forEach(r=>io.observe(r));
}

// Back to top button
const back = document.createElement('button');
back.className = 'back-to-top';
back.innerText = '↑';
document.body.appendChild(back);
back.addEventListener('click', ()=>window.scrollTo({top:0,behavior:'smooth'}));
window.addEventListener('scroll', ()=>{
  if(window.scrollY > 400) back.classList.add('show'); else back.classList.remove('show');
});

// Lightbox for certificates
const lightbox = document.getElementById('lightbox');
const lbImg = document.getElementById('lightbox-img');
const lbClose = document.querySelector('.lightbox-close');
document.querySelectorAll('.cert-card').forEach(a=>{
  a.addEventListener('click', (e)=>{
    e.preventDefault();
    const img = a.querySelector('.cert-thumb');
    if(img && lightbox){
      lbImg.src = img.src;
      lightbox.setAttribute('aria-hidden','false');
    }
  });
});
function closeLightbox(){
  if(lightbox){ lightbox.setAttribute('aria-hidden','true'); lbImg.src = ''; }
}
if(lbClose) lbClose.addEventListener('click', closeLightbox);
if(lightbox){
  lightbox.addEventListener('click', (e)=>{ if(e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e)=>{ if(e.key === 'Escape') closeLightbox(); });
}

// Animated counters for stats
const statElems = document.querySelectorAll('.stat-value[data-target]');
function animateCounter(el, target){
  let start = 0; const duration = 900; const stepTime = Math.max(8, Math.floor(duration/target));
  const timer = setInterval(()=>{
    start += 1;
    el.textContent = start;
    if(start >= target) clearInterval(timer);
  }, stepTime);
}
if('IntersectionObserver' in window && statElems.length){
  const sObserver = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const el = e.target; animateCounter(el, parseInt(el.dataset.target,10)); sObserver.unobserve(el);
      }
    });
  },{threshold:0.6});
  statElems.forEach(s=>sObserver.observe(s));
}

// Fill skill bars when visible
const skillBars = document.querySelectorAll('.skill-bar');
if('IntersectionObserver' in window && skillBars.length){
  const kObserver = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{
      if(e.isIntersecting){
        const bar = e.target; const level = bar.dataset.level || bar.getAttribute('data-level') || 0;
        const fill = bar.querySelector('.skill-fill');
        if(fill){ fill.style.width = level + '%'; }
        kObserver.unobserve(bar);
      }
    });
  },{threshold:0.25});
  skillBars.forEach(b=>kObserver.observe(b));
}

// Subtle tilt effect on cards
document.querySelectorAll('.card').forEach(c=>{
  c.addEventListener('mousemove', (e)=>{
    const rect = c.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
    const cx = rect.width/2; const cy = rect.height/2;
    const dx = (x - cx)/cx; const dy = (y - cy)/cy;
    c.style.transform = `rotateX(${(-dy*3).toFixed(2)}deg) rotateY(${(dx*3).toFixed(2)}deg)`;
    c.classList.add('tilt');
  });
  c.addEventListener('mouseleave', ()=>{ c.style.transform=''; c.classList.remove('tilt'); });
});

// Project filtering (Informatika / Menari)
const filterButtons = document.querySelectorAll('[data-filter]');
const projectCards = document.querySelectorAll('.project-grid .card');
function applyFilter(type){
  projectCards.forEach(c=>{
    const t = c.getAttribute('data-type') || 'all';
    if(type === 'all' || t === type){ c.style.display='block'; }
    else { c.style.display='none'; }
  });
}
filterButtons.forEach(b=>{
  b.addEventListener('click', (e)=>{
    const t = b.getAttribute('data-filter');
    applyFilter(t);
    // smooth scroll to projects when using nav-filter
    if(b.closest('nav')){
      const projects = document.getElementById('projects');
      if(projects) projects.scrollIntoView({behavior:'smooth'});
    }
  });
});

// Parallax background movement on hero
const hero = document.querySelector('.hero');
if(hero){
  hero.addEventListener('mousemove', (e)=>{
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left)/rect.width * 100;
    const y = (e.clientY - rect.top)/rect.height * 100;
    hero.style.backgroundPosition = `${x}% ${y}%, ${100-x}% ${100-y}%, center`;
  });
  hero.addEventListener('mouseleave', ()=>{ hero.style.backgroundPosition = ''; });
}

// Subtle pulse for primary buttons when visible
const primaryBtns = document.querySelectorAll('.btn');
const btnObserver = ('IntersectionObserver' in window) ? new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){ e.target.classList.add('glow'); setTimeout(()=>e.target.classList.remove('glow'),1200); btnObserver.unobserve(e.target); }
  });
},{threshold:0.4}) : null;
if(btnObserver) primaryBtns.forEach(b=>btnObserver.observe(b));

/* --- Page enhancements: slider, mouse glow, extended lightbox --- */

// Certificates slider (simple, no external libs)
(function initCertSlider(){
  const track = document.querySelector('.slider-track');
  const prev = document.querySelector('.slider-prev');
  const next = document.querySelector('.slider-next');
  if(!track) return;
  const slides = Array.from(track.children);
  const gap = 12;
  let idx = 0;
  function update(){
    const slideW = slides[0].getBoundingClientRect().width + gap;
    track.style.transform = `translateX(-${idx * slideW}px)`;
  }
  window.addEventListener('resize', update);
  if(prev) prev.addEventListener('click', ()=>{ idx = Math.max(0, idx-1); update(); });
  if(next) next.addEventListener('click', ()=>{ idx = Math.min(slides.length-1, idx+1); update(); });
  // keyboard
  document.addEventListener('keydown', (e)=>{ if(e.key==='ArrowLeft') { idx = Math.max(0, idx-1); update(); } else if(e.key==='ArrowRight') { idx = Math.min(slides.length-1, idx+1); update(); } });
  // init
  setTimeout(update, 120);
})();

// Initialize YouTube thumbnails: prefer local assets/yt-<ID>.jpg, else try maxresdefault then hqdefault
(function initYouTubeThumbnails(){
  const cards = Array.from(document.querySelectorAll('.video-card'));
  if(!cards.length) return;

  function extractId(url){
    if(!url) return null;
    try{
      const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if(m && m[1]) return m[1];
      const u = new URL(url);
      if(u.searchParams.has('v')) return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      for(let i=parts.length-1;i>=0;i--){ if(parts[i].length===11) return parts[i]; }
    }catch(e){}
    return null;
  }

  cards.forEach(card=>{
    const img = card.querySelector('img.cert-thumb');
    const url = card.getAttribute('href');
    const id = extractId(url);
    if(!img || !id) return;

    // check local asset first
    const local = `/assets/yt-${id}.jpg`;
    const maxres = `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
    const hq = `https://img.youtube.com/vi/${id}/hqdefault.jpg`;

    function testAndSet(src, onSuccess, onFail){
      const tester = new Image();
      tester.onload = ()=> onSuccess(src);
      tester.onerror = ()=> onFail && onFail();
      tester.src = src;
    }

    // Try local file
    testAndSet(local, (s)=>{ img.src = s; }, ()=>{
      // try maxres then fallback to hq
      testAndSet(maxres, (s2)=>{ img.src = s2; }, ()=>{ img.src = hq; });
    });
  });

})();

// Mouse glow follows cursor
const mouseGlow = document.getElementById('mouse-glow');
if(mouseGlow){
  document.addEventListener('mousemove', (e)=>{
    mouseGlow.style.left = e.clientX + 'px'; mouseGlow.style.top = e.clientY + 'px'; mouseGlow.style.opacity = 1;
  });
  document.addEventListener('mouseleave', ()=>{ mouseGlow.style.opacity = 0; });
}

// Expand lightbox targets: open images from masonry, cert slides, and doc cards
const lb = document.getElementById('lightbox');
const lbImg2 = document.getElementById('lightbox-img');
function openLB(src){ if(lb && lbImg2){ lbImg2.src = src; lb.setAttribute('aria-hidden','false'); } }
document.querySelectorAll('.masonry-item, .cert-slide img, .doc-card, .cert-card').forEach(el=>{
  el.addEventListener('click', (e)=>{
    e.preventDefault();
    let src = '';
    if(el.tagName === 'A') src = el.getAttribute('href');
    else if(el.tagName === 'IMG') src = el.src;
    else {
      const img = el.querySelector('img'); if(img) src = img.src;
    }
    if(src) openLB(src);
  });
});

// Mobile nav toggle
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav-toggle');
if(nav && navToggle){
  navToggle.addEventListener('click', ()=>{
    const open = nav.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
}

// WebP swap: if a .webp variant exists, switch to it for better performance
(function enableWebPSwap(){
  const imgs = Array.from(document.querySelectorAll('img'));
  imgs.forEach(img => {
    // skip SVGs and data URLs
    if(!img.src || img.src.startsWith('data:') || img.src.endsWith('.svg')) return;
    // prefer to keep hero/profile eager
    const src = img.getAttribute('src');
    if(!src) return;
    const webpSrc = src.replace(/\.(jpe?g|png)$/i, '.webp');
    if(webpSrc === src) return;
    // attempt to load webp silently
    const tester = new Image();
    tester.onload = function(){
      try{ img.src = webpSrc; }catch(e){}
    };
    tester.onerror = function(){};
    tester.src = webpSrc;
  });
})();

// Ensure all images use decoding and lazy attributes by default where appropriate
document.querySelectorAll('img').forEach(img => {
  if(!img.hasAttribute('decoding')) img.setAttribute('decoding','async');
  if(!img.hasAttribute('loading')){
    // keep hero profile eager
    if(img.classList.contains('profile-photo')) img.setAttribute('loading','eager');
    else img.setAttribute('loading','lazy');
  }
});

// Populate YouTube video cards using local `video_descriptions.json` only (manual-first, no external fetches).
(async function populateYouTubeCards(){
  const cards = Array.from(document.querySelectorAll('.video-card'));
  if(!cards.length) return;

  async function loadLocalMapping(){
    try{
      const r = await fetch('/video_descriptions.json', {cache:'no-store'});
      if(r.ok) return await r.json();
    }catch(e){}
    return {};
  }

  function extractYouTubeID(url){
    if(!url) return null;
    try{
      const m = url.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|v\/|live\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
      if(m && m[1]) return m[1];
      const u = new URL(url);
      if(u.searchParams.has('v')) return u.searchParams.get('v');
      const parts = u.pathname.split('/').filter(Boolean);
      for(let i=parts.length-1;i>=0;i--){ if(parts[i].length===11) return parts[i]; }
    }catch(e){}
    return null;
  }

  const localMap = await loadLocalMapping();

  cards.forEach(card=>{
    const url = card.getAttribute('href');
    const img = card.querySelector('img');
    const titleEl = card.querySelector('.video-title');
    const descEl = card.querySelector('.video-desc');
    if(!titleEl || !descEl) return;

    const id = extractYouTubeID(url);
    const entry = id && localMap && localMap[id] ? localMap[id] : null;

    if(entry && entry.title && entry.title.trim()) titleEl.textContent = entry.title;
    else titleEl.textContent = img?.alt || 'Video';

    if(entry && entry.description && entry.description.trim()) descEl.textContent = entry.description;
    else descEl.textContent = '';
  });

})();


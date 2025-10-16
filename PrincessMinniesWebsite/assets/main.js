const $ = (sel, root=document) => root.querySelector(sel);

/* Google Drive helpers */
const getDriveId = (url) => {
  if (!url) return null;
  const m = url.match(/drive\.google\.com\/file\/d\/([^/]+)/) || url.match(/[?&]id=([^&]+)/);
  return m ? m[1] : null;
};
const driveImageURL = (url) => {
  const id = getDriveId(url);
  return id ? `https://drive.google.com/uc?export=view&id=${id}` : url;
};
const driveVideoURL = (url) => {
  const id = getDriveId(url);
  return id ? `https://drive.google.com/uc?export=download&id=${id}` : url;
};
const drivePreviewIframe = (id, opts={}) => {
  const s = `width:100%;max-width:${opts.maxWidth||'980px'};max-height:${opts.maxHeight||'70vh'};height:${opts.height||'60vh'};border:0;border-radius:16px;box-shadow:var(--shadow);background:#fff`;
  return `<iframe src="https://drive.google.com/file/d/${id}/preview" allow="autoplay" style="${s}"></iframe>`;
};

function buildTestimonials(items){
  const wrap = document.getElementById('slides');
  wrap.innerHTML = '';
  (items || []).forEach(t => {
    const slide = document.createElement('div');
    slide.className = 'slide';

    const id = getDriveId(t.photo);
    const img = document.createElement('img');
    img.className = 'testi-photo';
    img.alt = 'Photo';
    img.src = driveImageURL(t.photo);

    img.onerror = () => {
      if (id) slide.innerHTML = drivePreviewIframe(id);
      else slide.innerHTML = `<div style="width:100%;max-width:980px;height:60vh;border:1px dashed #f2a7d0;border-radius:16px;background:#fff"></div>`;
    };

    slide.appendChild(img);
    wrap.appendChild(slide);
  });

  if (!wrap.children.length) {
    wrap.innerHTML = `<div class="slide"><div style="width:100%;max-width:980px;height:40vh;border:1px dashed #f2a7d0;border-radius:16px;background:#fff;display:grid;place-items:center;color:#b24b8e;">Add testimonial photos in data</div></div>`;
  }
}

function pickLinksFor(title, links, logos){
  title = (title || "").toLowerCase();
  const out = [];
  const push = (key, label)=>{
    if(!links[key]) return;
    out.push({ href: links[key], title: label, img: logos[key] || "" });
  };
  if (title.includes("all things worn") || title.includes("atw")) push("atw","All Things Worn");
  if (title.includes("discord"))  push("discord","Discord");
  if (title.includes("twitch"))   push("twitch","Twitch");
  if (title.includes("clips4sale") || title.includes("clip")) push("clips","Clips4Sale");
  if (title.includes("chatbot") || title.includes("ai")) push("bot","AI Chatbot");
  if (title.includes("merch"))   push("merch","Merch");
  return out;
}

function populate(data){
  $('#brand-name').textContent = `Celebrating ${data.herName || 'Her'}`;
  $('#hero-title').innerHTML = `Celebrating <span style="color:#b24b8e">${data.herName || 'Her Name'}</span>`;
  $('#footer-name').textContent = data.herName || 'Her';
  $('#hero-lead').textContent = data.tagline || '';

  // portrait
  (function setPortrait(){
    const target = document.getElementById('hero-portrait');
    if (data.portraitDrive) {
      const id = getDriveId(data.portraitDrive);
      const img = document.createElement('img');
      img.alt = 'Her portrait';
      img.src = driveImageURL(data.portraitDrive);
      img.onerror = () => { if (id) target.innerHTML = drivePreviewIframe(id, {maxWidth:'100%', maxHeight:'100%', height:'100%'}); };
      target.innerHTML = '';
      target.appendChild(img);
    }
  })();

  // journey
  const tl = $('#timeline');
  tl.innerHTML = '';
  (data.journey || []).forEach(j=>{
    const item = document.createElement('div');
    item.className = 't-item';

    const title = document.createElement('div');
    title.className = 't-title';
    title.textContent = `${j.year} — ${j.title}`;

    const meta = document.createElement('div');
    meta.className = 't-meta';
    meta.textContent = j.desc || '';

    const links = pickLinksFor(j.title, data.links || {}, data.linkLogos || {});
    const linkWrap = document.createElement('div');
    linkWrap.className = 't-links';
    links.forEach(l=>{
      const a = document.createElement('a');
      a.className = 't-link';
      a.href = l.href; a.target = '_blank'; a.rel = 'noopener'; a.title = l.title;

      if (typeof l.img === 'string' && l.img.trim()){
        const img = document.createElement('img');
        img.alt = l.title; img.src = l.img;
        img.loading = 'lazy'; img.decoding = 'async'; img.referrerPolicy = 'no-referrer';
        a.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.textContent = (l.title && l.title[0]) ? l.title[0].toUpperCase() : '•';
        a.appendChild(span);
      }

      linkWrap.appendChild(a);
    });

    item.appendChild(title);
    item.appendChild(meta);
    if (links.length) item.appendChild(linkWrap);
    tl.appendChild(item);
  });

  // achievements
  const ag = $('#achievements-grid');
  ag.innerHTML = (data.achievements||[]).map(a=>`
    <div class="card"><div style="font-weight:800;margin-top:.2rem">${a.title}</div><p>${a.desc||''}</p></div>
  `).join('') || '<p class="sub">No achievements yet.</p>';

  // testimonials
  buildTestimonials(data.testimonials);

  // values
  const vals = $('#values-grid');
  vals.innerHTML = (data.values||[]).map(v=>`
    <div class="value"><h3>${v.title}</h3><p>${v.desc||''}</p></div>
  `).join('') || '<p class="sub">No values added yet.</p>';

  // gift
  document.getElementById('gift-title').textContent = data.gift?.title || 'Click to reveal your Birthday Card';
  document.getElementById('gift-text').textContent  = data.gift?.text  || '';
  document.getElementById('year').textContent = new Date().getFullYear();

  // link button (Linktree)
  const alt = data.linkHubAlt || 'https://linktr.ee/PrincessMinnie';
  const btn = document.getElementById('hubBtnAlt');
  if (btn){ btn.href = alt; btn.textContent = 'Open Linktree ✨'; }
}

function confettiBurst(){
  const c = document.getElementById('confetti'), ctx = c.getContext('2d');
  c.width = c.offsetWidth; c.height = c.offsetHeight;
  const palette = ['#ff9ed8','#ffbde6','#e9c6ff','#ffd6ec'];
  const pieces = Array.from({length: 160}, () => ({
    x: Math.random()*c.width, y: -20 - Math.random()*60,
    r: 2 + Math.random()*3, vx: -1 + Math.random()*2,
    vy: 2 + Math.random()*2.5, a: Math.random()*Math.PI,
    color: palette[Math.floor(Math.random()*palette.length)]
  }));
  let t = 0;
  (function step(){
    t+=1; ctx.clearRect(0,0,c.width,c.height);
    for(const p of pieces){
      p.x += p.vx; p.y += p.vy; p.a += 0.05;
      ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.a);
      ctx.fillStyle = p.color; ctx.fillRect(-p.r,-p.r, p.r*2, p.r*2); ctx.restore();
    }
    if (t<180) requestAnimationFrame(step);
  })();
}
let idx = 0;
function setSlide(i){
  const slides = document.getElementById('slides');
  const n = slides.children.length || 1;
  idx = (i+n)%n;
  slides.style.transform = `translateX(${-idx*100}%)`;
}

function placeBagsStatic({
  images = [],    // array of local paths
  count = 18,     // total bags on screen
  minSize = 80,   // px
  maxSize = 180,  // px
  minOpacity = 0.12,
  maxOpacity = 0.24,
  margin = 6      // vw: keep away from edges a bit
} = {}){
  const layer = document.getElementById('bagLayer');
  if (!layer || !images.length) return;

  // clear previous (in case of hot reload)
  layer.innerHTML = '';

  const rand = (a,b)=> a + Math.random()*(b-a);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  for (let i=0;i<count;i++){
    const d = document.createElement('div');
    d.className = 'bag-static';

    const size = rand(minSize, maxSize);
    const topVh  = rand(-5, 95);             // allow slight bleed
    const leftVw = rand(margin, 100 - margin);

    d.style.setProperty('--img', `url("${pick(images)}")`);
    d.style.width = `${size}px`;
    d.style.top  = `${topVh}vh`;
    d.style.left = `calc(${leftVw}vw - ${size/2}px)`;
    d.style.opacity = '1';

    // tiny rotation variety
    d.style.transform = `rotate(${rand(-10, 10)}deg)`;

    layer.appendChild(d);
  }
}


window.addEventListener('DOMContentLoaded', async ()=>{
  const res = await fetch('assets/data/site-data.json', { cache: 'no-cache' });
  const data = await res.json();
  populate(data);
  
  // Kick off the Google-style confetti once on page load
//if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  // small delay so content paints, then celebrate 🎉
  //setTimeout(confettiOnLoad, 200);
//}

  // Respect reduced motion
  // One check, three effects
const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReduced){
  // 1) Confetti (slight delay so content paints)
  setTimeout(confettiOnLoad, 200);

  // 2) Balloons
  setTimeout(() => launchBalloons({
    count: 40,
    minDelay: 0,
    maxDelay: 1100,
    minRise: 8000,
    maxRise: 12000
  }), 120);

  // 3) Floating designer bags (replace with real image URLs)
  placeBagsStatic({
  images: [
    "assets/img/bag1.png",
    "assets/img/bag2.png",
    "assets/img/bag3.png",
    "assets/img/bag4.png"
  ],
  count: 22,        // how dense
  minSize: 90, maxSize: 180,
  minOpacity: 0.12, maxOpacity: 0.22
});

}



  setSlide(0);
  document.getElementById('prev')?.addEventListener('click', ()=>setSlide(idx-1));
  document.getElementById('next')?.addEventListener('click', ()=>setSlide(idx+1));

  document.getElementById('reveal')?.addEventListener('click', ()=>{
    confettiBurst();
    document.getElementById('placeholder').hidden = true;
    document.getElementById('surprise').hidden = false;

    const wrap = document.getElementById('video-wrap');
    if (!wrap || wrap.querySelector('video,iframe')) return;

    const url = data?.gift?.videoUrl || '';
    const id  = getDriveId(url);

    const v = document.createElement('video');
    v.setAttribute('playsinline',''); v.setAttribute('controls',''); v.setAttribute('autoplay','');
    v.src = driveVideoURL(url);
    v.style.width = '100%'; v.style.maxHeight = '420px';
    v.style.borderRadius = '14px'; v.style.border = '1px solid rgba(210,120,180,.25)'; v.style.boxShadow = 'var(--shadow)';

    let swapped = false;
    const swapToIframe = () => { if (swapped || !id) return; swapped = true; wrap.innerHTML = drivePreviewIframe(id, {maxHeight:'420px', height:'360px'}); };

    v.onerror = swapToIframe;
    v.onstalled = swapToIframe;

    wrap.appendChild(v);
    v.play().catch(swapToIframe);
  });
});


// ===== Google-style confetti on page load =====
function confettiOnLoad(){
  const c = document.getElementById('confettiPage');
  if (!c) return;
  const ctx = c.getContext('2d');

  // Resize to viewport
  const resize = () => { c.width = window.innerWidth; c.height = window.innerHeight; };
  resize();
  window.addEventListener('resize', resize);

  // Google-ish palette
  const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC'];

  // Create pieces
  const PIECES = 400;              // how many
  const GRAV = 0.00005;               // gravity
  const DRAG = 0.998;              // air resistance
  const WIND = () => (Math.random() - 0.5) * 0.04;  // subtle horizontal drift
  const rand = (min,max)=>min+Math.random()*(max-min);

  const pieces = Array.from({length: PIECES}, () => ({
    // start slightly above the viewport, random X
    x: Math.random()*c.width,
    y: rand(-60,-10),
    // random velocity (initial upward kick)
    vx: rand(-1.2, 1.2),
    vy: rand(1.5, 3.2),
    // size + rotation
    w: rand(6, 10),
    h: rand(10, 18),
    a: Math.random() * Math.PI,
    spin: rand(-0.35, 0.35),
    // each piece is a rect (80%) or circle (20%)
    shape: Math.random() < 0.8 ? 'rect' : 'circle',
    color: colors[Math.floor(Math.random()*colors.length)],
    life: 1   // for fade-out
  }));

  let frames = 0, MAX_FRAMES = 600;  // ~4s at 60fps

  (function frame(){
    frames++;
    ctx.clearRect(0,0,c.width,c.height);

    for (const p of pieces){
      // physics
      p.vx += WIND();
      p.vy += GRAV;
      p.vx *= DRAG;
      p.vy *= DRAG;
      p.x  += p.vx;
      p.y  += p.vy;
      p.a  += p.spin;

      // fade near the end
      if (frames > MAX_FRAMES - 40) p.life -= 0.025;

      // draw
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.color;

      if (p.shape === 'rect'){
        ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.w*0.6, 0, Math.PI*2);
        ctx.fill();
      }
      ctx.restore();
    }

    // stop after duration
    if (frames < MAX_FRAMES){
      requestAnimationFrame(frame);
    } else {
      ctx.clearRect(0,0,c.width,c.height);
      window.removeEventListener('resize', resize);
      c.remove(); // remove canvas after confetti ends
    }
  })();
}


function launchBalloons({count=14, minDelay=0, maxDelay=600, minRise=6000, maxRise=9000} = {}){
  const layer = document.getElementById('balloonLayer');
  if (!layer) return;

  const colors = ['#4285F4', '#DB4437', '#F4B400', '#0F9D58', '#AB47BC'];
  const rand = (a,b)=> a + Math.random()*(b-a);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  const makeBalloonSVG = (fill='#DB4437', shine='rgba(255,255,255,.35)') => {
    const ns = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(ns, 'svg');
    svg.setAttribute('viewBox','0 0 60 100'); svg.setAttribute('width','100%'); svg.setAttribute('height','100%');

    const body = document.createElementNS(ns,'ellipse');
    body.setAttribute('cx','30'); body.setAttribute('cy','40'); body.setAttribute('rx','22'); body.setAttribute('ry','30');
    body.setAttribute('fill', fill); svg.appendChild(body);

    const knot = document.createElementNS(ns,'polygon');
    knot.setAttribute('points','26,65 34,65 30,72'); knot.setAttribute('fill', fill); svg.appendChild(knot);

    const str = document.createElementNS(ns,'path');
    str.setAttribute('d','M30,72 C28,84 34,92 30,100');
    str.setAttribute('stroke','#8a5d7a'); str.setAttribute('stroke-width','1.8'); str.setAttribute('fill','none'); svg.appendChild(str);

    const glint = document.createElementNS(ns,'ellipse');
    glint.setAttribute('cx','22'); glint.setAttribute('cy','32'); glint.setAttribute('rx','6'); glint.setAttribute('ry','10');
    glint.setAttribute('fill', shine); svg.appendChild(glint);

    return svg;
  };

  for (let i=0;i<count;i++){
    const outer = document.createElement('div');
    outer.className = 'balloon';

    const inner = document.createElement('div');
    inner.className = 'wiggle';

    // Randomize lane, delays and durations
    const leftVW = rand(0, 100);                  // 0..100 vw
    const delay  = rand(minDelay, maxDelay);      // ms
    const rise   = rand(minRise, maxRise);        // ms
    const swayDur= `${rand(3200, 5200)}ms`;

    outer.style.left = `calc(${leftVW}vw - 3rem)`;
    outer.style.setProperty('--rise', `${rise}ms`);
    outer.style.animationDelay = `${delay}ms`;

    inner.style.setProperty('--swayDur', swayDur);

    inner.appendChild(makeBalloonSVG(pick(colors)));
    outer.appendChild(inner);
    layer.appendChild(outer);

    // Auto-remove after flight
    const total = delay + rise + 300;
    setTimeout(()=> outer.remove(), total);
  }

  // Cleanup if nothing left
  const cleanupAfter = (maxDelay + maxRise + 1000);
  setTimeout(()=> { if (layer && layer.childElementCount === 0) layer.remove(); }, cleanupAfter);
}



function sprinkleBags({
  images = [],         // array of image URLs (transparent PNG/WebP)
  count = 24,          // how many on screen
  minSize = 90,        // px
  maxSize = 180,       // px
  minRise = 9000,      // ms (faster = smaller)
  maxRise = 16000,     // ms
  minDelay = 0,        // ms
  maxDelay = 4500,     // ms
  minOpacity = 0.12,
  maxOpacity = 0.22
} = {}){
  const layer = document.getElementById('bagLayer');
  if (!layer || !images.length) return;

  const rand = (a,b)=> a + Math.random()*(b-a);
  const pick = arr => arr[Math.floor(Math.random()*arr.length)];

  // create N floating bags
  for (let i=0;i<count;i++){
    const outer = document.createElement('div');
    outer.className = 'bag';

    const inner = document.createElement('div');
    inner.className = 'wiggle';

    // choose an image + randomize props
    const url   = pick(images);
    const size  = rand(minSize, maxSize);
    const left  = rand(-5, 100);         // vw
    const delay = rand(minDelay, maxDelay);
    const rise  = rand(minRise, maxRise);
    const sway  = `${rand(2600, 4600)}ms`;
    const op    = rand(minOpacity, maxOpacity);

    outer.style.left = `calc(${left}vw - ${size/2}px)`;
    outer.style.width = `${size}px`;
    outer.style.setProperty('--rise', `${rise}ms`);
    outer.style.animationDelay = `${delay}ms`;
    outer.style.opacity = op;

    inner.style.setProperty('--img', `url("${url}")`);
    inner.style.setProperty('--sway', sway);

    outer.appendChild(inner);
    layer.appendChild(outer);

    // auto-remove to keep DOM light
    const total = delay + rise + 500;
    setTimeout(()=> outer.remove(), total);
  }

  // keep sprinkling occasionally (optional: comment out to do one wave only)
  setTimeout(()=> sprinkleBags({images, count: Math.round(count*0.6), minDelay:0, maxDelay:3000, minRise, maxRise, minSize, maxSize, minOpacity, maxOpacity}), maxRise*0.9);
}


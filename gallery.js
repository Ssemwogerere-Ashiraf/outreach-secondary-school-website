// Mobile nav toggle
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.querySelector('.nav-toggle');
  const navUl  = document.querySelector('nav ul');
  if(toggle && navUl){
    toggle.addEventListener('click', () => navUl.classList.toggle('open'));
  }
}
)


// gallery.js
document.addEventListener('DOMContentLoaded', () => {
  const DATA_PATH = '/data/gallery.json'; // adjust if needed
  const grid = document.getElementById('galleryGrid');
  const filter = document.getElementById('galleryFilter');
  const search = document.getElementById('gallerySearch');
  const count = document.getElementById('galleryCount');
  const pager = document.getElementById('pager');

  // Lightbox elements
  const lb = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbCaption = document.getElementById('lbCaption');
  const lbClose = document.getElementById('lbClose');
  const lbPrev = document.getElementById('lbPrev');
  const lbNext = document.getElementById('lbNext');

  let items = [];
  let filtered = [];
  // Pagination settings
  const PAGE_SIZE = 12;
  let currentPage = 1;

  function formatCount(n) { return `${n} photo${n===1?'':'s'}`; }

  function renderGrid(page=1) {
    grid.innerHTML = '';
    currentPage = page;
    const start = (page-1)*PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);
    pageItems.forEach((it, idx) => {
      const el = document.createElement('a');
      el.className = 'gallery-item';
      el.href = it.image;
      el.dataset.index = start + idx;
      el.innerHTML = `<img class="gallery-thumb" loading="lazy" src="${it.thumb || it.image}" alt="${escapeHtml(it.alt || '')}">
        <div class="gallery-meta"><span class="title">${it.title || ''}</span><span class="small-note">${it.caption || ''}</span></div>`;
      el.addEventListener('click', openLightbox);
      grid.appendChild(el);
    });
    count.textContent = formatCount(filtered.length);
    renderPager();
  }

  function renderPager(){
    pager.innerHTML = '';
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
    // previous
    const prev = document.createElement('button');
    prev.className = 'btn alt';
    prev.textContent = 'Prev';
    prev.disabled = currentPage <= 1;
    prev.addEventListener('click', () => renderGrid(currentPage - 1));
    pager.appendChild(prev);

    // page numbers (limited)
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    for (let p = start; p <= end; p++){
      const b = document.createElement('button');
      b.className = p === currentPage ? 'btn' : 'btn alt';
      b.textContent = p;
      b.addEventListener('click', () => renderGrid(p));
      pager.appendChild(b);
    }

    const next = document.createElement('button');
    next.className = 'btn alt';
    next.textContent = 'Next';
    next.disabled = currentPage >= totalPages;
    next.addEventListener('click', () => renderGrid(currentPage + 1));
    pager.appendChild(next);
  }

  function openLightbox(e){
    e.preventDefault();
    const index = Number(e.currentTarget.dataset.index);
    showLightbox(index);
  }

  function showLightbox(index){
    const it = filtered[index];
    if(!it) return;
    lbImage.src = it.image;
    lbImage.alt = it.alt || it.title || 'Gallery image';
    lbCaption.innerHTML = `<strong style="color:#fff">${escapeHtml(it.title || '')}</strong><div style="color:#ddd">${it.caption || ''}</div>`;
    lb.dataset.index = index;
    lb.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    focusedLightbox();
  }

  function closeLightbox(){
    lb.setAttribute('aria-hidden','true');
    lbImage.src = '';
    document.body.style.overflow = '';
  }

  function prevImage(){
    let idx = Number(lb.dataset.index) - 1;
    if (idx < 0) idx = filtered.length - 1;
    showLightbox(idx);
  }

  function nextImage(){
    let idx = Number(lb.dataset.index) + 1;
    if (idx >= filtered.length) idx = 0;
    showLightbox(idx);
  }

  // keyboard controls
  document.addEventListener('keydown', (e) => {
    if (lb.getAttribute('aria-hidden') === 'false'){
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'ArrowRight') nextImage();
    }
  });

  lbClose.addEventListener('click', closeLightbox);
  lbPrev.addEventListener('click', prevImage);
  lbNext.addEventListener('click', nextImage);
  lb.addEventListener('click', (e) => { if(e.target === lb) closeLightbox(); });

  function applyFilters(){
    const f = filter.value;
    const q = (search.value || '').trim().toLowerCase();
    filtered = items.filter(it => {
      const typeOk = f === 'all' ? true : (it.category === f);
      const textOk = q === '' ? true : ((it.title||'').toLowerCase().includes(q) || (it.caption||'').toLowerCase().includes(q) || (it.tags||'').toLowerCase().includes(q));
      return typeOk && textOk;
    });
    renderGrid(1);
  }

  search.addEventListener('input', () => applyFilters());
  filter.addEventListener('change', () => applyFilters());

  async function loadData(){
    try {
      const res = await fetch(DATA_PATH);
      if(!res.ok) throw new Error('Failed to load gallery data');
      const json = await res.json();
      items = json.items || [];
      // normalize category names
      items.forEach(i => { i.category = i.category || 'uncategorized'; i.thumb = i.thumb || i.image; });
      filtered = items.slice();
      renderGrid(1);
    } catch (err){
      grid.innerHTML = '<div class="no-posts card">Could not load gallery.</div>';
      console.error(err);
    }
  }

  // small helper
  function escapeHtml(s){ return String(s || '').replace(/[&<>"']/g, (m) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]); }

  // lightbox focus trap (small)
  function focusedLightbox(){
    const focusable = lb.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusable.length) focusable[0].focus();
  }

  loadData();
});

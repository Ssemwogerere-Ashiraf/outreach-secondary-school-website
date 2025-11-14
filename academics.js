// gallery -> bootstrapped lightbox with keyboard and arrow support
document.addEventListener('DOMContentLoaded', () => {
  const items = Array.from(document.querySelectorAll('.gallery-item'));
  const modalEl = document.getElementById('lightboxModal');
  const modal = bootstrap.Modal && modalEl ? new bootstrap.Modal(modalEl, { keyboard: false }) : null;
  const img = document.getElementById('lightboxImage');
  const caption = document.getElementById('lightboxCaption');
  const nextBtn = document.getElementById('nextArrow');
  const prevBtn = document.getElementById('prevArrow');
  let index = 0;

  function openAt(i){
    const el = items[i];
    index = i;
    img.src = el.dataset.img;
    img.alt = el.dataset.caption || '';
    caption.textContent = el.dataset.caption || '';
    if (modal) modal.show();
    img.focus();
  }

  items.forEach((btn, i) => {
    btn.addEventListener('click', () => openAt(i));
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openAt(i); }
    });
  });

  function showNext(){ index = (index + 1) % items.length; openAt(index); }
  function showPrev(){ index = (index - 1 + items.length) % items.length; openAt(index); }

  if (nextBtn) nextBtn.addEventListener('click', (e) => { e.preventDefault(); showNext(); });
  if (prevBtn) prevBtn.addEventListener('click', (e) => { e.preventDefault(); showPrev(); });

  // keyboard support while modal open
  document.addEventListener('keydown', (e) => {
    if (!modalEl.classList.contains('show')) return;
    if (e.key === 'ArrowRight') { showNext(); }
    if (e.key === 'ArrowLeft') { showPrev(); }
    if (e.key === 'Escape') { if (modal) modal.hide(); }
  });

  // enable arrow buttons on touch by delegating focus
  [nextBtn, prevBtn].forEach(b => { if (b) b.setAttribute('tabindex','0'); });
});

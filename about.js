// Mobile nav open/close (keeps your original toggleMenu/closeMenu API)
const menuToggle = document.getElementById('menuToggle');
const navOverlay = document.getElementById('navOverlay');
const navClose = document.getElementById('navClose');

if (menuToggle && navOverlay) {
  menuToggle.addEventListener('click', () => {
    navOverlay.classList.remove('d-none');
    navOverlay.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
  });
}

if (navClose) {
  navClose.addEventListener('click', () => {
    navOverlay.classList.add('d-none');
    navOverlay.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  });
}

function closeMenu() {
  if (navOverlay) {
    navOverlay.classList.add('d-none');
    navOverlay.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }
}
window.closeMenu = closeMenu;

// Basic DOM helpers
const $ = sel => document.querySelector(sel);
const $$ = sel => Array.from(document.querySelectorAll(sel));

// Preloader hide
// preloader.js
document.addEventListener("DOMContentLoaded", function () {
  const preloader = document.getElementById("preloader");
  const loadingMessage = document.getElementById("loadingMessage");

  // 10 rotating patient messages
  const messages = [
    "Please hold on...",
    "Preparing your experience...",
    "Almost ready for you...",
    "Loading resources...",
    "Bringing things together...",
    "Just a moment more...",
    "Setting up your page...",
    "We're almost there...",
    "Thank you for waiting...",
    "Your patience means a lot..."
  ];

  let index = 0;
  const interval = setInterval(() => {
    loadingMessage.textContent = messages[index];
    index = (index + 1) % messages.length;
  }, 1500); // change every 1.5 seconds

  const loadingDuration = 4000; // total duration before fade-out

  window.addEventListener("load", function () {
    setTimeout(() => {
      if (preloader) {
        preloader.classList.add("fade-out");
        clearInterval(interval);
        setTimeout(() => preloader.style.display = "none", 800);
      }
    }, loadingDuration);
  });
});


// Mobile nav open/close
const menuToggle = $('#menuToggle');
const navOverlay = $('#navOverlay');
const navClose = $('#navClose');
if (menuToggle && navOverlay) {
  menuToggle.addEventListener('click', () => {
    navOverlay.classList.remove('d-none');
    navOverlay.setAttribute('aria-hidden', 'false');
    menuToggle.setAttribute('aria-expanded', 'true');
  });
}
if (navClose) navClose.addEventListener('click', () => {
  navOverlay.classList.add('d-none');
  navOverlay.setAttribute('aria-hidden', 'true');
  if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
});
function closeMenu() {
  if (navOverlay) {
    navOverlay.classList.add('d-none');
    navOverlay.setAttribute('aria-hidden', 'true');
    if (menuToggle) menuToggle.setAttribute('aria-expanded', 'false');
  }
}
window.closeMenu = closeMenu; // keep original API used by markup

// Back to top
const backBtn = $('#backToTop');
if (backBtn) {
  backBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// Simple countdown example (replace target date as needed)
(function setupCountdown(){
  const target = new Date('2025-11-12T08:00:00'); // example target
  const el = $('#countdown');
  if (!el) return;
  function update() {
    const now = new Date();
    const diff = Math.max(0, target - now);
    if (diff === 0) { el.textContent = 'Now open'; return; }
    const days = Math.floor(diff / (1000*60*60*24));
    const hrs = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
    const mins = Math.floor((diff % (1000*60*60)) / (1000*60));
    el.textContent = `${days}d ${hrs}h ${mins}m`;
  }
  update();
  setInterval(update, 60*1000);
})();

// Clock update (analog hands) and timezone city detection using Intl API
(function clockAndCity(){
  const hourHand = document.getElementById('hourHand');
  const minuteHand = document.getElementById('minuteHand');
  const secondHand = document.getElementById('secondHand');
  const cityName = document.getElementById('cityName');
  if (cityName) {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local time';
      cityName.textContent = tz;
    } catch (e) {
      cityName.textContent = 'Local time';
    }
  }

  function updateClock(){
    const now = new Date();
    const sec = now.getSeconds();
    const min = now.getMinutes() + sec/60;
    const hr = (now.getHours() % 12) + min/60;
    if (hourHand) hourHand.setAttribute('transform', `rotate(${hr*30})`);
    if (minuteHand) minuteHand.setAttribute('transform', `rotate(${min*6})`);
    if (secondHand) secondHand.setAttribute('transform', `rotate(${sec*6})`);
  }
  updateClock();
  setInterval(updateClock, 1000);
})();

// Tooltip for time-point: hover shows tooltip on desktop, tap toggles on touch
(function timePointTooltip(){
  const point = document.getElementById('timePoint');
  const tooltip = document.getElementById('timeTooltip');
  if (!point || !tooltip) return;

  function showTip() {
    tooltip.classList.add('show');
    tooltip.setAttribute('aria-hidden', 'false');
  }
  function hideTip() {
    tooltip.classList.remove('show');
    tooltip.setAttribute('aria-hidden', 'true');
  }

  // hover for devices that support it
  point.addEventListener('mouseenter', showTip);
  point.addEventListener('mouseleave', hideTip);

  // click/tap: toggle for touch
  point.addEventListener('click', (e) => {
    e.stopPropagation();
    if (tooltip.classList.contains('show')) hideTip();
    else showTip();
  });

  // hide tooltip when tapping elsewhere
  document.addEventListener('click', (e) => {
    if (tooltip.classList.contains('show') && !point.contains(e.target)) hideTip();
  });

  // Set tooltip text from data attribute
  const dateText = point.dataset.date;
  if (dateText) tooltip.textContent = dateText;
})();

// Optional: lightweight site search on-page
function searchSite(e) {
  e.preventDefault();
  const query = (document.getElementById('siteSearch') || {}).value || '';
  if (!query.trim()) { alert('Please enter a search query'); return; }
  const bodyText = document.body.innerText.toLowerCase();
  if (bodyText.includes(query.toLowerCase())) alert('✅ Match found on this page: "' + query + '"');
  else alert('❌ No match found for: "' + query + '"');
}
window.searchSite = searchSite;

// Adds a Back-to-top button and toggles visibility on scroll.
// Non-invasive: doesn't modify your existing HTML.
(function () {
  // Create button
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'back-to-top';
  btn.setAttribute('aria-label', 'Back to top');
  btn.innerHTML = '⬆';

  // Insert as last child of body
  document.body.appendChild(btn);

  // Show after user scrolls down this many pixels
  const showAfter = 250;
  const smoothScroll = (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toggle visibility on scroll
  function onScroll() {
    if (window.scrollY > showAfter) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  // Click behavior
  btn.addEventListener('click', smoothScroll);

  // Keyboard friendly: Enter or Space triggers
  btn.addEventListener('keydown', function (ev) {
    if (ev.key === 'Enter' || ev.key === ' ') {
      ev.preventDefault();
      smoothScroll(ev);
    }
  });

  // Show/hide on load and scroll
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('load', onScroll);
  // ensure button appears if page is loaded mid-scroll (deep links)
  setTimeout(onScroll, 200);
})();

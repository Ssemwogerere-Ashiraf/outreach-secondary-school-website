// preloader.js
document.addEventListener("DOMContentLoaded", function () {
  const preloader = document.getElementById("preloader");
  const loadingMessage = document.getElementById("loadingMessage");

  // 10 best encouraging words/phrases
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

  const loadingDuration = 10000; // total duration before fade-out

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

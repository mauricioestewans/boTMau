// Deezer Automation Script
(function() {
  console.log('🎶 Deezer automation script started');

  function preventPause() {
    const playButton = document.querySelector('[class*="player-control"][class*="play"]');
    if (playButton && !playButton.classList.contains('is-playing')) {
      playButton.click();
      console.log('▶️ Playback resumed');
    }
  }

  function acceptCookies() {
    const acceptBtn = document.querySelector('button[class*="cookie"][class*="accept"]');
    if (acceptBtn) {
      acceptBtn.click();
      console.log('🍪 Cookies accepted');
    }
  }

  function closeModals() {
    const modals = document.querySelectorAll('[class*="modal"], [class*="popup"]');
    modals.forEach(modal => {
      const closeBtn = modal.querySelector('[class*="close"], [aria-label*="Close"]');
      if (closeBtn) {
        closeBtn.click();
        console.log('✖️ Modal closed');
      }
    });
  }

  function simulateActivity() {
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    }));
  }

  // Main execution loop
  setInterval(() => {
    preventPause();
    acceptCookies();
    closeModals();
  }, 3000);

  // Simulate activity
  setInterval(() => {
    simulateActivity();
  }, Math.floor(Math.random() * 7000) + 5000);

  console.log('✅ Deezer automation initialized');
})();

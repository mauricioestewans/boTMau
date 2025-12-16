// Spotify Automation Script
(function() {
  console.log('🎵 Spotify automation script started');

  function preventPause() {
    const playButton = document.querySelector('[data-testid="control-button-playpause"]');
    if (playButton) {
      const isPaused = playButton.getAttribute('aria-label')?.includes('Play');
      if (isPaused) {
        playButton.click();
        console.log('▶️ Playback resumed');
      }
    }
  }

  function acceptCookies() {
    const acceptBtn = document.querySelector('button[id*="onetrust-accept"]');
    if (acceptBtn) {
      acceptBtn.click();
      console.log('🍪 Cookies accepted');
    }
  }

  function closeInactivityModal() {
    const modal = document.querySelector('[role="dialog"]');
    if (modal) {
      const continueBtn = modal.querySelector('button');
      if (continueBtn && continueBtn.textContent.includes('Continue')) {
        continueBtn.click();
        console.log('✅ Inactivity modal closed');
      }
    }
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
    closeInactivityModal();
  }, 3000);

  // Simulate activity
  setInterval(() => {
    simulateActivity();
  }, Math.floor(Math.random() * 7000) + 5000);

  console.log('✅ Spotify automation initialized');
})();

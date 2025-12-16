// YouTube Automation Script
(function() {
  console.log('🎬 YouTube automation script started');

  function skipAds() {
    const skipSelectors = [
      '.ytp-ad-skip-button',
      '.ytp-ad-skip-button-modern',
      '.ytp-skip-ad-button',
      'button.ytp-ad-skip-button'
    ];

    for (const selector of skipSelectors) {
      const skipButton = document.querySelector(selector);
      if (skipButton) {
        skipButton.click();
        console.log('✅ Ad skipped!');
        return true;
      }
    }
    return false;
  }

  function preventPause() {
    const video = document.querySelector('video');
    if (video && video.paused && !video.ended) {
      video.play();
      console.log('▶️ Video resumed');
    }

    const pauseOverlay = document.querySelector('.ytp-pause-overlay');
    if (pauseOverlay) {
      pauseOverlay.style.display = 'none';
    }
  }

  function unmute() {
    const video = document.querySelector('video');
    if (video && video.muted) {
      video.muted = false;
      video.volume = 0.3;
    }
  }

  function simulateActivity() {
    // Random mouse movement
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    }));

    // Random scroll
    const scrollAmount = Math.random() < 0.5 ? 50 : -50;
    window.scrollBy(0, scrollAmount);
  }

  function closeDialogs() {
    const dialogs = document.querySelectorAll('[role="dialog"]');
    dialogs.forEach(dialog => {
      const closeBtn = dialog.querySelector('button[aria-label*="Close"], button[aria-label*="Dismiss"]');
      if (closeBtn) {
        closeBtn.click();
        console.log('✖️ Dialog closed');
      }
    });
  }

  // Main execution loop
  setInterval(() => {
    skipAds();
    preventPause();
    unmute();
    closeDialogs();
  }, 2000);

  // Simulate activity every 5-10 seconds
  setInterval(() => {
    simulateActivity();
  }, Math.floor(Math.random() * 5000) + 5000);

  console.log('✅ YouTube automation initialized');
})();

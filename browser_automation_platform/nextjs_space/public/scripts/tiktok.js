// TikTok Automation Script
(function() {
  console.log('🎬 TikTok automation script started');

  function autoScroll() {
    const videos = document.querySelectorAll('video');
    if (videos.length > 0) {
      const randomVideo = videos[Math.floor(Math.random() * videos.length)];
      randomVideo.scrollIntoView({ behavior: 'smooth' });
      console.log('📄 Scrolled to video');
    }
  }

  function preventPause() {
    const videos = document.querySelectorAll('video');
    videos.forEach(video => {
      if (video.paused && !video.ended) {
        video.play();
        console.log('▶️ Video resumed');
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

  function closeModals() {
    const modals = document.querySelectorAll('[role="dialog"]');
    modals.forEach(modal => {
      const closeBtn = modal.querySelector('[aria-label*="Close"]');
      if (closeBtn) {
        closeBtn.click();
        console.log('✖️ Modal closed');
      }
    });
  }

  // Main execution loop
  setInterval(() => {
    preventPause();
    closeModals();
  }, 3000);

  // Auto scroll every 15-25 seconds
  setInterval(() => {
    autoScroll();
  }, Math.floor(Math.random() * 10000) + 15000);

  // Simulate activity
  setInterval(() => {
    simulateActivity();
  }, Math.floor(Math.random() * 7000) + 5000);

  console.log('✅ TikTok automation initialized');
})();

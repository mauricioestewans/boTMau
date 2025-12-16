// Universal Automation Script (runs on all platforms)
(function() {
  console.log('🌐 Universal automation script started');

  function closePopups() {
    const selectors = [
      '[class*="popup"]',
      '[class*="modal"]',
      '[class*="overlay"]',
      '[role="dialog"]',
      '[class*="banner"]'
    ];

    selectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach(element => {
        const closeBtn = element.querySelector(
          'button[aria-label*="Close"], button[aria-label*="Dismiss"], [class*="close"]'
        );
        if (closeBtn) {
          closeBtn.click();
        }
      });
    });
  }

  function simulateHumanBehavior() {
    // Random mouse movement
    const x = Math.floor(Math.random() * window.innerWidth);
    const y = Math.floor(Math.random() * window.innerHeight);
    document.dispatchEvent(new MouseEvent('mousemove', {
      bubbles: true,
      cancelable: true,
      clientX: x,
      clientY: y
    }));

    // Occasional scroll
    if (Math.random() < 0.3) {
      window.scrollBy(0, Math.floor(Math.random() * 200) - 100);
    }
  }

  // Run every 5 seconds
  setInterval(() => {
    closePopups();
  }, 5000);

  // Simulate human behavior every 8-15 seconds
  setInterval(() => {
    simulateHumanBehavior();
  }, Math.floor(Math.random() * 7000) + 8000);

  console.log('✅ Universal automation initialized');
})();

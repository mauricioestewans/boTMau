export const ANTI_DETECT_SCRIPT = `
// Remove webdriver property
Object.defineProperty(navigator, 'webdriver', {
  get: () => undefined
});

// Chrome app property
window.chrome = {
  runtime: {},
};

// Permissions
const originalQuery = window.navigator.permissions.query;
window.navigator.permissions.query = (parameters) => (
  parameters.name === 'notifications' ?
    Promise.resolve({ state: Notification.permission }) :
    originalQuery(parameters)
);

// Plugins
Object.defineProperty(navigator, 'plugins', {
  get: () => [1, 2, 3, 4, 5]
});

// Languages
Object.defineProperty(navigator, 'languages', {
  get: () => ['en-US', 'en']
});

// WebGL Vendor
const getParameter = WebGLRenderingContext.prototype.getParameter;
WebGLRenderingContext.prototype.getParameter = function(parameter) {
  if (parameter === 37445) {
    return 'Intel Inc.';
  }
  if (parameter === 37446) {
    return 'Intel Iris OpenGL Engine';
  }
  return getParameter.apply(this, arguments);
};

// Canvas noise
const toDataURL = HTMLCanvasElement.prototype.toDataURL;
HTMLCanvasElement.prototype.toDataURL = function() {
  const context = this.getContext('2d');
  if (context) {
    const imageData = context.getImageData(0, 0, this.width, this.height);
    for (let i = 0; i < imageData.data.length; i += 4) {
      imageData.data[i] += Math.floor(Math.random() * 10) - 5;
    }
    context.putImageData(imageData, 0, 0);
  }
  return toDataURL.apply(this, arguments);
};

console.log('✅ Anti-detect script loaded');
`;

export function getAntiDetectArgs(): string[] {
  return [
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-web-security',
    '--disable-features=IsolateOrigins,site-per-process',
    '--allow-running-insecure-content',
    '--disable-background-timer-throttling',
    '--disable-backgrounding-occluded-windows',
    '--disable-renderer-backgrounding',
  ];
}

export function getRandomViewportSize(): { width: number; height: number } {
  const viewports = [
    { width: 1920, height: 1080 },
    { width: 1366, height: 768 },
    { width: 1440, height: 900 },
    { width: 1536, height: 864 },
    { width: 1280, height: 720 },
  ];
  return viewports[Math.floor(Math.random() * viewports.length)];
}

export function getRandomTimezone(): string {
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Los_Angeles',
    'America/Denver',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
  ];
  return timezones[Math.floor(Math.random() * timezones.length)];
}

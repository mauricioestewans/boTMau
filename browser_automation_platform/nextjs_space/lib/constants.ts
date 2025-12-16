export const PLATFORM_URLS = {
  YOUTUBE: 'https://www.youtube.com',
  SPOTIFY: 'https://www.spotify.com',
  DEEZER: 'https://www.deezer.com',
  TIKTOK: 'https://www.tiktok.com',
  CUSTOM: '',
};

export const PROXY_SOURCES = [
  'https://api.proxyscrape.com/v2/?request=get&protocol=http&timeout=10000&country=all&ssl=all&anonymity=all',
  'https://www.proxy-list.download/api/v1/get?type=http',
  'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/master/http.txt',
  'https://raw.githubusercontent.com/ShiftyTR/Proxy-List/master/http.txt',
  'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
];

export const DEFAULT_BROWSER_CONFIG = {
  headless: false,
  windowSize: '1280x720',
  timeout: 30000,
};

export const AUTOMATION_INTERVAL = {
  MIN: 15,
  MAX: 30,
};

export const MAX_CONCURRENT_INSTANCES = 5;
export const PROXY_ROTATION_INTERVAL = 600000; // 10 minutes in ms

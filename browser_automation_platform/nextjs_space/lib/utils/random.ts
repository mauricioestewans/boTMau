export function randomDelay(min: number, max: number): Promise<void> {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay * 1000));
}

export function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

export function gaussianRandom(mean: number, stdev: number): number {
  const u = 1 - Math.random();
  const v = Math.random();
  const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

export function randomMouseMovement() {
  return {
    x: Math.floor(Math.random() * 1280),
    y: Math.floor(Math.random() * 720),
  };
}

export function randomScroll() {
  return Math.floor(Math.random() * 500) - 250;
}

export function createSeededRandom(seed: number) {
  let value = seed >>> 0;

  function next() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 0xffffffff;
  }

  return {
    next,
    int(min: number, max: number) {
      const low = Math.ceil(min);
      const high = Math.floor(max);
      return Math.floor(next() * (high - low + 1)) + low;
    },
    pick<T>(items: T[]) {
      if (items.length === 0) {
        throw new Error('Cannot pick from empty list.');
      }
      return items[Math.floor(next() * items.length)] as T;
    }
  };
}

export function isoMinutesAgo(minutes: number) {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

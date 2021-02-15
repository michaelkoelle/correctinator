export default function clamp(x, min, max) {
  return Math.min(Math.max(x, min), max);
}

export function histogram(data: number[], bins: number) {
  const h = new Array(bins).fill(0);
  data
    .map((v) => v * 100)
    .forEach((item) => {
      h[Math.floor(item / bins) - 1] += 1;
    });
  return h;
}

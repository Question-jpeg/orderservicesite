export const range = (startAt, size, step = 1) => {
  return [...Array(size).keys()].map((i) => startAt + i * step);
};

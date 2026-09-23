// Olive-vine pieces shared by the schedule timeline and the header garland, as SVG
// path data in real pixels. s = 1 grows to the right, -1 to the left; v = 1 points
// the leaf up, -1 down.
export const leaf = (x, y, s, v = 1) =>
  `M${x} ${y}q${8 * s} ${-10 * v} ${17 * s} ${-8 * v}q${-8 * s} ${9 * v} ${-17 * s} ${8 * v}z`;
export const rib = (x, y, s, v = 1) => `M${x} ${y}l${13 * s} ${-6 * v}`;
export const spiral = (x, y, s) => {
  const sw = s > 0 ? 1 : 0;
  return `M${x} ${y}l${4 * s} -2a4.5 4.5 0 0 ${sw} 0 9a3 3 0 0 ${sw} 0 -6a1.5 1.5 0 0 ${sw} 0 3`;
};

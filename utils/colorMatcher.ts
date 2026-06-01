import { BeadColor } from '@/types';

export const rgbToLab = (r: number, g: number, blue: number): { l: number; a: number; b: number } => {
  let rn = r / 255;
  let gn = g / 255;
  let bn = blue / 255;

  rn = rn > 0.04045 ? Math.pow((rn + 0.055) / 1.055, 2.4) : rn / 12.92;
  gn = gn > 0.04045 ? Math.pow((gn + 0.055) / 1.055, 2.4) : gn / 12.92;
  bn = bn > 0.04045 ? Math.pow((bn + 0.055) / 1.055, 2.4) : bn / 12.92;

  let x = rn * 0.4124 + gn * 0.3576 + bn * 0.1805;
  let y = rn * 0.2126 + gn * 0.7152 + bn * 0.0722;
  let z = rn * 0.0193 + gn * 0.1192 + bn * 0.9505;

  x /= 0.95047;
  y /= 1.00000;
  z /= 1.08883;

  x = x > 0.008856 ? Math.pow(x, 1 / 3) : (7.787 * x) + (16 / 116);
  y = y > 0.008856 ? Math.pow(y, 1 / 3) : (7.787 * y) + (16 / 116);
  z = z > 0.008856 ? Math.pow(z, 1 / 3) : (7.787 * z) + (16 / 116);

  const l = 116 * y - 16;
  const a = 500 * (x - y);
  const b = 200 * (y - z);

  return { l, a, b };
};

export const calculateDeltaE = (lab1: { l: number; a: number; b: number }, lab2: { l: number; a: number; b: number }): number => {
  const deltaL = lab1.l - lab2.l;
  const deltaA = lab1.a - lab2.a;
  const deltaB = lab1.b - lab2.b;
  return Math.sqrt(deltaL * deltaL + deltaA * deltaA + deltaB * deltaB);
};

export const findClosestColor = (rgb: { r: number; g: number; b: number }, beadColors: BeadColor[]): BeadColor => {
  const lab = rgbToLab(rgb.r, rgb.g, rgb.b);
  let closestColor = beadColors[0];
  let minDeltaE = Infinity;

  for (const color of beadColors) {
    const deltaE = calculateDeltaE(lab, color.lab);
    if (deltaE < minDeltaE) {
      minDeltaE = deltaE;
      closestColor = color;
    }
  }

  return closestColor;
};

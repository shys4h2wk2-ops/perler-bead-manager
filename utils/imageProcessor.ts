import { BeadColor, PatternItem } from '@/types';
import { findClosestColor } from './colorMatcher';

export const processImage = async (
  imageFile: File,
  gridSize: { rows: number; cols: number },
  beadColors: BeadColor[]
): Promise<PatternItem[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const colorCounts: Record<string, number> = {};
      const cellWidth = canvas.width / gridSize.cols;
      const cellHeight = canvas.height / gridSize.rows;

      for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          const x = Math.floor(col * cellWidth + cellWidth / 2);
          const y = Math.floor(row * cellHeight + cellHeight / 2);
          const pixel = ctx?.getImageData(x, y, 1, 1).data;

          if (pixel) {
            const rgb = { r: pixel[0], g: pixel[1], b: pixel[2] };
            const closestColor = findClosestColor(rgb, beadColors);
            colorCounts[closestColor.code] = (colorCounts[closestColor.code] || 0) + 1;
          }
        }
      }

      const items: PatternItem[] = Object.entries(colorCounts).map(([colorCode, quantity]) => ({
        colorCode,
        quantity,
      }));

      resolve(items);
    };

    img.src = URL.createObjectURL(imageFile);
  });
};

export const processImageArea = async (
  imageFile: File,
  area: { x: number; y: number; width: number; height: number },
  gridSize: { rows: number; cols: number },
  beadColors: BeadColor[]
): Promise<PatternItem[]> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);

      const colorCounts: Record<string, number> = {};
      const cellWidth = area.width / gridSize.cols;
      const cellHeight = area.height / gridSize.rows;

      for (let row = 0; row < gridSize.rows; row++) {
        for (let col = 0; col < gridSize.cols; col++) {
          const x = Math.floor(area.x + col * cellWidth + cellWidth / 2);
          const y = Math.floor(area.y + row * cellHeight + cellHeight / 2);
          
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const pixel = ctx?.getImageData(x, y, 1, 1).data;

            if (pixel) {
              const rgb = { r: pixel[0], g: pixel[1], b: pixel[2] };
              const closestColor = findClosestColor(rgb, beadColors);
              colorCounts[closestColor.code] = (colorCounts[closestColor.code] || 0) + 1;
            }
          }
        }
      }

      const items: PatternItem[] = Object.entries(colorCounts).map(([colorCode, quantity]) => ({
        colorCode,
        quantity,
      }));

      resolve(items);
    };

    img.src = URL.createObjectURL(imageFile);
  });
};

export interface BeadColor {
  code: string;
  name: string;
  hex: string;
  rgb: { r: number; g: number; b: number };
  lab: { l: number; a: number; b: number };
}

export interface InventoryItem {
  colorCode: string;
  quantity: number;
}

export type PatternStatus = 'unstarted' | 'in_progress' | 'completed';

export interface PatternItem {
  colorCode: string;
  quantity: number;
}

export interface Pattern {
  id: string;
  name: string;
  image: string;
  status: PatternStatus;
  items: PatternItem[];
  createdAt: number;
}

export interface ShortageItem {
  colorCode: string;
  required: number;
  inStock: number;
  shortage: number;
}

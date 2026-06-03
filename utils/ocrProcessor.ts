import { createWorker, Worker } from 'tesseract.js';
import { beadColors } from '@/data/beadColors';

const validColorCodes = new Set(beadColors.map(c => c.code));

// OCR纠错映射表 - 扩展版本
const ocrCorrections: Record<string, string> = {
  // I/l/Ⅰ 混淆
  'GI': 'G1', 'CI': 'C1', 'DI': 'D1', 'FI': 'F1', 'HI': 'H1',
  'AI': 'A1', 'BI': 'B1', 'EI': 'E1', 'MI': 'M1',
  'GⅠ': 'G1', 'CⅠ': 'C1', 'DⅠ': 'D1', 'FⅠ': 'F1', 'HⅠ': 'H1',
  'AⅠ': 'A1', 'BⅠ': 'B1', 'EⅠ': 'E1', 'MⅠ': 'M1',
  'Gⅰ': 'G1', 'Cⅰ': 'C1', 'Dⅰ': 'D1', 'Fⅰ': 'F1', 'Hⅰ': 'H1',
  'Aⅰ': 'A1', 'Bⅰ': 'B1', 'Eⅰ': 'E1', 'Mⅰ': 'M1',
  
  // 常见识别错误
  'GEN': 'F5', 'GH': 'C11', 'EN': 'C15',
  'GI9': 'G19', 'G1G': 'G19', 'GI9': 'G19',
  'C11': 'C11', 'C15': 'C15', 'C5': 'C5',
  'M19': 'A19', 'A2O': 'A20', 'A2Q': 'A20',
  'F2': 'F2', 'F3': 'F3', 'F5': 'F5', 'F6': 'F6',
  'A20': 'A20', 'A26': 'A26', 'A19': 'A19',
  'G19': 'G19', 'G20': 'G20',
  'G1': 'G1', 'C1': 'C1', 'D1': 'D1', 'F1': 'F1', 'H1': 'H1',
  'A1': 'A1', 'B1': 'B1', 'E1': 'E1', 'M1': 'M1',
};

// OCR接口
export interface OCRResult {
  codes: Array<{ code: string; quantity: number; original?: string }>;
  croppedCanvas?: HTMLCanvasElement;
  rawText: string;
  correctedText: string;
  processedImage?: string;
  ocrTime: number;
}

// 主识别函数
export const extractColorCodesFromImage = async (
  imageFile: File,
  area?: { x: number; y: number; width: number; height: number }
): Promise<OCRResult> => {
  const startTime = Date.now();
  
  let result;
  let croppedCanvas: HTMLCanvasElement | undefined;
  
  if (area) {
    // 裁剪图片
    const { blob, canvas } = await cropImageArea(imageFile, area);
    croppedCanvas = canvas;
    
    // 预处理图片
    const processedCanvas = preprocessImage(croppedCanvas);
    
    // OCR识别
    result = await performOCR(processedCanvas);
  } else {
    // 没有选区，直接识别
    result = await performOCR(imageFile);
  }
  
  const endTime = Date.now();
  const ocrTime = (endTime - startTime) / 1000;
  
  const rawText = result.data.text;
  
  // 纠错文本
  const correctedText = applyCorrections(rawText);
  
  // 解析色号
  const codes = parseColorCodes(correctedText);
  
  return {
    codes,
    croppedCanvas,
    rawText,
    correctedText,
    ocrTime
  };
};

// 裁剪图片区域
const cropImageArea = async (
  imageFile: File,
  area: { x: number; y: number; width: number; height: number }
): Promise<{ blob: Blob; canvas: HTMLCanvasElement }> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = area.width;
      canvas.height = area.height;
      ctx?.drawImage(
        img,
        area.x, area.y, area.width, area.height,
        0, 0, area.width, area.height
      );
      
      canvas.toBlob((blob) => {
        if (blob) resolve({ blob, canvas });
      }, 'image/png');
    };

    img.src = URL.createObjectURL(imageFile);
  });
};

// 图像预处理：放大、灰度化、二值化
const preprocessImage = (canvas: HTMLCanvasElement): HTMLCanvasElement => {
  const scale = 3;
  const resultCanvas = document.createElement('canvas');
  resultCanvas.width = canvas.width * scale;
  resultCanvas.height = canvas.height * scale;
  const ctx = resultCanvas.getContext('2d');
  
  if (!ctx) return canvas;
  
  // 放大图片
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, resultCanvas.width, resultCanvas.height);
  
  // 获取图像数据
  const imageData = ctx.getImageData(0, 0, resultCanvas.width, resultCanvas.height);
  const data = imageData.data;
  
  // 灰度化 + 二值化
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    const value = gray > 160 ? 255 : 0;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
  
  ctx.putImageData(imageData, 0, 0);
  
  return resultCanvas;
};

// OCR识别
const performOCR = async (input: HTMLCanvasElement | File): Promise<{ data: { text: string } }> => {
  const worker = await createWorker('eng', 1, {
    logger: m => console.log(`[OCR] ${m.status}: ${m.progress ? Math.round(m.progress * 100) + '%' : ''}`)
  });
  
  try {
    // 优化Tesseract参数
    await worker.setParameters({
      tessedit_pageseg_mode: '6',  // 假设统一文本
      preserve_interword_spaces: '1',
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
    });
    
    let result;
    if (input instanceof HTMLCanvasElement) {
      result = await worker.recognize(input.toDataURL());
    } else {
      result = await worker.recognize(input);
    }
    
    return result;
  } finally {
    await worker.terminate();
  }
};

// 应用OCR纠错
const applyCorrections = (text: string): string => {
  let result = text;
  
  // 统一大写
  result = result.toUpperCase();
  
  // 替换混淆字符
  result = result
    .replace(/[Ⅰl|]/g, '1')
    .replace(/O/g, '0')
    .replace(/Z/g, '2')
    .replace(/S/g, '5')
    .replace(/B(?=[0-9])/g, '8')
    .replace(/Q/g, '0');
  
  // 应用纠错映射
  for (const [wrong, correct] of Object.entries(ocrCorrections)) {
    const regex = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    result = result.replace(regex, correct);
  }
  
  return result;
};

// 解析色号和数量
const parseColorCodes = (text: string): Array<{ code: string; quantity: number; original?: string }> => {
  const results: Array<{ code: string; quantity: number; original?: string }> = [];
  const seen = new Set<string>();
  
  // 标准化文本
  const normalizedText = text
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  // 策略1: 匹配正常格式 "A1 21", "F5 18"
  const normalPattern = /([A-Z][0-9]{1,2})\s+([1-9][0-9]{0,2})/g;
  let match;
  while ((match = normalPattern.exec(normalizedText)) !== null) {
    const code = match[1];
    const quantity = parseInt(match[2]);
    
    if (isValidColorCode(code) && quantity > 0 && !seen.has(code)) {
      seen.add(code);
      results.push({ code, quantity });
    }
  }
  
  // 策略2: 匹配紧凑格式 "A121", "F518"
  // 需要从文本中查找未被匹配的紧凑格式
  const compactPattern = /([A-Z])([0-9]{1,2})([1-9][0-9]{0,2})/g;
  while ((match = compactPattern.exec(normalizedText)) !== null) {
    const code = match[1] + match[2];
    const quantity = parseInt(match[3]);
    
    if (isValidColorCode(code) && quantity > 0 && !seen.has(code)) {
      seen.add(code);
      results.push({ code, quantity });
    }
  }
  
  // 策略3: 只匹配色号，没有数量默认为1
  const singlePattern = /([A-Z][0-9]{1,2})(?!\s*[0-9])/g;
  while ((match = singlePattern.exec(normalizedText)) !== null) {
    const code = match[1];
    
    if (isValidColorCode(code) && !seen.has(code)) {
      seen.add(code);
      results.push({ code, quantity: 1 });
    }
  }
  
  return results;
};

// 验证色号
const isValidColorCode = (code: string): boolean => {
  return validColorCodes.has(code);
};

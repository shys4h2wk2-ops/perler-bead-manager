import { createWorker } from 'tesseract.js';

export const extractColorCodesFromImage = async (imageFile: File): Promise<{ code: string; quantity: number }[]> => {
  const worker = await createWorker('eng');
  
  try {
    const result = await worker.recognize(imageFile);
    const text = result.data.text;
    
    const matches: { code: string; quantity: number }[] = [];
    
    const patterns = [
      /([A-HM][0-9]+)\s*[：:]\s*(\d+)/gi,
      /([A-HM][0-9]+)\s*[；;，,\s]\s*(\d+)/gi,
      /([A-HM][0-9]+)\s+(\d+)/gi,
      /(\d+)\s*[：:]\s*([A-HM][0-9]+)/gi,
      /(\d+)\s*[；;，,\s]\s*([A-HM][0-9]+)/gi,
      /(\d+)\s+([A-HM][0-9]+)/gi,
    ];
    
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(text)) !== null) {
        let code, quantity;
        if (match[1].match(/[A-HM]/i)) {
          code = match[1].toUpperCase();
          quantity = parseInt(match[2]) || 1;
        } else {
          code = match[2].toUpperCase();
          quantity = parseInt(match[1]) || 1;
        }
        
        if (!matches.find(m => m.code === code)) {
          matches.push({ code, quantity });
        }
      }
    }
    
    return matches;
  } finally {
    await worker.terminate();
  }
};

import { createWorker } from 'tesseract.js';

export const extractColorCodesFromImage = async (imageFile: File): Promise<{ code: string; quantity: number }[]> => {
  const worker = await createWorker('eng');
  
  try {
    const result = await worker.recognize(imageFile);
    const text = result.data.text;
    
    const colorPattern = /([A-HM][0-9]+)\s*(\d+)/gi;
    const matches: { code: string; quantity: number }[] = [];
    let match;
    
    while ((match = colorPattern.exec(text)) !== null) {
      matches.push({
        code: match[1].toUpperCase(),
        quantity: parseInt(match[2]) || 1
      });
    }
    
    return matches;
  } finally {
    await worker.terminate();
  }
};

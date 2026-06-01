'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Pattern, PatternItem } from '@/types';
import { beadColors } from '@/data/beadColors';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Upload, Plus, Trash2, Save, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { extractColorCodesFromImage } from '@/utils/ocrProcessor';

export default function NewPatternPage() {
  const router = useRouter();
  const [patterns, setPatterns] = useLocalStorage<Pattern[]>('patterns', []);
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [items, setItems] = useState<PatternItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recognizeFailed, setRecognizeFailed] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setRecognizeFailed(false);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const recognizeText = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    setRecognizeFailed(false);
    try {
      const colorCodes = await extractColorCodesFromImage(imageFile);
      
      if (colorCodes.length === 0) {
        setRecognizeFailed(true);
      } else {
        const newItems: PatternItem[] = [];
        colorCodes.forEach(item => {
          newItems.push({ colorCode: item.code, quantity: item.quantity });
        });
        setItems(newItems);
      }
    } catch (error) {
      console.error('OCR failed:', error);
      setRecognizeFailed(true);
    } finally {
      setIsProcessing(false);
    }
  };

  const updateItemQuantity = (index: number, quantity: number) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, quantity: Math.max(0, quantity) } : item
    ).filter(item => item.quantity > 0));
  };

  const addItem = () => {
    setItems(prev => [...prev, { colorCode: beadColors[0].code, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const changeItemColor = (index: number, colorCode: string) => {
    setItems(prev => prev.map((item, i) => 
      i === index ? { ...item, colorCode } : item
    ));
  };

  const savePattern = () => {
    if (!name.trim()) return;
    
    const newPattern: Pattern = {
      id: Date.now().toString(),
      name: name.trim(),
      image: image || '',
      status: 'unstarted',
      items,
      createdAt: Date.now(),
    };
    
    setPatterns(prev => [...prev, newPattern]);
    router.push('/patterns');
  };

  const getTotalBeads = () => {
    return items.reduce((sum, item) => sum + item.quantity, 0);
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-0">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patterns">
              <button className="p-2 -ml-2">
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
            </Link>
            <h1 className="text-lg font-bold text-gray-800">新建图纸</h1>
          </div>
          <button
            onClick={savePattern}
            disabled={!name.trim() || items.length === 0}
            className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium disabled:opacity-50"
          >
            <Save size={20} className="inline mr-1" />
            保存
          </button>
        </div>
      </header>

      <main className="flex flex-col pb-24">
        <div className="p-4 border-b border-gray-200 bg-white">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="输入图纸名称..."
            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {!image ? (
          <div className="p-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-500 transition-colors"
            >
              <Upload size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-500 font-medium">点击上传图纸</p>
              <p className="text-sm text-gray-400 mt-2">支持 PNG, JPG, WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        ) : (
          <>
            <div className="p-4">
              <img src={image} alt="图纸" className="max-w-full max-h-[35vh] h-auto mx-auto rounded-lg shadow-md object-contain" />
            </div>
            
            <div className="p-4 border-t border-gray-200 bg-white space-y-3">
              <button
                onClick={recognizeText}
                disabled={isProcessing}
                className="w-full bg-purple-500 text-white py-4 rounded-xl font-medium disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isProcessing ? '识别中...' : '识别色号和数量'}
              </button>
              
              <button
                onClick={addItem}
                className="w-full bg-blue-500 text-white py-4 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <Plus size={20} className="inline" />
                手动添加色号
              </button>
            </div>

            {recognizeFailed && items.length === 0 && (
              <div className="p-4 border-t border-gray-200 bg-orange-50">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                  <AlertCircle size={20} />
                  <span className="font-medium">未能识别出色号</span>
                </div>
                <p className="text-sm text-orange-500">点击上方"手动添加色号"按钮手动添加</p>
              </div>
            )}
          </>
        )}

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-gray-800">
                颜色统计 ({getTotalBeads()} 颗)
              </h3>
              <button
                onClick={addItem}
                className="p-2 bg-blue-100 text-blue-600 rounded-lg"
              >
                <Plus size={20} />
              </button>
            </div>
            <div className="space-y-2">
              {items.map((item, index) => {
                const color = beadColors.find(c => c.code === item.colorCode);
                return (
                  <div key={index} className="flex items-center gap-3">
                    <select
                      value={item.colorCode}
                      onChange={(e) => changeItemColor(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
                    >
                      {beadColors.map(c => (
                        <option key={c.code} value={c.code}>
                          {c.code} - {c.name}
                        </option>
                      ))}
                    </select>
                    <div
                      className="w-8 h-8 rounded-lg border border-gray-200 flex-shrink-0"
                      style={{ backgroundColor: color?.hex }}
                    />
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                      min="0"
                      className="w-20 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm"
                    />
                    <button
                      onClick={() => removeItem(index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      <BottomNav />
    </div>
  );
}

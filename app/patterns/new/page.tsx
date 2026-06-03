'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Pattern, PatternItem } from '@/types';
import { beadColors } from '@/data/beadColors';
import BottomNav from '@/components/BottomNav';
import ImageCropper from '@/components/ImageCropper';
import ColorSelector from '@/components/ColorSelector';
import { extractColorCodesFromImage, OCRResult } from '@/utils/ocrProcessor';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Scan, 
  Eye,
  CheckCircle2,
  XCircle,
  Image as ImageIcon,
  Download,
  Sparkles,
  Clock,
  BarChart3,
  RotateCcw,
  Check,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function NewPatternPage() {
  const router = useRouter();
  const [patterns, setPatterns] = useLocalStorage<Pattern[]>('patterns', []);
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [items, setItems] = useState<PatternItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectionArea, setSelectionArea] = useState<SelectionArea | null>(null);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const [croppedPreview, setCroppedPreview] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'crop' | 'confirm' | 'review'>('upload');
  const [errors, setErrors] = useState<string[]>([]);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);
  const [colorSelectorIndex, setColorSelectorIndex] = useState<number | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mainImgRef = useRef<HTMLImageElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setItems([]);
      setSelectionArea(null);
      setCroppedPreview(null);
      setOcrResult(null);
      setErrors([]);
      setStep('crop');
      
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageDimensions({ width: img.width, height: img.height });
          setImage(e.target?.result as string);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSelectionChange = (area: SelectionArea | null, croppedPreviewData?: string) => {
    setSelectionArea(area);
    if (croppedPreviewData) {
      setCroppedPreview(croppedPreviewData);
    }
  };

  const confirmSelection = () => {
    if (!selectionArea) {
      return;
    }
    setStep('confirm');
  };

  const cropAndPreview = () => {
    if (!selectionArea || !image) {
      return;
    }
    
    const img = new Image();
    img.src = image;
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      canvas.width = selectionArea.width;
      canvas.height = selectionArea.height;
      
      ctx.drawImage(
        img,
        selectionArea.x, selectionArea.y, selectionArea.width, selectionArea.height,
        0, 0, selectionArea.width, selectionArea.height
      );
      
      setCroppedPreview(canvas.toDataURL());
    };
    
    img.onerror = () => {
      console.error('Failed to load image for cropping');
    };
  };

  const backToCrop = () => {
    setStep('crop');
  };

  const recognizeText = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    setErrors([]);
    
    try {
      // 直接执行OCR，不进入高级模式
      const result = await extractColorCodesFromImage(imageFile, selectionArea || undefined);
      
      setOcrResult(result);
      
      // 判断识别效果
      if (result.codes.length === 0) {
        setErrors(['未能识别到有效的色号，请检查选择区域或尝试调整选择框']);
      } else {
        const newItems: PatternItem[] = [];
        result.codes.forEach(item => {
          newItems.push({ colorCode: item.code, quantity: item.quantity });
        });
        setItems(newItems);
        setStep('review');
      }
    } catch (error) {
      console.error('OCR failed:', error);
      setErrors(['识别过程中出现错误，请重试']);
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

  const openColorSelector = (index: number) => {
    setColorSelectorIndex(index);
    setShowColorSelector(true);
  };

  const handleColorSelect = (colorCode: string) => {
    if (colorSelectorIndex !== null) {
      changeItemColor(colorSelectorIndex, colorCode);
    }
  };

  const savePattern = () => {
    if (!name.trim() || items.length === 0) return;
    
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

  const resetAll = () => {
    setImage(null);
    setImageFile(null);
    setItems([]);
    setSelectionArea(null);
    setCroppedPreview(null);
    setOcrResult(null);
    setStep('upload');
    setErrors([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-0">
      <header className="bg-white border-b border-gray-200 p-4 sticky top-0 z-20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/patterns">
              <button className="p-2 -ml-2">
                <ArrowLeft size={24} className="text-gray-600" />
              </button>
            </Link>
            <h1 className="text-xl font-bold text-gray-800">新建图纸</h1>
          </div>
          {step === 'review' && (
            <button
              onClick={savePattern}
              disabled={!name.trim() || items.length === 0}
              className="px-6 py-2 bg-green-400 text-white rounded-xl font-medium disabled:opacity-50 flex items-center gap-2"
            >
              <Save size={20} />
              保存
            </button>
          )}
        </div>
      </header>

      <main className="flex flex-col pb-24">
        {/* 上传步骤 */}
        {step === 'upload' && !image && (
          <div className="p-8">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all bg-white shadow-md"
            >
              <ImageIcon size={64} className="mx-auto text-gray-400 mb-4" />
              <p className="text-xl text-gray-600 font-medium mb-2">点击上传图纸</p>
              <p className="text-sm text-gray-400">支持 PNG, JPG, WEBP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>
          </div>
        )}

        {/* 裁剪和确认步骤 */}
        {(step === 'crop' || step === 'confirm' || step === 'review') && image && (
          <>
            {/* 图纸名称 */}
            <div className="p-4 border-b border-gray-200 bg-white">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="输入图纸名称..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 text-lg"
              />
            </div>

            {/* 提示信息 */}
            {step === 'crop' && (
              <div className="mx-4 mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                <p className="text-blue-700 font-medium">
                  👆 框选图例区域后点击"确定选区"
                </p>
              </div>
            )}

            {step === 'confirm' && (
              <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-green-700 font-medium flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  已确定选区，请检查裁剪预览，然后点击"识别图例"
                </p>
              </div>
            )}

            {/* 成功提示 */}
            {step === 'review' && ocrResult && (
              <div className="mx-4 mt-4 p-4 bg-green-50 border border-green-100 rounded-xl">
                <p className="text-green-700 font-medium flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  识别成功！识别到 {items.length} 个色号 ({ocrResult.ocrTime.toFixed(2)}秒)
                </p>
              </div>
            )}

            {/* 主图或裁剪预览 */}
            <div className="p-4">
              {step === 'crop' ? (
                <div className="bg-white rounded-2xl shadow-lg p-4">
                  <ImageCropper
                    imageSrc={image}
                    onSelectionChange={handleSelectionChange}
                    initialArea={selectionArea ?? undefined}
                  />
                </div>
              ) : step === 'confirm' || step === 'review' ? (
                <div className="bg-white rounded-2xl shadow-lg p-4">
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-600 mb-2 flex items-center gap-2">
                      <Eye size={16} />
                      选择的图例区域：
                    </h3>
                    {croppedPreview && (
                      <img 
                        src={croppedPreview} 
                        alt="裁剪预览" 
                        className="max-w-full h-auto mx-auto rounded-lg border-2 border-green-300 shadow-md"
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* 调试面板 */}
            {ocrResult && (
              <div className="px-4 pb-2">
                <details 
                  className="bg-gray-50 rounded-xl border border-gray-200"
                  open={showDebug}
                  onToggle={(e) => setShowDebug(e.currentTarget.open)}
                >
                  <summary className="px-4 py-3 cursor-pointer text-gray-700 font-medium flex items-center gap-2">
                    <Sparkles size={18} />
                    快速识别模式
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDebug(!showDebug); }}
                      className="ml-auto text-gray-400 hover:text-gray-600"
                    >
                      <XCircle size={16} />
                    </button>
                  </summary>
                  <div className="px-4 pb-4 space-y-4">
                    {/* 统计信息 */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{ocrResult.codes.length}</div>
                        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                          识别到色号
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                          {ocrResult.codes.length > 0 ? '100' : '0'}%
                        </div>
                        <div className="text-xs text-gray-500">识别成功率</div>
                      </div>
                      <div className="bg-white p-3 rounded-lg">
                        <div className="text-2xl font-bold text-orange-500 flex items-center justify-center gap-1">
                          <Sparkles size={20} />
                        </div>
                        <div className="text-xs text-gray-500">快速模式</div>
                      </div>
                    </div>

                    {/* 原始OCR文本 */}
                    {ocrResult.rawText && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <Eye size={14} className="text-blue-500" />
                          OCR 原始文本：
                        </p>
                        <pre className="text-sm text-gray-700 bg-white p-3 rounded-lg border overflow-x-auto whitespace-pre-wrap">
                          {ocrResult.rawText}
                        </pre>
                      </div>
                    )}

                    {/* 纠错后文本 */}
                    {ocrResult.correctedText && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <Sparkles size={14} className="text-yellow-500" />
                          OCR 纠错后文本：
                        </p>
                        <pre className="text-sm text-blue-700 bg-white p-3 rounded-lg border overflow-x-auto whitespace-pre-wrap">
                          {ocrResult.correctedText}
                        </pre>
                      </div>
                    )}

                    {/* 预处理后的图片 */}
                    {ocrResult.processedImage && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <ImageIcon size={14} className="text-purple-500" />
                          预处理后的图片（放大3倍 + 灰度化 + 对比度增强）：
                        </p>
                        <img src={ocrResult.processedImage} alt="预处理后" className="max-w-full h-auto rounded-lg border bg-white p-2" />
                      </div>
                    )}

                    {/* 最终解析结果 */}
                    {ocrResult.codes.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                          <CheckCircle2 size={14} className="text-green-500" />
                          最终解析结果：
                        </p>
                        <div className="bg-white p-3 rounded-lg border">
                          <div className="flex flex-wrap gap-2">
                            {ocrResult.codes.map((item, idx) => (
                              <span 
                                key={idx} 
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium"
                              >
                                {item.colorCode} {item.quantity}
                                {item.original && item.original !== item.colorCode && (
                                  <span className="text-xs text-green-600 ml-1 opacity-75">
                                    ({item.original})
                                  </span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </details>
              </div>
            )}

            {/* 错误提示 */}
            {errors.length > 0 && (
              <div className="p-4 mx-4 mt-2 bg-red-50 rounded-xl border border-red-100">
                {errors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600">{err}</p>
                ))}
              </div>
            )}

            {/* 操作按钮 - 裁剪步骤 */}
            {step === 'crop' && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={confirmSelection}
                    disabled={!selectionArea}
                    className="py-4 rounded-2xl font-medium bg-green-500 text-white disabled:opacity-50 hover:bg-green-600 flex flex-col items-center gap-2 shadow-lg"
                  >
                    <Check size={28} />
                    确定选区
                  </button>
                </div>
              </div>
            )}

            {/* 操作按钮 - 确认步骤 */}
            {step === 'confirm' && (
              <div className="p-4">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={backToCrop}
                    className="py-4 rounded-2xl font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 flex flex-col items-center gap-2"
                  >
                    <RotateCcw size={28} />
                    重新框选
                  </button>
                  <button
                    onClick={recognizeText}
                    disabled={isProcessing}
                    className="py-4 rounded-2xl font-medium bg-purple-500 text-white disabled:opacity-50 hover:bg-purple-600 flex flex-col items-center gap-2 shadow-lg"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-7 h-7 border-3 border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm">识别中...</span>
                      </>
                    ) : (
                      <>
                        <Scan size={28} />
                        识别图例
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* 操作按钮 - 确认/审核步骤 */}
            {(step === 'confirm' || step === 'review') && (
              <div className="px-4 pb-4">
                <button
                  onClick={() => setStep('review')}
                  className="w-full py-4 rounded-2xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"
                >
                  <Plus size={24} />
                  手动添加色号（备用）
                </button>
              </div>
            )}

            {/* 确认和编辑步骤 */}
            {step === 'review' && items.length > 0 && (
              <div className="p-4 space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                      📦 材料统计表 ({items.length}色 / {getTotalBeads()}颗)
                    </h3>
                    <button
                      onClick={addItem}
                      className="px-3 py-1 bg-blue-100 text-blue-600 rounded-xl text-sm hover:bg-blue-200 flex items-center gap-1"
                    >
                      <Plus size={16} />
                      添加
                    </button>
                  </div>
                  <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                    {items.map((item, index) => {
                      const color = beadColors.find(c => c.code === item.colorCode);
                      return (
                        <div key={`${item.colorCode}-${index}`} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <div
                            className="w-12 h-12 rounded-xl border border-gray-200 flex-shrink-0 shadow-sm"
                            style={{ backgroundColor: color?.hex }}
                          />
                          <button
                            onClick={() => openColorSelector(index)}
                            className="flex-1 flex items-center justify-between px-3 py-2 border border-gray-200 rounded-xl text-sm bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="text-left">
                              <p className="font-bold text-gray-800">{item.colorCode}</p>
                              <p className="text-xs text-gray-500">{color?.name}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-400" />
                          </button>
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItemQuantity(index, parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-24 px-4 py-2 border border-gray-200 rounded-xl text-center text-lg bg-white font-medium"
                          />
                          <button
                            onClick={() => removeItem(index)}
                            className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={resetAll}
                    className="flex-1 py-4 rounded-2xl font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 flex items-center justify-center gap-2"
                  >
                    <RotateCcw size={20} />
                    重新开始
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* 色号选择器 */}
      <ColorSelector
        isOpen={showColorSelector}
        onClose={() => setShowColorSelector(false)}
        onSelect={handleColorSelect}
        initialColor={colorSelectorIndex !== null ? items[colorSelectorIndex]?.colorCode : undefined}
      />

      <BottomNav />
    </div>
  );
}

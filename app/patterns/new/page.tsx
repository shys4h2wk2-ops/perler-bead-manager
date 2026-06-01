'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Pattern, PatternItem } from '@/types';
import { beadColors } from '@/data/beadColors';
import BottomNav from '@/components/BottomNav';
import { processImageArea } from '@/utils/imageProcessor';
import { extractColorCodesFromImage } from '@/utils/ocrProcessor';
import { ArrowLeft, Upload, Plus, Trash2, ChevronLeft, ChevronRight, Grid, Eye, EyeOff, Settings, Save, RotateCcw } from 'lucide-react';
import Link from 'next/link';

export default function NewPatternPage() {
  const router = useRouter();
  const [patterns, setPatterns] = useLocalStorage<Pattern[]>('patterns', []);
  const [name, setName] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [items, setItems] = useState<PatternItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [gridCols, setGridCols] = useState(30);
  const [gridRows, setGridRows] = useState(30);
  const [gridOffsetX, setGridOffsetX] = useState(50);
  const [gridOffsetY, setGridOffsetY] = useState(50);
  const [cellSize, setCellSize] = useState(20);
  const [showGrid, setShowGrid] = useState(true);
  const [selectedColorCode, setSelectedColorCode] = useState<string | null>(null);
  const [colorCells, setColorCells] = useState<Record<string, { row: number; col: number }[]>>({});
  const [showToolbar, setShowToolbar] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [draggingHandle, setDraggingHandle] = useState<'top-left' | 'bottom-right' | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragStartState, setDragStartState] = useState({ offsetX: 0, offsetY: 0, cols: 0, rows: 0, cellSize: 0 });
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          setImageSize({ width: img.width, height: img.height });
          const maxSize = Math.max(img.width, img.height);
          const scale = Math.min(1, 500 / maxSize);
          setScale(scale);
          setOffset({ x: 50, y: 50 });
        };
        img.src = e.target?.result as string;
        setImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    if (canvasRef.current && image) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      if (imageRef.current) {
        const totalOffsetX = offset.x + panOffset.x;
        const totalOffsetY = offset.y + panOffset.y;
        
        ctx.drawImage(imageRef.current, totalOffsetX, totalOffsetY, imageSize.width * scale, imageSize.height * scale);
        
        if (showGrid) {
          const gridStartX = totalOffsetX + gridOffsetX;
          const gridStartY = totalOffsetY + gridOffsetY;
          
          ctx.strokeStyle = 'rgba(100, 150, 255, 0.6)';
          ctx.lineWidth = 1;
          
          for (let row = 0; row <= gridRows; row++) {
            ctx.beginPath();
            ctx.moveTo(gridStartX, gridStartY + row * cellSize);
            ctx.lineTo(gridStartX + gridCols * cellSize, gridStartY + row * cellSize);
            ctx.stroke();
          }
          
          for (let col = 0; col <= gridCols; col++) {
            ctx.beginPath();
            ctx.moveTo(gridStartX + col * cellSize, gridStartY);
            ctx.lineTo(gridStartX + col * cellSize, gridStartY + gridRows * cellSize);
            ctx.stroke();
          }
          
          ctx.strokeStyle = 'rgba(255, 100, 100, 0.8)';
          ctx.lineWidth = 2;
          for (let i = 0; i <= gridRows; i += 10) {
            ctx.beginPath();
            ctx.moveTo(gridStartX, gridStartY + i * cellSize);
            ctx.lineTo(gridStartX + gridCols * cellSize, gridStartY + i * cellSize);
            ctx.stroke();
          }
          for (let i = 0; i <= gridCols; i += 10) {
            ctx.beginPath();
            ctx.moveTo(gridStartX + i * cellSize, gridStartY);
            ctx.lineTo(gridStartX + i * cellSize, gridStartY + gridRows * cellSize);
            ctx.stroke();
          }
        }
        
        if (selectedColorCode && colorCells[selectedColorCode]) {
          const gridStartX = totalOffsetX + gridOffsetX;
          const gridStartY = totalOffsetY + gridOffsetY;
          const color = beadColors.find(c => c.code === selectedColorCode);
          
          if (color) {
            ctx.fillStyle = color.hex;
            ctx.globalAlpha = 0.7;
            
            colorCells[selectedColorCode].forEach(cell => {
              ctx.fillRect(
                gridStartX + cell.col * cellSize,
                gridStartY + cell.row * cellSize,
                cellSize,
                cellSize
              );
            });
            
            ctx.globalAlpha = 1;
          }
        }
        
        if (showGrid) {
          const gridStartX = totalOffsetX + gridOffsetX;
          const gridStartY = totalOffsetY + gridOffsetY;
          const gridWidth = gridCols * cellSize;
          const gridHeight = gridRows * cellSize;
          const handleSize = 12;
          
          ctx.fillStyle = '#3B82F6';
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 2;
          
          ctx.beginPath();
          ctx.arc(gridStartX, gridStartY, handleSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(gridStartX + gridWidth, gridStartY + gridHeight, handleSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
      }
    }
  }, [image, imageSize, scale, offset, panOffset, showGrid, gridCols, gridRows, gridOffsetX, gridOffsetY, cellSize, selectedColorCode, colorCells]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!containerRef.current || !canvasRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const totalOffsetX = offset.x + panOffset.x;
    const totalOffsetY = offset.y + panOffset.y;
    const gridStartX = totalOffsetX + gridOffsetX;
    const gridStartY = totalOffsetY + gridOffsetY;
    const gridWidth = gridCols * cellSize;
    const gridHeight = gridRows * cellSize;
    
    const handleSize = 12;
    
    if (x >= gridStartX - handleSize && x <= gridStartX + handleSize &&
        y >= gridStartY - handleSize && y <= gridStartY + handleSize) {
      setDraggingHandle('top-left');
      setDragStart({ x, y });
      setDragStartState({ offsetX: gridOffsetX, offsetY: gridOffsetY, cols: gridCols, rows: gridRows, cellSize });
      return;
    }
    
    if (x >= gridStartX + gridWidth - handleSize && x <= gridStartX + gridWidth + handleSize &&
        y >= gridStartY + gridHeight - handleSize && y <= gridStartY + gridHeight + handleSize) {
      setDraggingHandle('bottom-right');
      setDragStart({ x, y });
      setDragStartState({ offsetX: gridOffsetX, offsetY: gridOffsetY, cols: gridCols, rows: gridRows, cellSize });
      return;
    }
    
    if (x >= totalOffsetX && x <= totalOffsetX + imageSize.width * scale &&
        y >= totalOffsetY && y <= totalOffsetY + imageSize.height * scale) {
      setIsPanning(true);
      setPanStart({ x: x - panOffset.x, y: y - panOffset.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (draggingHandle) {
      const deltaX = x - dragStart.x;
      const deltaY = y - dragStart.y;
      
      if (draggingHandle === 'top-left') {
        const newOffsetX = dragStartState.offsetX + deltaX;
        const newOffsetY = dragStartState.offsetY + deltaY;
        setGridOffsetX(newOffsetX);
        setGridOffsetY(newOffsetY);
      } else if (draggingHandle === 'bottom-right') {
        const newWidth = (dragStartState.cols * dragStartState.cellSize) + deltaX;
        const newHeight = (dragStartState.rows * dragStartState.cellSize) + deltaY;
        
        const newCellSizeWidth = Math.max(5, Math.round(newWidth / dragStartState.cols));
        const newCellSizeHeight = Math.max(5, Math.round(newHeight / dragStartState.rows));
        const newCellSize = Math.round((newCellSizeWidth + newCellSizeHeight) / 2);
        
        setCellSize(newCellSize);
      }
    } else if (isPanning) {
      setPanOffset({
        x: x - panStart.x,
        y: y - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
    setDraggingHandle(null);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!containerRef.current || !canvasRef.current || draggingHandle) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const totalOffsetX = offset.x + panOffset.x;
    const totalOffsetY = offset.y + panOffset.y;
    const gridStartX = totalOffsetX + gridOffsetX;
    const gridStartY = totalOffsetY + gridOffsetY;
    const gridWidth = gridCols * cellSize;
    const gridHeight = gridRows * cellSize;
    
    const handleSize = 12;
    
    if ((x >= gridStartX - handleSize && x <= gridStartX + handleSize &&
        y >= gridStartY - handleSize && y <= gridStartY + handleSize) ||
        (x >= gridStartX + gridWidth - handleSize && x <= gridStartX + gridWidth + handleSize &&
        y >= gridStartY + gridHeight - handleSize && y <= gridStartY + gridHeight + handleSize)) {
      return;
    }
    
    const col = Math.floor((x - gridStartX) / cellSize);
    const row = Math.floor((y - gridStartY) / cellSize);
    
    if (col >= 0 && col < gridCols && row >= 0 && row < gridRows && selectedColorCode) {
      setColorCells(prev => {
        const newCells = { ...prev };
        if (!newCells[selectedColorCode]) {
          newCells[selectedColorCode] = [];
        }
        
        const existingIndex = newCells[selectedColorCode].findIndex(
          c => c.row === row && c.col === col
        );
        
        if (existingIndex >= 0) {
          newCells[selectedColorCode] = newCells[selectedColorCode].filter(
            (_, i) => i !== existingIndex
          );
        } else {
          newCells[selectedColorCode].push({ row, col });
        }
        
        updateItemsFromCells(newCells);
        return newCells;
      });
    }
  };

  const updateItemsFromCells = (cells: Record<string, { row: number; col: number }[]>) => {
    const newItems: PatternItem[] = Object.entries(cells).map(([code, cellList]) => ({
      colorCode: code,
      quantity: cellList.length
    })).filter(item => item.quantity > 0);
    
    setItems(newItems);
  };

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev / 1.2, 0.3));
  };

  const parseColorInput = () => {
    const textarea = document.getElementById('colorInput') as HTMLTextAreaElement;
    if (!textarea) return;
    
    const input = textarea.value.trim();
    if (!input) return;
    
    const parts = input.split(/[\s,，]+/).filter(p => p.trim());
    const colorPattern = /^([A-HM][0-9]+)$/;
    
    const newItems: PatternItem[] = [];
    for (let i = 0; i < parts.length; i += 2) {
      const code = parts[i].toUpperCase().trim();
      const quantity = parseInt(parts[i + 1]) || 1;
      
      if (colorPattern.test(code)) {
        newItems.push({ colorCode: code, quantity });
      }
    }
    
    setItems(newItems);
    textarea.value = '';
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

  const getCurrentColorIndex = () => {
    if (!selectedColorCode) return -1;
    return items.findIndex(item => item.colorCode === selectedColorCode);
  };

  const selectPrevColor = () => {
    const currentIndex = getCurrentColorIndex();
    if (currentIndex > 0) {
      setSelectedColorCode(items[currentIndex - 1].colorCode);
    } else if (items.length > 0) {
      setSelectedColorCode(items[items.length - 1].colorCode);
    }
  };

  const selectNextColor = () => {
    const currentIndex = getCurrentColorIndex();
    if (currentIndex >= 0 && currentIndex < items.length - 1) {
      setSelectedColorCode(items[currentIndex + 1].colorCode);
    } else if (items.length > 0) {
      setSelectedColorCode(items[0].colorCode);
    }
  };

  const resetView = () => {
    setPanOffset({ x: 0, y: 0 });
    const maxSize = Math.max(imageSize.width, imageSize.height);
    const scale = Math.min(1, 500 / maxSize);
    setScale(scale);
    setOffset({ x: 50, y: 50 });
  };

  const recognizePattern = async () => {
    if (!imageFile || !imageRef.current) return;
    
    setIsProcessing(true);
    try {
      const areaX = gridOffsetX / scale;
      const areaY = gridOffsetY / scale;
      const areaWidth = (gridCols * cellSize) / scale;
      const areaHeight = (gridRows * cellSize) / scale;
      
      const areaItems = await processImageArea(imageFile, {
        x: areaX,
        y: areaY,
        width: areaWidth,
        height: areaHeight
      }, { rows: gridRows, cols: gridCols }, beadColors);
      
      const newColorCells: Record<string, { row: number; col: number }[]> = {};
      
      areaItems.forEach(item => {
        newColorCells[item.colorCode] = [];
      });
      
      setColorCells(newColorCells);
      setItems(areaItems);
    } catch (error) {
      console.error('Pattern recognition failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const recognizeText = async () => {
    if (!imageFile) return;
    
    setIsProcessing(true);
    try {
      const colorCodes = await extractColorCodesFromImage(imageFile);
      
      colorCodes.forEach(item => {
        const existingIndex = items.findIndex(i => i.colorCode === item.code);
        if (existingIndex >= 0) {
          setItems(prev => prev.map((it, idx) => 
            idx === existingIndex ? { ...it, quantity: it.quantity + item.quantity } : it
          ));
        } else {
          setItems(prev => [...prev, { colorCode: item.code, quantity: item.quantity }]);
        }
      });
    } catch (error) {
      console.error('OCR failed:', error);
    } finally {
      setIsProcessing(false);
    }
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
            保存
          </button>
        </div>
      </header>

      <main className="flex flex-col h-[calc(100vh-64px)]">
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
          <div className="flex-1 flex items-center justify-center p-4">
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
          <div className="flex-1 flex flex-col relative">
            {showToolbar && (
              <div className="absolute top-2 left-2 right-2 z-10 flex justify-between">
                <div className="bg-white/90 backdrop-blur rounded-full shadow-lg px-2 py-1 flex items-center gap-1">
                  <button
                    onClick={() => setShowGrid(!showGrid)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    title={showGrid ? "隐藏网格" : "显示网格"}
                  >
                    {showGrid ? <Grid size={20} className="text-blue-600" /> : <Grid size={20} className="text-gray-400" />}
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    title="网格设置"
                  >
                    <Settings size={20} className={showSettings ? "text-blue-600" : "text-gray-600"} />
                  </button>
                  <button
                    onClick={resetView}
                    className="p-2 hover:bg-gray-100 rounded-full"
                    title="重置视图"
                  >
                    <RotateCcw size={20} className="text-gray-600" />
                  </button>
                </div>
                <div className="bg-white/90 backdrop-blur rounded-full shadow-lg px-2 py-1 flex items-center gap-1">
                  <button
                    onClick={handleZoomOut}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    -
                  </button>
                  <span className="text-sm text-gray-500 w-12 text-center">{Math.round(scale * 100)}%</span>
                  <button
                    onClick={handleZoomIn}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    +
                  </button>
                </div>
              </div>
            )}

            {showSettings && (
              <div className="absolute top-14 left-2 right-2 z-10 bg-white rounded-xl shadow-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">网格设置</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">列数</label>
                    <input
                      type="number"
                      value={gridCols}
                      onChange={(e) => setGridCols(parseInt(e.target.value) || 10)}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">行数</label>
                    <input
                      type="number"
                      value={gridRows}
                      onChange={(e) => setGridRows(parseInt(e.target.value) || 10)}
                      min="1"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-sm text-gray-600 mb-1">格子大小</label>
                  <input
                    type="number"
                    value={cellSize}
                    onChange={(e) => setCellSize(parseInt(e.target.value) || 10)}
                    min="5"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">网格X偏移</label>
                    <input
                      type="number"
                      value={gridOffsetX}
                      onChange={(e) => setGridOffsetX(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">网格Y偏移</label>
                    <input
                      type="number"
                      value={gridOffsetY}
                      onChange={(e) => setGridOffsetY(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}

            <div
              ref={containerRef}
              className="flex-1 overflow-auto bg-gray-200 cursor-move relative"
              style={{ touchAction: 'none' }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <canvas
                ref={canvasRef}
                width={1200}
                height={1000}
                className="block absolute"
                onClick={handleCanvasClick}
              />
              <img
                ref={imageRef}
                src={image}
                alt="Pattern"
                className="hidden"
              />
            </div>
            
            {image && (
              <div className="bg-white border-t border-gray-200 p-3">
                <div className="flex gap-2">
                  <button
                    onClick={recognizePattern}
                    disabled={isProcessing}
                    className="flex-1 bg-blue-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
                  >
                    {isProcessing ? '识别中...' : '识别图案颜色'}
                  </button>
                  <button
                    onClick={recognizeText}
                    disabled={isProcessing}
                    className="flex-1 bg-purple-500 text-white py-3 rounded-xl font-medium disabled:opacity-50"
                  >
                    {isProcessing ? '识别中...' : '提取色号文字'}
                  </button>
                </div>
              </div>
            )}

            {items.length > 0 && (
              <div className="bg-white border-t border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <button
                    onClick={selectPrevColor}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronLeft size={24} className="text-gray-600" />
                  </button>
                  
                  {selectedColorCode ? (
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: beadColors.find(c => c.code === selectedColorCode)?.hex }}
                      />
                      <div className="text-center">
                        <div className="font-bold text-lg">{selectedColorCode}</div>
                        <div className="text-sm text-blue-600">
                          {items.find(item => item.colorCode === selectedColorCode)?.quantity || 0} 个
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-gray-500">选择色号开始绘制</div>
                  )}
                  
                  <button
                    onClick={selectNextColor}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <ChevronRight size={24} className="text-gray-600" />
                  </button>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {items.map((item, index) => {
                    const color = beadColors.find(c => c.code === item.colorCode);
                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedColorCode(item.colorCode)}
                        className={`flex-shrink-0 px-3 py-2 rounded-lg border-2 transition-colors ${
                          selectedColorCode === item.colorCode
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: color?.hex }}
                          />
                          <div className="text-xs">
                            <div>{item.colorCode}</div>
                            <div className="text-gray-500">{item.quantity}</div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                  <button
                    onClick={addItem}
                    className="flex-shrink-0 px-4 py-2 rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 text-gray-500"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {image && items.length === 0 && (
          <div className="p-4 border-t border-gray-200 bg-white">
            <h3 className="font-medium text-gray-800 mb-3">批量输入色号</h3>
            <textarea
              placeholder="输入色号和数量，格式示例：
A12 1 A18 28 E3 182
或每行一个：
A12 1
A18 28
E3 182"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 h-32 resize-none text-sm"
              id="colorInput"
            />
            <button
              onClick={parseColorInput}
              className="w-full mt-3 bg-orange-500 text-white py-3 rounded-xl font-medium hover:bg-orange-600 transition-colors"
            >
              解析并添加
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-white max-h-64 overflow-y-auto">
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
                      className="w-16 px-3 py-2 border border-gray-200 rounded-lg text-center text-sm"
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

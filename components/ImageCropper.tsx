'use client';

import { useState, useRef, useEffect } from 'react';

interface SelectionArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface ImageCropperProps {
  imageSrc: string;
  onSelectionChange: (area: SelectionArea | null, croppedPreview?: string) => void;
  initialArea?: SelectionArea;
}

type ResizeHandle = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'top' | 'bottom' | 'left' | 'right';

export default function ImageCropper({ imageSrc, onSelectionChange, initialArea }: ImageCropperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  
  const [isSelecting, setIsSelecting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState<ResizeHandle | null>(null);
  const [selectionDisplay, setSelectionDisplay] = useState<SelectionArea | null>(null);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number } | null>(null);
  const [imageSize, setImageSize] = useState<{ width: number; height: number; offsetX: number; offsetY: number } | null>(null);
  const [originalImageSize, setOriginalImageSize] = useState<{ width: number; height: number } | null>(null);
  const [scale, setScale] = useState({ x: 1, y: 1 });

  // 初始化和更新图片尺寸
  useEffect(() => {
    const updateImageSize = () => {
      if (imgRef.current && containerRef.current) {
        const img = imgRef.current;
        const container = containerRef.current;
        
        const containerRect = container.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        
        const newImageSize = {
          width: imgRect.width,
          height: imgRect.height,
          offsetX: imgRect.left - containerRect.left,
          offsetY: imgRect.top - containerRect.top,
        };
        
        setImageSize(newImageSize);
        
        // 直接从图片元素获取原始尺寸，不需要等待onload
        const naturalWidth = img.naturalWidth;
        const naturalHeight = img.naturalHeight;
        
        if (naturalWidth > 0 && naturalHeight > 0) {
          setOriginalImageSize({ width: naturalWidth, height: naturalHeight });
          setScale({
            x: naturalWidth / newImageSize.width,
            y: naturalHeight / newImageSize.height,
          });
        }
      }
    };

    const img = imgRef.current;
    if (img) {
      img.onload = () => {
        updateImageSize();
      };
      updateImageSize();
    }
    
    window.addEventListener('resize', updateImageSize);
    return () => window.removeEventListener('resize', updateImageSize);
  }, [imageSrc, originalImageSize]);

  // 处理初始选区
  useEffect(() => {
    if (initialArea && imageSize && originalImageSize) {
      // 将原始坐标转换为显示坐标
      setSelectionDisplay({
        x: initialArea.x / scale.x,
        y: initialArea.y / scale.y,
        width: initialArea.width / scale.x,
        height: initialArea.height / scale.y,
      });
    }
  }, [initialArea, imageSize, originalImageSize, scale]);

  // ESC取消框选
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsSelecting(false);
        setIsDragging(false);
        setIsResizing(null);
        setStartPoint(null);
        setDragOffset(null);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 获取相对位置
  const getRelativePosition = (e: React.MouseEvent | React.TouchEvent) => {
    if (!containerRef.current || !imageSize) return null;
    
    const containerRect = containerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    return {
      x: clientX - containerRect.left - imageSize.offsetX,
      y: clientY - containerRect.top - imageSize.offsetY,
    };
  };

  // 限制在图片范围内
  const clampToImage = (x: number, y: number, width: number, height: number): SelectionArea => {
    if (!imageSize) return { x, y, width, height };
    let newX = Math.max(0, Math.min(x, imageSize.width - Math.abs(width)));
    let newY = Math.max(0, Math.min(y, imageSize.height - Math.abs(height)));
    let newWidth = Math.max(20, Math.abs(width));
    let newHeight = Math.max(20, Math.abs(height));
    
    // 确保选区不超出图片边界
    newWidth = Math.min(newWidth, imageSize.width - newX);
    newHeight = Math.min(newHeight, imageSize.height - newY);
    
    return { x: newX, y: newY, width: newWidth, height: newHeight };
  };

  // 转换坐标并回调
  const convertAndUpdateSelection = (newSelection: SelectionArea) => {
    setSelectionDisplay(newSelection);
    
    let coordsToSend: SelectionArea;
    let croppedPreview: string | undefined;
    
    if (originalImageSize && imageSize) {
      coordsToSend = {
        x: Math.round(newSelection.x * scale.x),
        y: Math.round(newSelection.y * scale.y),
        width: Math.round(newSelection.width * scale.x),
        height: Math.round(newSelection.height * scale.y),
      };
      
      // 直接在组件内生成裁剪预览
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = coordsToSend.width;
          canvas.height = coordsToSend.height;
          ctx.drawImage(
            img,
            coordsToSend.x, coordsToSend.y, coordsToSend.width, coordsToSend.height,
            0, 0, coordsToSend.width, coordsToSend.height
          );
          croppedPreview = canvas.toDataURL();
          onSelectionChange(coordsToSend, croppedPreview);
        }
      };
      img.src = imageSrc;
      
      // 如果图片已经加载完成，直接调用回调
      if (img.complete) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (ctx) {
          canvas.width = coordsToSend.width;
          canvas.height = coordsToSend.height;
          ctx.drawImage(
            img,
            coordsToSend.x, coordsToSend.y, coordsToSend.width, coordsToSend.height,
            0, 0, coordsToSend.width, coordsToSend.height
          );
          croppedPreview = canvas.toDataURL();
        }
        onSelectionChange(coordsToSend, croppedPreview);
        return;
      }
    } else {
      coordsToSend = {
        x: Math.round(newSelection.x),
        y: Math.round(newSelection.y),
        width: Math.round(newSelection.width),
        height: Math.round(newSelection.height),
      };
      onSelectionChange(coordsToSend);
    }
  };

  // 鼠标按下
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getRelativePosition(e);
    if (!pos || !imageSize) return;
    
    // 确保点击在图片区域内
    if (pos.x < 0 || pos.y < 0 || pos.x > imageSize.width || pos.y > imageSize.height) {
      return;
    }
    
    if (selectionDisplay) {
      // 检查是否点击了调整手柄
      const target = e.target as HTMLElement;
      const handle = target.dataset.handle as ResizeHandle | undefined;
      
      if (handle) {
        setIsResizing(handle);
        setStartPoint(pos);
        return;
      }
      
      // 检查是否点击了选区内部
      if (pos.x >= selectionDisplay.x && pos.x <= selectionDisplay.x + selectionDisplay.width &&
          pos.y >= selectionDisplay.y && pos.y <= selectionDisplay.y + selectionDisplay.height) {
        setIsDragging(true);
        setDragOffset({
          x: pos.x - selectionDisplay.x,
          y: pos.y - selectionDisplay.y,
        });
        return;
      }
    }
    
    // 开始新框选
    setIsSelecting(true);
    setSelectionDisplay(null);
    setStartPoint(pos);
  };

  // 鼠标移动
  const handleMouseMove = (e: React.MouseEvent) => {
    e.preventDefault();
    const pos = getRelativePosition(e);
    if (!pos || !imageSize) return;
    
    if (isSelecting && startPoint) {
      const x = Math.min(startPoint.x, pos.x);
      const y = Math.min(startPoint.y, pos.y);
      const width = Math.abs(pos.x - startPoint.x);
      const height = Math.abs(pos.y - startPoint.y);
      
      if (width >= 20 && height >= 20) {
        const clamped = clampToImage(x, y, width, height);
        setSelectionDisplay(clamped);
      }
    } else if (isDragging && selectionDisplay && dragOffset) {
      const newX = pos.x - dragOffset.x;
      const newY = pos.y - dragOffset.y;
      const clamped = clampToImage(newX, newY, selectionDisplay.width, selectionDisplay.height);
      convertAndUpdateSelection(clamped);
    } else if (isResizing && selectionDisplay && startPoint) {
      let newSelection = { ...selectionDisplay };
      const deltaX = pos.x - startPoint.x;
      const deltaY = pos.y - startPoint.y;
      
      switch (isResizing) {
        case 'top-left':
          newSelection = {
            x: selectionDisplay.x + deltaX,
            y: selectionDisplay.y + deltaY,
            width: selectionDisplay.width - deltaX,
            height: selectionDisplay.height - deltaY,
          };
          break;
        case 'top-right':
          newSelection = {
            x: selectionDisplay.x,
            y: selectionDisplay.y + deltaY,
            width: selectionDisplay.width + deltaX,
            height: selectionDisplay.height - deltaY,
          };
          break;
        case 'bottom-left':
          newSelection = {
            x: selectionDisplay.x + deltaX,
            y: selectionDisplay.y,
            width: selectionDisplay.width - deltaX,
            height: selectionDisplay.height + deltaY,
          };
          break;
        case 'bottom-right':
          newSelection = {
            x: selectionDisplay.x,
            y: selectionDisplay.y,
            width: selectionDisplay.width + deltaX,
            height: selectionDisplay.height + deltaY,
          };
          break;
        case 'top':
          newSelection = {
            x: selectionDisplay.x,
            y: selectionDisplay.y + deltaY,
            width: selectionDisplay.width,
            height: selectionDisplay.height - deltaY,
          };
          break;
        case 'bottom':
          newSelection = {
            x: selectionDisplay.x,
            y: selectionDisplay.y,
            width: selectionDisplay.width,
            height: selectionDisplay.height + deltaY,
          };
          break;
        case 'left':
          newSelection = {
            x: selectionDisplay.x + deltaX,
            y: selectionDisplay.y,
            width: selectionDisplay.width - deltaX,
            height: selectionDisplay.height,
          };
          break;
        case 'right':
          newSelection = {
            x: selectionDisplay.x,
            y: selectionDisplay.y,
            width: selectionDisplay.width + deltaX,
            height: selectionDisplay.height,
          };
          break;
      }
      
      const clamped = clampToImage(newSelection.x, newSelection.y, newSelection.width, newSelection.height);
      convertAndUpdateSelection(clamped);
      setStartPoint(pos);
    }
  };

  // 鼠标释放
  const handleMouseUp = () => {
    if (isSelecting) {
      setIsSelecting(false);
      
      if (selectionDisplay && selectionDisplay.width >= 20 && selectionDisplay.height >= 20) {
        convertAndUpdateSelection(selectionDisplay);
      }
    }
    
    setIsDragging(false);
    setIsResizing(null);
    setStartPoint(null);
    setDragOffset(null);
  };

  // 重置选择
  const resetSelection = () => {
    setSelectionDisplay(null);
    setIsSelecting(false);
    setIsDragging(false);
    setIsResizing(null);
    setStartPoint(null);
    setDragOffset(null);
    onSelectionChange(null);
  };

  // 开始选择
  const startSelection = () => {
    setIsSelecting(true);
    setSelectionDisplay(null);
  };

  // 调整鼠标样式
  const getCursorStyle = () => {
    if (isResizing) {
      const cursors: Record<ResizeHandle, string> = {
        'top-left': 'nwse-resize',
        'top-right': 'nesw-resize',
        'bottom-left': 'nesw-resize',
        'bottom-right': 'nwse-resize',
        'top': 'ns-resize',
        'bottom': 'ns-resize',
        'left': 'ew-resize',
        'right': 'ew-resize',
      };
      return cursors[isResizing];
    }
    if (isDragging) return 'move';
    if (isSelecting) return 'crosshair';
    return 'default';
  };

  // 获取手柄样式
  const getHandleStyle = (handle: ResizeHandle) => {
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: '16px',
      height: '16px',
      backgroundColor: 'white',
      border: '2px solid #22c55e',
      borderRadius: '50%',
      zIndex: 20,
      cursor: 'pointer',
    };

    switch (handle) {
      case 'top-left':
        return { ...baseStyle, top: '-8px', left: '-8px' };
      case 'top-right':
        return { ...baseStyle, top: '-8px', right: '-8px' };
      case 'bottom-left':
        return { ...baseStyle, bottom: '-8px', left: '-8px' };
      case 'bottom-right':
        return { ...baseStyle, bottom: '-8px', right: '-8px' };
      case 'top':
        return { ...baseStyle, top: '-8px', left: '50%', transform: 'translateX(-50%)' };
      case 'bottom':
        return { ...baseStyle, bottom: '-8px', left: '50%', transform: 'translateX(-50%)' };
      case 'left':
        return { ...baseStyle, left: '-8px', top: '50%', transform: 'translateY(-50%)' };
      case 'right':
        return { ...baseStyle, right: '-8px', top: '50%', transform: 'translateY(-50%)' };
      default:
        return baseStyle;
    }
  };

  return (
    <div className="relative">
      {/* 提示信息 */}
      {isSelecting && (
        <div className="absolute top-0 left-0 right-0 z-10 bg-blue-500 text-white px-4 py-2 text-center text-sm font-medium">
          拖动鼠标选择图例区域
        </div>
      )}
      
      <div
        ref={containerRef}
        className="relative select-none"
        style={{ cursor: getCursorStyle() }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          ref={imgRef}
          src={imageSrc}
          alt="选择区域"
          className="max-w-full h-auto rounded-lg shadow-md"
        />
        
        {/* 选框 */}
        {selectionDisplay && selectionDisplay.width > 0 && selectionDisplay.height > 0 && imageSize && (
          <>
            <div
              className="absolute border-2 border-green-500 bg-green-500/15 z-10"
              style={{
                left: selectionDisplay.x + imageSize.offsetX,
                top: selectionDisplay.y + imageSize.offsetY + (isSelecting ? 32 : 0),
                width: selectionDisplay.width,
                height: selectionDisplay.height,
              }}
            >
              {/* 调整手柄 */}
              {!isSelecting && (
                <>
                  <div data-handle="top-left" style={getHandleStyle('top-left')} />
                  <div data-handle="top-right" style={getHandleStyle('top-right')} />
                  <div data-handle="bottom-left" style={getHandleStyle('bottom-left')} />
                  <div data-handle="bottom-right" style={getHandleStyle('bottom-right')} />
                  <div data-handle="top" style={getHandleStyle('top')} />
                  <div data-handle="bottom" style={getHandleStyle('bottom')} />
                  <div data-handle="left" style={getHandleStyle('left')} />
                  <div data-handle="right" style={getHandleStyle('right')} />
                </>
              )}
            </div>
            
            {/* 尺寸标签 */}
            {!isSelecting && (
              <div
                className="absolute bg-green-500 text-white px-2 py-1 rounded text-xs font-medium shadow-lg pointer-events-none z-30"
                style={{
                  left: selectionDisplay.x + imageSize.offsetX + selectionDisplay.width - 60,
                  top: selectionDisplay.y + imageSize.offsetY + selectionDisplay.height + (isSelecting ? 32 : 0) + 4,
                }}
              >
                {Math.round(selectionDisplay.width * scale.x)} × {Math.round(selectionDisplay.height * scale.y)}
              </div>
            )}
          </>
        )}
      </div>
      
      {/* 状态提示 */}
      <div className="mt-3 flex items-center justify-between">
        {isSelecting ? (
          <p className="text-sm text-blue-600 font-medium flex items-center gap-2">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
            拖动鼠标选择图例区域（按 ESC 取消）
          </p>
        ) : selectionDisplay && selectionDisplay.width > 0 ? (
          <div className="flex items-center gap-2">
            <p className="text-sm text-green-600 font-medium">
              ✓ 已选中图例区域 {Math.round(selectionDisplay.width * scale.x)} × {Math.round(selectionDisplay.height * scale.y)}
            </p>
            <p className="text-xs text-gray-500">
              （拖动选区移动，拖动手柄调整大小）
            </p>
          </div>
        ) : (
          <p className="text-sm text-gray-600">
            点击下方按钮开始框选
          </p>
        )}
        
        {selectionDisplay && selectionDisplay.width > 0 && !isSelecting && (
          <div className="flex gap-2">
            <button
              onClick={startSelection}
              className="px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
            >
              重新框选
            </button>
            <button
              onClick={resetSelection}
              className="px-3 py-1 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            >
              取消选择
            </button>
          </div>
        )}
      </div>
      
      {/* 开始框选按钮 */}
      {!isSelecting && (!selectionDisplay || selectionDisplay.width === 0) && (
        <button
          onClick={startSelection}
          className="mt-3 w-full py-4 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          开始框选
        </button>
      )}
    </div>
  );
}

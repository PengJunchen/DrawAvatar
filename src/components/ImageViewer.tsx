import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HotspotPoint } from '../types';

interface ImageViewerProps {
  imageUrl: string | null;
  isLoading?: boolean;
  onHotspotSelect?: (hotspot: HotspotPoint) => void;
  onDownload?: () => void;
  className?: string;
  showHotspot?: boolean;
}

const ImageViewer: React.FC<ImageViewerProps> = ({
  imageUrl,
  isLoading = false,
  onHotspotSelect,
  onDownload,
  className = '',
  showHotspot = false
}) => {
  const { t } = useTranslation();
  const [hotspot, setHotspot] = useState<HotspotPoint | null>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // 当图像URL改变时重置热点
  useEffect(() => {
    setHotspot(null);
  }, [imageUrl]);

  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!onHotspotSelect || isLoading) return;
    
    const img = e.currentTarget;
    const rect = img.getBoundingClientRect();
    
    // 计算点击位置相对于图像的坐标
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;
    
    // 计算相对于原始图像尺寸的坐标
    const { naturalWidth, naturalHeight, clientWidth, clientHeight } = img;
    const scaleX = naturalWidth / clientWidth;
    const scaleY = naturalHeight / clientHeight;
    
    const originalX = Math.round(offsetX * scaleX);
    const originalY = Math.round(offsetY * scaleY);
    
    const newHotspot = { x: originalX, y: originalY };
    setHotspot(newHotspot);
    onHotspotSelect(newHotspot);
  };

  const handleDownload = () => {
    if (!imageUrl || !onDownload) return;
    onDownload();
  };

  // 计算显示热点的位置
  const displayHotspot = hotspot && imgRef.current ? {
    x: (hotspot.x / imgRef.current.naturalWidth) * 100,
    y: (hotspot.y / imgRef.current.naturalHeight) * 100
  } : null;

  return (
    <div className={`relative flex flex-col items-center ${className}`}>
      {isLoading ? (
        <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      ) : imageUrl ? (
        <div className="relative w-full">
          <img
            ref={imgRef}
            src={imageUrl}
            alt="Uploaded or generated image"
            className={`w-full h-auto object-contain rounded-lg max-h-[60vh] ${onHotspotSelect ? 'cursor-crosshair' : ''}`}
            onClick={onHotspotSelect ? handleImageClick : undefined}
          />
          
          {showHotspot && displayHotspot && (
            <div 
              className="absolute rounded-full w-6 h-6 bg-blue-500/50 border-2 border-white pointer-events-none -translate-x-1/2 -translate-y-1/2 z-10"
              style={{ 
                left: `${displayHotspot.x}%`, 
                top: `${displayHotspot.y}%` 
              }}
            >
              <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-blue-400"></div>
            </div>
          )}
        </div>
      ) : (
        <div className="w-full aspect-square bg-gray-800 rounded-lg flex items-center justify-center border border-gray-700">
          <p className="text-gray-400">
            {t('imageViewer.noImage')}
          </p>
        </div>
      )}
      
      {imageUrl && onDownload && (
        <button
          onClick={handleDownload}
          className="mt-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center"
          disabled={isLoading}
        >
          <svg 
            className="w-5 h-5 mr-2" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" 
            />
          </svg>
          {t('common.download')}
        </button>
      )}
    </div>
  );
};

export default ImageViewer;
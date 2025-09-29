import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ImageViewer from './ImageViewer';
import PromptBar from './PromptBar';
import CropTool from './CropTool';
import RetouchTool from './RetouchTool';
import { HotspotPoint, CropType } from '../types';

interface GeneratedSectionProps {
  title: string;
  imageUrl: string | null;
  isLoading: boolean;
  onPromptSubmit: (prompt: string) => void;
  onRetouchSubmit: (prompt: string, hotspot: HotspotPoint) => void;
  onDownload: () => void;
  onGenerate: () => void;
  onCrop: (croppedImageUrl: string) => void;
  canGenerate: boolean;
  className?: string;
}

const GeneratedSection: React.FC<GeneratedSectionProps> = ({
  title,
  imageUrl,
  isLoading,
  onPromptSubmit,
  onRetouchSubmit,
  onDownload,
  onGenerate,
  onCrop,
  canGenerate,
  className = ''
}) => {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<'view' | 'crop' | 'retouch'>('view');
  const [hotspot, setHotspot] = useState<HotspotPoint | null>(null);
  
  const handleHotspotSelect = useCallback((point: HotspotPoint) => {
    setHotspot(point);
    setActiveMode('retouch');
  }, []);
  
  const handleCropComplete = useCallback(async (croppedImageUrl: string, _cropType: CropType) => {
    try {
      // 将裁剪后的图片作为新的生成结果
      onCrop(croppedImageUrl);
      setActiveMode('view');
    } catch (error) {
      console.error('Error processing cropped image:', error);
    }
  }, [onCrop]);
  
  const handleRetouchSubmit = useCallback((prompt: string, point: HotspotPoint) => {
    onRetouchSubmit(prompt, point);
    setActiveMode('view');
  }, [onRetouchSubmit]);

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {imageUrl && (
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveMode('crop')}
              className={`px-3 py-1 rounded-md transition-colors ${
                activeMode === 'crop'
                  ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {t('common.crop')}
            </button>
          </div>
        )}
      </div>
      
      {activeMode === 'view' && (
        <>
          {imageUrl ? (
            <ImageViewer
              imageUrl={imageUrl}
              isLoading={isLoading}
              onHotspotSelect={handleHotspotSelect}
              onDownload={onDownload}
              showHotspot={false}
            />
          ) : (
            <div className="w-full aspect-square bg-gray-800 border border-gray-700 rounded-lg flex flex-col items-center justify-center p-4">
              <svg 
                className="w-16 h-16 text-gray-500 mb-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={1.5} 
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
                />
              </svg>
              <p className="text-center text-gray-400 mb-4">
                {t('generatedSection.noImageYet')}
              </p>
              <button
                onClick={onGenerate}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-6 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
                disabled={!canGenerate || isLoading}
              >
                {isLoading ? t('common.generating') : t('generatedSection.generateAvatar')}
              </button>
            </div>
          )}
          
          {imageUrl && (
            <PromptBar
              onSubmit={onPromptSubmit}
              isLoading={isLoading}
              placeholder={t('promptBar.enhancePlaceholder')}
            />
          )}
        </>
      )}
      
      {activeMode === 'crop' && imageUrl && (
        <CropTool
          imageUrl={imageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setActiveMode('view')}
        />
      )}
      
      {activeMode === 'retouch' && imageUrl && hotspot && (
        <RetouchTool
          imageUrl={imageUrl}
          hotspot={hotspot}
          onSubmit={handleRetouchSubmit}
          onCancel={() => setActiveMode('view')}
          isLoading={isLoading}
        />
      )}
    </div>
  );
};

export default GeneratedSection;
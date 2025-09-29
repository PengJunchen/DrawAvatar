import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ImageViewer from './ImageViewer';
import ImageUploader from './ImageUploader';
import PromptBar from './PromptBar';
import RetouchTool from './RetouchTool';
import { HotspotPoint, DefaultPrompt } from '../types';
import { dataUrlToFile } from '../utils/imageUtils';

interface AvatarSectionProps {
  title: string;
  imageUrl: string | null;
  isLoading: boolean;
  onImageUpload: (file: File) => void;
  onPromptSubmit: (prompt: string) => void;
  onRetouchSubmit: (prompt: string, hotspot: HotspotPoint) => void;
  onDownload: () => void;
  className?: string;
  value?: string;
}

const AvatarSection: React.FC<AvatarSectionProps> = ({
  title,
  imageUrl,
  isLoading,
  onImageUpload,
  onPromptSubmit,
  onRetouchSubmit,
  onDownload,
  className = '',
  value = ''
}) => {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<'view' | 'retouch'>('view');
  const [hotspot, setHotspot] = useState<HotspotPoint | null>(null);
  
  const handleImageSelected = useCallback(async (file: File) => {
    onImageUpload(file);
  }, [onImageUpload]);
  
  const handleHotspotSelect = useCallback((point: HotspotPoint) => {
    setHotspot(point);
    setActiveMode('retouch');
  }, []);
  

  const handleRetouchSubmit = useCallback((prompt: string, point: HotspotPoint) => {
    onRetouchSubmit(prompt, point);
    setActiveMode('view');
  }, [onRetouchSubmit]);

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        
        {imageUrl && (
          <div className="flex space-x-2"></div>
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
            <ImageUploader
              onImageSelected={handleImageSelected}
              hasExistingImage={false}
            />
          )}
          
          {/* 只有当图片已上传时才显示提示词输入框 */}
          {imageUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-medium mb-2">{t('promptBar.personalizeTitle')}</h3>
              <p className="text-sm text-gray-300 mb-3">
                {t('promptBar.personalizeDescription')}
              </p>
              <PromptBar
                onSubmit={onPromptSubmit}
                isLoading={isLoading}
                placeholder={t('promptBar.personalizePrompt')}
                value={value}
                defaultPrompts={[
                  {
                    id: 'national-day',
                    text: {
                      en: 'Add National Day elements',
                      zh: '添加国庆节元素'
                    }
                  },
                  {
                    id: 'high-quality',
                    text: {
                      en: 'High quality, 800x800, 72dpi',
                      zh: '高质量，800x800，72dpi'
                    }
                  }
                ]}
              />
            </div>
          )}
        </>
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

export default AvatarSection;
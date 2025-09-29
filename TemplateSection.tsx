import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import ImageViewer from './ImageViewer';
import ImageUploader from './ImageUploader';
import PromptBar from './PromptBar';
import CropTool from './CropTool';
import TemplateSelector from './TemplateSelector';
import { Template, CropType, DefaultPrompt } from '../types';
import { dataUrlToFile } from '../utils/imageUtils';

interface TemplateSectionProps {
  title: string;
  imageUrl: string | null;
  isLoading: boolean;
  templates: Template[];
  onImageUpload: (file: File) => void;
  onPromptSubmit: (prompt: string) => void;
  onTemplateSelect: (template: Template) => void;
  onDownload: () => void;
  selectedTemplateId: string | null;
  className?: string;
}

const TemplateSection: React.FC<TemplateSectionProps> = ({
  title,
  imageUrl,
  isLoading,
  templates,
  onImageUpload,
  onPromptSubmit,
  onTemplateSelect,
  onDownload,
  selectedTemplateId,
  className = ''
}) => {
  const { t } = useTranslation();
  const [activeMode, setActiveMode] = useState<'view' | 'crop' | 'templates'>('view');
  
  const defaultPrompts: DefaultPrompt[] = [
    {
      id: 'national-flag',
      text: {
        en: 'Draw with precise national flag proportions',
        zh: '以精确的国旗比例绘制'
      }
    },
    {
      id: 'high-quality',
      text: {
        en: 'High quality, 800x800, 72dpi',
        zh: '高质量，800x800，72dpi'
      }
    }
  ];
  
  const handleImageSelected = useCallback(async (file: File) => {
    onImageUpload(file);
  }, [onImageUpload]);
  
  const handleCropComplete = useCallback(async (croppedImageUrl: string, _cropType: CropType) => {
    try {
      const file = dataUrlToFile(croppedImageUrl, `cropped-${Date.now()}.png`);
      onImageUpload(file);
      setActiveMode('view');
    } catch (error) {
      console.error('Error processing cropped image:', error);
    }
  }, [onImageUpload]);
  
  const handleTemplateSelect = useCallback((template: Template) => {
    onTemplateSelect(template);
    setActiveMode('view');
  }, [onTemplateSelect]);

  return (
    <div className={`flex flex-col space-y-4 ${className}`}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">{title}</h2>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveMode(activeMode === 'templates' ? 'view' : 'templates')}
            className={`px-3 py-1 rounded-md transition-colors ${activeMode === 'templates' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
          >
            {t('common.templates')}
          </button>
          
          {imageUrl && (
            <button
              onClick={() => setActiveMode(activeMode === 'crop' ? 'view' : 'crop')}
              className={`px-3 py-1 rounded-md transition-colors ${activeMode === 'crop' ? 'bg-primary-500 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
            >
              {t('common.crop')}
            </button>
          )}
        </div>
      </div>
      
      {activeMode === 'view' && (
        <>
          {imageUrl ? (
            <ImageViewer
              imageUrl={imageUrl}
              isLoading={isLoading}
              onDownload={onDownload}
            />
          ) : (
            <ImageUploader
              onImageSelected={handleImageSelected}
              hasExistingImage={false}
            />
          )}
          
          {/* 移除条件渲染，始终显示PromptBar */}
          <PromptBar
            onSubmit={onPromptSubmit}
            isLoading={isLoading}
            placeholder={t('promptBar.templatePlaceholder')}
            defaultPrompts={defaultPrompts}
          />
        </>
      )}
      
      {activeMode === 'crop' && imageUrl && (
        <CropTool
          imageUrl={imageUrl}
          onCropComplete={handleCropComplete}
          onCancel={() => setActiveMode('view')}
        />
      )}
      
      {activeMode === 'templates' && (
        <TemplateSelector
          templates={templates}
          onSelect={handleTemplateSelect}
          selectedTemplateId={selectedTemplateId}
        />
      )}
    </div>
  );
};

export default TemplateSection;
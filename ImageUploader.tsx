import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { checkImageDimensions } from './imageUtils';

interface ImageUploaderProps {
  onImageSelected: (file: File) => void;
  maxSize?: number; // 最大文件大小（MB）
  minWidth?: number; // 最小宽度（像素）
  minHeight?: number; // 最小高度（像素）
  className?: string;
  hasExistingImage?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  maxSize = 10,
  minWidth = 400,
  minHeight = 400,
  className = '',
  hasExistingImage = false
}) => {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    
    // 检查文件类型
    if (!file.type.startsWith('image/')) {
      setError(t('imageUploader.errorType'));
      return;
    }
    
    // 检查文件大小
    if (file.size > maxSize * 1024 * 1024) {
      setError(t('imageUploader.errorSize', { size: maxSize }));
      return;
    }
    
    // 检查图像尺寸
    const dimensionsOk = await checkImageDimensions(file, minWidth, minHeight);
    if (!dimensionsOk) {
      setError(t('imageUploader.errorDimensions', { width: minWidth, height: minHeight }));
      return;
    }
    
    onImageSelected(file);
  }, [onImageSelected, maxSize, minWidth, minHeight, t]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  return (
    <div className={`w-full ${className}`}>
      <div
        className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center transition-colors
          ${isDragging ? 'border-indigo-600 bg-indigo-900/20' : 'border-gray-700'}
          ${hasExistingImage ? 'bg-gray-800/50' : 'bg-gray-800'}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg 
          className="w-12 h-12 text-gray-500 mb-4" 
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
        
        <p className="mb-2 text-sm text-gray-300">
          {t('imageUploader.dragDrop')}
        </p>
        
        <p className="text-xs text-gray-500 mb-3">
          {t('imageUploader.or')}
        </p>
        
        <label className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md transition-colors">
          {t('imageUploader.browse')}
          <input
            type="file"
            className="hidden"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileInputChange}
          />
        </label>
        
        <p className="mt-3 text-xs text-gray-500">
          {t('imageUploader.supportedFormats')} (最大10MB)
        </p>
        
        {error && (
          <p className="mt-3 text-sm text-red-400">
            {error}
          </p>
        )}
        
        {hasExistingImage && (
          <p className="mt-3 text-sm text-amber-400">
            {t('common.confirmReplaceImage')}
          </p>
        )}
      </div>
    </div>
  );
};

export default ImageUploader;
import React, { useState, useCallback } from 'react';
import ReactCrop, { type Crop, type PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useTranslation } from 'react-i18next';
import { CropType } from '../types';

interface CropToolProps {
  imageUrl: string;
  onCropComplete: (croppedImageUrl: string, cropType: CropType) => void;
  onCancel: () => void;
  initialCropType?: CropType;
}

const CropTool: React.FC<CropToolProps> = ({
  imageUrl,
  onCropComplete,
  onCancel,
  initialCropType = 'rect'
}) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    width: 50,
    height: 50,
    x: 25,
    y: 25
  });
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [cropType, setCropType] = useState<CropType>(initialCropType);
  const [imgRef, setImgRef] = useState<HTMLImageElement | null>(null);

  const onImageLoad = useCallback((img: HTMLImageElement) => {
    setImgRef(img);
    
    // 设置初始裁剪为居中的正方形
    const minSize = Math.min(img.width, img.height);
    const x = (img.width - minSize) / 2;
    const y = (img.height - minSize) / 2;
    
    setCrop({
      unit: 'px',
      width: minSize,
      height: minSize,
      x,
      y
    });
  }, []);

  const handleCropTypeChange = (type: CropType) => {
    setCropType(type);
    
    if (type === 'circle' && imgRef) {
      // 对于圆形裁剪，确保裁剪区域是正方形
      const minSize = Math.min(crop.width || 0, crop.height || 0);
      setCrop({
        ...crop,
        width: minSize,
        height: minSize
      });
    }
  };

  const handleApplyCrop = useCallback(() => {
    if (!imgRef || !completedCrop) return;
    
    const canvas = document.createElement('canvas');
    const scaleX = imgRef.naturalWidth / imgRef.width;
    const scaleY = imgRef.naturalHeight / imgRef.height;
    
    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // 对于圆形裁剪，使用圆形剪切路径
    if (cropType === 'circle') {
      ctx.beginPath();
      ctx.arc(
        completedCrop.width / 2,
        completedCrop.height / 2,
        Math.min(completedCrop.width, completedCrop.height) / 2,
        0,
        2 * Math.PI
      );
      ctx.clip();
    }
    
    ctx.drawImage(
      imgRef,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );
    
    const croppedImageUrl = canvas.toDataURL('image/png');
    onCropComplete(croppedImageUrl, cropType);
  }, [imgRef, completedCrop, cropType, onCropComplete]);

  return (
    <div className="w-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('cropTool.title')}</h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleCropTypeChange('rect')}
            className={`px-3 py-1 rounded-md transition-colors ${
              cropType === 'rect'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {t('cropTool.square')}
          </button>
          <button
            onClick={() => handleCropTypeChange('circle')}
            className={`px-3 py-1 rounded-md transition-colors ${
              cropType === 'circle'
                ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {t('cropTool.circle')}
          </button>
        </div>
      </div>
      
      <div className="w-full bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
        <ReactCrop
          crop={crop}
          onChange={(c) => setCrop(c)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={cropType === 'circle' ? 1 : undefined}
          circularCrop={cropType === 'circle'}
          className="react-crop-wrapper"
        >
          <img
            src={imageUrl}
            alt="Crop this"
            onLoad={(e) => onImageLoad(e.currentTarget)}
            className="max-h-[60vh] w-auto mx-auto"
          />
        </ReactCrop>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
        >
          {t('common.cancel')}
        </button>
        <button
          onClick={handleApplyCrop}
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          disabled={!completedCrop?.width || !completedCrop?.height}
        >
          {t('common.apply')}
        </button>
      </div>
    </div>
  );
};

export default CropTool;
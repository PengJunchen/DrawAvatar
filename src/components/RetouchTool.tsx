import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { HotspotPoint } from '../types';

interface RetouchToolProps {
  imageUrl: string;
  onSubmit: (prompt: string, hotspot: HotspotPoint) => void;
  onCancel: () => void;
  hotspot: HotspotPoint;
  isLoading?: boolean;
}

const RetouchTool: React.FC<RetouchToolProps> = ({
  imageUrl,
  onSubmit,
  onCancel,
  hotspot,
  isLoading = false
}) => {
  const { t } = useTranslation();
  const [prompt, setPrompt] = useState('');
  
  const handleSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim() && !isLoading) {
      onSubmit(prompt.trim(), hotspot);
    }
  }, [prompt, hotspot, onSubmit, isLoading]);
  
  const handleQuickPrompt = useCallback((quickPrompt: string) => {
    setPrompt(quickPrompt);
    onSubmit(quickPrompt, hotspot);
  }, [hotspot, onSubmit]);

  return (
    <div className="w-full flex flex-col">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium">{t('retouchTool.title')}</h3>
      </div>
      
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden p-4">
        <div className="relative w-full mb-4">
          <img
            src={imageUrl}
            alt="Image to retouch"
            className="w-full h-auto object-contain rounded-lg max-h-[40vh]"
          />
          <div 
            className="absolute rounded-full w-6 h-6 bg-blue-500/50 border-2 border-white -translate-x-1/2 -translate-y-1/2"
            style={{ 
              left: `${(hotspot.x / 800) * 100}%`, 
              top: `${(hotspot.y / 800) * 100}%` 
            }}
          >
            <div className="absolute inset-0 rounded-full w-6 h-6 animate-ping bg-blue-400"></div>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={t('retouchTool.promptPlaceholder')}
              className="flex-grow bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={!prompt.trim() || isLoading}
            >
              {isLoading ? t('common.loading') : t('common.apply')}
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickPrompt(t('retouchTool.keepSubject'))}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              {t('retouchTool.keepSubject')}
            </button>
            <button
              type="button"
              onClick={() => handleQuickPrompt(t('retouchTool.removeSubject'))}
              className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              disabled={isLoading}
            >
              {t('retouchTool.removeSubject')}
            </button>
          </div>
        </form>
      </div>
      
      <div className="mt-4 flex justify-end space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          disabled={isLoading}
        >
          {t('common.cancel')}
        </button>
      </div>
    </div>
  );
};

export default RetouchTool;
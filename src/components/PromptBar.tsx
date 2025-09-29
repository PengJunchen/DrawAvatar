import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DefaultPrompt } from '../types';

interface PromptBarProps {
  onSubmit: (prompt: string) => void;
  isLoading?: boolean;
  defaultPrompts?: DefaultPrompt[];
  placeholder?: string;
  className?: string;
  value?: string;
}

const PromptBar: React.FC<PromptBarProps> = ({
  onSubmit,
  isLoading = false,
  defaultPrompts = [],
  placeholder,
  className = '',
  value = ''
}) => {
  const { t, i18n } = useTranslation();
  const [prompt, setPrompt] = useState(value || '');
  
  // 当外部value变化时更新内部状态
  React.useEffect(() => {
    if (value !== undefined) {
      setPrompt(value);
    }
  }, [value]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoading) {
      // 直接提交用户输入的提示词，不在这里格式化
      // 格式化工作将在App.tsx中处理
      onSubmit(prompt.trim());
    }
  };
  
  const handleDefaultPromptClick = (promptText: string) => {
    setPrompt(promptText);
    onSubmit(promptText);
  };

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="flex flex-col space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={placeholder || t('promptBar.placeholder')}
            className="flex-grow bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-indigo-600 focus:border-transparent outline-none transition-all text-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? t('common.loading') : t('common.generate')}
          </button>
        </div>
        
        {defaultPrompts.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {defaultPrompts.map((defaultPrompt) => (
              <button
                key={defaultPrompt.id}
                type="button"
                onClick={() => handleDefaultPromptClick(defaultPrompt.text[i18n.language as 'en' | 'zh'])}
                className="px-3 py-1 text-sm bg-gray-700 text-gray-300 rounded-full hover:bg-gray-600 transition-colors"
                disabled={isLoading}
              >
                {defaultPrompt.text[i18n.language as 'en' | 'zh']}
              </button>
            ))}
          </div>
        )}
      </form>
    </div>
  );
};

export default PromptBar;
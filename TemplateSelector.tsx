import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import { Template } from './types';

interface TemplateSelectorProps {
  templates: Template[];
  onSelect: (template: Template) => void;
  selectedTemplateId: string | null;
  className?: string;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  templates,
  onSelect,
  selectedTemplateId,
  className = ''
}) => {
  const { t } = useTranslation();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    const template = templates.find(t => t.id === selectedId);
    if (template) {
      onSelect(template);
    }
  };

  return (
    <div className={`w-full ${className}`}>
      <h3 className="text-lg font-medium mb-3">{t('templateSelector.title')}</h3>
      <p className="text-sm text-gray-300 mb-4">
        {t('templateSelector.subtitle')}
      </p>
      
      <select
        value={selectedTemplateId || ''}
        onChange={handleChange}
        className="w-full p-3 border border-gray-700 rounded-lg bg-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 text-white"
      >
        <option value="" disabled>{t('templateSelector.selectPlaceholder') || '请选择模板...'}</option>
        {templates.map((template) => (
          <option key={template.id} value={template.id}>
            {typeof template.name === 'string' 
              ? template.name 
              : template.name[i18n.language as 'zh' | 'en'] || template.name.zh}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TemplateSelector;
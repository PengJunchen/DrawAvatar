import React from 'react';
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onLanguageChange: (lang: 'en' | 'zh') => void;
  onThemeChange: (theme: 'light' | 'dark') => void;
}

const Header: React.FC<HeaderProps> = ({ onLanguageChange, onThemeChange }) => {
  const { t, i18n } = useTranslation();
  const isDarkMode = document.documentElement.classList.contains('dark');
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
    onLanguageChange(newLang as 'en' | 'zh');
  };
  
  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    onThemeChange(newTheme);
  };

  return (
    <header className="w-full bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-xl font-bold text-primary-600 dark:text-primary-400">
          {t('common.appName')}
        </h1>
      </div>
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleLanguage}
          className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {i18n.language === 'en' ? '中文' : 'English'}
        </button>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
        >
          {isDarkMode ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
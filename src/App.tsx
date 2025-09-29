import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from './i18n';
import type { ImageInfo, Template, HotspotPoint } from './types';
import AvatarSection from './components/AvatarSection';
import GeneratedSection from './components/GeneratedSection';
import TemplateSelector from './components/TemplateSelector';
import { generateImageFromPrompt, generateImageFromTemplateAndPhoto, retouchImage, downloadImage, generateImageFromTextPrompt } from './services/geminiService';

function App() {
  const { t } = useTranslation();
  // 核心数据状态
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [avatarImage, setAvatarImage] = useState<ImageInfo | null>(null);
  const [generatedImage, setGeneratedImage] = useState<ImageInfo | null>(null);
  const [userPrompt, setUserPrompt] = useState<string>('');
  
  // 状态消息
  const [avatarErrorMessage, setAvatarErrorMessage] = useState<string | null>(null);
  const [avatarSuccessMessage, setAvatarSuccessMessage] = useState<string | null>(null);
  const [generatedErrorMessage, setGeneratedErrorMessage] = useState<string | null>(null);
  const [generatedSuccessMessage, setGeneratedSuccessMessage] = useState<string | null>(null);
  
  // 加载状态
  const [isAvatarProcessing, setIsAvatarProcessing] = useState(false);
  const [isGeneratedProcessing, setIsGeneratedProcessing] = useState(false);
  const [isTemplateSelectionVisible, setIsTemplateSelectionVisible] = useState(false);
  
  // 加载模板数据
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        const response = await fetch('/templates/template.json');
        const data = await response.json();
        
        // 将加载的模板数据转换为应用所需的格式
        if (data && data.templates) {
          const formattedTemplates = data.templates.map((template: any, index: number) => ({
            id: String(index + 1),
            name: typeof template.name === 'string' 
              ? { zh: template.name, en: template.name } 
              : template.name,
            imageUrl: `/templates/images/template${index + 1}.jpg`,
            thumbnailUrl: `/templates/images/template${index + 1}.jpg`,
            prompt: template.prompt
          }));
          setTemplates(formattedTemplates);
        }
      } catch (error) {
        console.error('加载模板数据失败:', error);
      }
    };
    
    loadTemplates();
  }, []);

  // 处理模板选择
  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    // 根据当前语言选择对应的prompt
    const currentLang = i18n.language as 'zh' | 'en';
    const promptText = typeof template.prompt === 'string' 
      ? template.prompt 
      : template.prompt[currentLang] || template.prompt.zh;
    setUserPrompt(promptText);
    setAvatarErrorMessage(null);
    setAvatarSuccessMessage(t('templateSelection.successMessage'));
    setIsTemplateSelectionVisible(false);
    
    // 清除之前生成的图像
    setGeneratedImage(null);
  };

  // 处理头像上传
  const handleAvatarUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setAvatarImage({
        dataUrl: e.target?.result as string,
        filename: file.name
      });
      setAvatarErrorMessage(null);
      setAvatarSuccessMessage('头像上传成功');
      setGeneratedImage(null); // 清除之前生成的图像
      
      // 上传图片后显示模板选择界面
      setIsTemplateSelectionVisible(true);
    };
    reader.readAsDataURL(file);
  };

  // 处理头像修饰
  const handleAvatarRetouch = async (
    prompt: string,
    hotspot: HotspotPoint
  ) => {
    if (!avatarImage || !prompt) {
      setAvatarErrorMessage('请先上传头像并输入修饰提示');
      return;
    }

    setIsAvatarProcessing(true);
    setAvatarErrorMessage(null);
    setAvatarSuccessMessage(null);

    try {
      // 调用生成服务进行修饰
      const result = await retouchImage(
        avatarImage.dataUrl,
        prompt,
        hotspot
      );

      if (result) {
        // 更新原图
        setAvatarImage({
          dataUrl: result,
          filename: `retouched-${Date.now()}.png`,
        });
        setAvatarSuccessMessage('头像修饰成功');
      } else {
        setAvatarErrorMessage('修饰失败，请重试');
      }
    } catch (error) {
      console.error('修饰头像时出错:', error);
      setAvatarErrorMessage('修饰头像时发生错误');
    } finally {
      setIsAvatarProcessing(false);
    }
  };

  // 处理生成头像修饰
  const handleGeneratedRetouch = async (
    prompt: string,
    hotspot: HotspotPoint
  ) => {
    if (!generatedImage || !prompt) {
      setGeneratedErrorMessage('请先生成头像并输入修饰提示');
      return;
    }

    setIsGeneratedProcessing(true);
    setGeneratedErrorMessage(null);
    setGeneratedSuccessMessage(null);

    try {
      // 调用生成服务进行修饰
      const result = await retouchImage(
        generatedImage.dataUrl,
        prompt,
        hotspot
      );

      if (result) {
        // 更新生成的图像
        setGeneratedImage({
          dataUrl: result,
          filename: `retouched-${Date.now()}.png`,
        });
        setGeneratedSuccessMessage('头像修饰成功');
      } else {
        setGeneratedErrorMessage('修饰失败，请重试');
      }
    } catch (error) {
      console.error('修饰生成头像时出错:', error);
      setGeneratedErrorMessage('修饰头像时发生错误');
    } finally {
      setIsGeneratedProcessing(false);
    }
  };

  // 处理生成图片裁剪
  const handleGeneratedCrop = (croppedImageUrl: string) => {
    try {
      if (!croppedImageUrl) {
        setGeneratedErrorMessage('裁剪失败：无效的图片数据');
        return;
      }
      
      setGeneratedImage({
        dataUrl: croppedImageUrl,
        filename: `cropped-${Date.now()}.png`,
      });
      setGeneratedSuccessMessage('头像裁剪成功');
      setGeneratedErrorMessage(null);
    } catch (error) {
      console.error('裁剪图片时出错:', error);
      setGeneratedErrorMessage('裁剪图片时发生错误');
    }
  };

  // 处理下载
  const handleAvatarDownload = (image?: ImageInfo, filename?: string) => {
    try {
      if (!image) return;
      downloadImage(image.dataUrl, filename || image.filename || `avatar-${Date.now()}.png`);
      setAvatarSuccessMessage('下载成功');
    } catch (error) {
      console.error('下载头像时出错:', error);
      setAvatarErrorMessage('下载失败，请重试');
    }
  };

  const handleGeneratedDownload = (image?: ImageInfo, filename?: string) => {
    try {
      if (!image) return;
      downloadImage(image.dataUrl, filename || image.filename || `generated-${Date.now()}.png`);
      setGeneratedSuccessMessage('下载成功');
    } catch (error) {
      console.error('下载生成图像时出错:', error);
      setGeneratedErrorMessage('下载失败，请重试');
    }
  };

  // 处理头像区域的提示词提交（生成图像）
  const handleAvatarPromptSubmit = async (prompt: string) => {
    if (!avatarImage) {
      setAvatarErrorMessage('请先上传头像');
      return;
    }
    
    if (!selectedTemplate) {
      setAvatarErrorMessage('请先选择一个模板');
      return;
    }

    // 验证数据URL格式
    if (!avatarImage.dataUrl.startsWith('data:image/')) {
      setAvatarErrorMessage('头像图片格式无效，请重新上传');
      return;
    }

    setIsAvatarProcessing(true);
    setAvatarErrorMessage(null);
    setAvatarSuccessMessage(null);
    setUserPrompt(prompt || ''); // 保存用户的个性化提示词（允许为空）

    try {
      // 组合模板提示词和用户个性化提示词，并格式化为清晰的步骤
      let combinedPrompt;
      if (prompt) {
        // 如果用户输入了提示词，则格式化为清晰的步骤
        combinedPrompt = `请按照以下步骤生成800*800，72dpi的照片，保持人物主体的准确，可适当调整人物姿态更自然:${prompt}\n请生成800x800, 72dpi的高质量照片`;
      } else {
        // 如果用户没有输入提示词，则只使用模板提示词，并添加高质量要求
        combinedPrompt = `请按照以下步骤生成800*800，72dpi的照片，保持人物主体的准确，可适当调整人物姿态更自然:${prompt}\n请生成800x800, 72dpi的高质量照片`;
      }
      
      // 确保模板图片URL是完整的URL
      let templateImageUrl = selectedTemplate.imageUrl;
      if (!templateImageUrl.startsWith('http') && !templateImageUrl.startsWith('data:image/')) {
        // 假设模板图片存储在public目录下，添加基础路径
        templateImageUrl = `${window.location.origin}${templateImageUrl}`;
      }
      
      // 使用模板+照片的方式生成
      const result = await generateImageFromTemplateAndPhoto(
        templateImageUrl,
        avatarImage.dataUrl,
        combinedPrompt
      );

      if (result) {
        // 更新生成结果区域的图像
        setGeneratedImage({
          dataUrl: result,
          filename: `generated-${Date.now()}.png`,
        });
        setAvatarSuccessMessage('头像生成成功');
      } else {
        setAvatarErrorMessage('生成失败，请重试');
      }
    } catch (error) {
      console.error('生成头像时出错:', error);
      setAvatarErrorMessage('生成头像时发生错误');
    } finally {
      setIsAvatarProcessing(false);
    }
  };

  // 处理生成区域的提示词提交
  const handleGeneratedPromptSubmit = (prompt: string) => {
    if (generatedImage) {
      // 如果已有生成的图像，这是修饰操作
      const hotspot: HotspotPoint = { x: 0.5, y: 0.5 };
      handleGeneratedRetouch(prompt, hotspot);
    }
  };

  // 重新生成
  const handleGeneratedGenerate = async () => {
    if (!avatarImage || !selectedTemplate) {
      setGeneratedErrorMessage('请先上传头像并选择模板');
      return;
    }

    setIsGeneratedProcessing(true);
    setGeneratedErrorMessage(null);
    setGeneratedSuccessMessage(null);

    try {
      // 直接使用用户输入框中的完整prompt（已包含模板和用户自定义部分）
      // 只需添加图片规格要求
      const combinedPrompt = `${userPrompt}\n\n请生成800x800像素、72dpi的高质量图片`;
      
      // 使用模板+照片的方式生成
      const result = await generateImageFromTemplateAndPhoto(
        selectedTemplate.imageUrl,
        avatarImage.dataUrl,
        combinedPrompt
      );

      if (result) {
        // 更新生成结果区域的图像
        setGeneratedImage({
          dataUrl: result,
          filename: `generated-${Date.now()}.png`,
        });
        setGeneratedSuccessMessage('头像生成成功');
      } else {
        setGeneratedErrorMessage('生成失败，请重试');
      }
    } catch (error) {
      console.error('生成头像时出错:', error);
      setGeneratedErrorMessage('生成头像时发生错误');
    } finally {
      setIsGeneratedProcessing(false);
    }
  };

  // 显示模板选择界面
  const toggleTemplateSelection = () => {
    setIsTemplateSelectionVisible(!isTemplateSelectionVisible);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 transition-colors">
      <header className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-3xl font-bold text-center mb-2 text-white">{t('header.title')}</h1>
            <p className="text-center text-gray-300">{t('header.subtitle')}</p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => i18n.changeLanguage('zh')}
              className={`px-3 py-1 rounded-md ${i18n.language === 'zh' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              中
            </button>
            <button
              onClick={() => i18n.changeLanguage('en')}
              className={`px-3 py-1 rounded-md ${i18n.language === 'en' ? 'bg-indigo-600 text-white' : 'bg-gray-700 text-gray-300'}`}
            >
              En
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 头像上传和模板选择区域 */}
          <div className="bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col border border-gray-700">
            {/* 头像区域消息提示 */}
            {(avatarErrorMessage || avatarSuccessMessage) && (
              <div 
                className={`px-4 py-2 mb-4 cursor-pointer ${avatarErrorMessage ? 'text-red-400 bg-red-900/20' : 'text-green-400 bg-green-900/20'} rounded-lg`}
                onClick={() => {
                  setAvatarErrorMessage(null);
                  setAvatarSuccessMessage(null);
                }}
              >
                {avatarErrorMessage || avatarSuccessMessage}
              </div>
            )}
            
            {/* 模板选择按钮 */}
            {avatarImage && (
              <div className="flex justify-end mb-4">
                <button
                  onClick={toggleTemplateSelection}
                  className={`px-3 py-1 rounded-md transition-colors ${isTemplateSelectionVisible ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
                >
                  {isTemplateSelectionVisible ? '返回' : '选择模板'}
                </button>
              </div>
            )}
            
            {/* 模板选择界面 */}
            {isTemplateSelectionVisible ? (
              <TemplateSelector
                templates={templates}
                onSelect={handleTemplateSelect}
                selectedTemplateId={selectedTemplate?.id || null}
              />
            ) : (
              <AvatarSection 
                title={t('avatarSection.title')} 
                imageUrl={avatarImage?.dataUrl || null} 
                isLoading={isAvatarProcessing}
                onImageUpload={handleAvatarUpload} 
                onPromptSubmit={handleAvatarPromptSubmit} 
                onRetouchSubmit={handleAvatarRetouch} 
                onDownload={() => {
                  if (avatarImage) {
                    handleAvatarDownload(avatarImage);
                  }
                }}
                value={userPrompt}
              />
            )}
          </div>

          {/* 生成结果显示区域 */}
          <div className="bg-gray-800 rounded-lg shadow-md p-6 h-full flex flex-col border border-gray-700">
            {/* 生成结果区域消息提示 */}
            {(generatedErrorMessage || generatedSuccessMessage) && (
              <div 
                className={`px-4 py-2 mb-4 cursor-pointer ${generatedErrorMessage ? 'text-red-400 bg-red-900/20' : 'text-green-400 bg-green-900/20'} rounded-lg`}
                onClick={() => {
                  setGeneratedErrorMessage(null);
                  setGeneratedSuccessMessage(null);
                }}
              >
                {generatedErrorMessage || generatedSuccessMessage}
              </div>
            )}
            
            <GeneratedSection 
              title={t('generatedSection.title')} 
              imageUrl={generatedImage?.dataUrl || null} 
              isLoading={isGeneratedProcessing || isAvatarProcessing}
              onPromptSubmit={handleGeneratedPromptSubmit} 
              onRetouchSubmit={handleGeneratedRetouch} 
              onDownload={() => {
                if (generatedImage) {
                  handleGeneratedDownload(generatedImage);
                }
              }}
              onCrop={handleGeneratedCrop}
              onGenerate={handleGeneratedGenerate}
              canGenerate={!!(selectedTemplate && avatarImage)}
            />
            
            {/* 显示当前选择的模板 */}
            {selectedTemplate && (
              <div className="mt-4 p-3 bg-gray-700 rounded-lg border border-gray-600">
                <h3 className="font-medium mb-1 text-white">
                  {t('templateSection.currentTemplate')}: 
                  {typeof selectedTemplate.name === 'string' 
                    ? selectedTemplate.name 
                    : selectedTemplate.name[i18n.language as 'zh' | 'en'] || selectedTemplate.name.zh}
                </h3>
                <p className="text-sm text-gray-300">
                  {typeof selectedTemplate.prompt === 'string' 
                    ? selectedTemplate.prompt 
                    : selectedTemplate.prompt[i18n.language as 'zh' | 'en'] || selectedTemplate.prompt.zh}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-4 py-8 max-w-7xl text-center text-gray-400">
        <p>{t('generatedSection.footerText')}</p>
      </footer>
    </div>
  );
}

export default App;
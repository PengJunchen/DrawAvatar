import { GoogleGenAI, Modality } from '@google/genai';
import type { GenerateContentResponse } from '@google/genai';
import { HotspotPoint } from '../types';

// 调试标志 - 设置为 true 可以启用详细日志
const DEBUG = true;

// 调试日志函数
const debugLog = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[DEBUG] ${message}`);
    if (data !== undefined) {
      console.log(JSON.stringify(data, null, 2));
    }
  }
};

// 调试错误日志函数
const debugError = (message: string, error?: any) => {
  if (DEBUG) {
    console.error(`[ERROR] ${message}`);
    if (error !== undefined) {
      console.error(error);
    }
  }
};

debugLog('geminiService.ts 模块加载开始');

// API_KEY 应该从环境变量中获取
// 在Vite中使用import.meta.env访问环境变量
// 注意：环境变量名称应为GEMINI_API_KEY，而不是API_KEY
// 临时硬编码API密钥用于测试
const API_KEY: string = 
  // 首先尝试从环境变量获取
  import.meta.env.GEMINI_API_KEY;

// 添加调试信息，显示import.meta.env的内容
debugLog('import.meta.env内容:', {
  GEMINI_API_KEY: import.meta.env.GEMINI_API_KEY ? '已设置（显示前5个字符）: ' + import.meta.env.GEMINI_API_KEY.substring(0, 5) + '...' : '未设置',
  hasOwnProperty: Object.prototype.hasOwnProperty.call(import.meta.env, 'GEMINI_API_KEY')
});

if (!API_KEY) {
  debugError("GEMINI_API_KEY 未设置。应用将无法正常工作。");
} else {
  debugLog(`GEMINI_API_KEY 已设置: ${API_KEY.substring(0, 5)}...`);
}

// 初始化 Google Generative AI 客户端
debugLog('正在初始化 GoogleGenAI 客户端...');
const ai = new GoogleGenAI({ apiKey: API_KEY });
debugLog('GoogleGenAI 客户端已初始化');

/**
 * 将 base64 字符串转换为生成式部分
 * @param base64 base64 编码的字符串
 * @param mimeType MIME 类型
 * @returns 生成式部分对象
 */
const base64ToGenerativePart = (base64: string, mimeType: string) => {
  debugLog(`转换 base64 为生成式部分, MIME类型: ${mimeType}, base64长度: ${base64.length}`);
  return {
    inlineData: { data: base64, mimeType },
  };
};

/**
 * 从数据 URL 或普通图片URL中提取 base64 和 MIME 类型
 * @param imageUrl 图片URL (可以是data URL或普通URL)
 * @returns 包含 base64 和 MIME 类型的对象
 */
const extractFromDataUrl = async (imageUrl: string): Promise<{ base64: string; mimeType: string }> => {
  debugLog(`从图片URL提取信息, URL长度: ${imageUrl.length}`);
  
  // 如果是data URL
  if (imageUrl.startsWith('data:image/')) {
    const matches = imageUrl.match(/^data:([^;]+);\s*base64\s*,\s*(.+)$/i);
    if (!matches || matches.length !== 3) {
      debugError('数据URL格式无效');
      throw new Error('Invalid data URL format');
    }
    
    const result = {
      mimeType: matches[1],
      base64: matches[2],
    };
    
    debugLog(`提取成功, MIME类型: ${result.mimeType}, base64长度: ${result.base64.length}`);
    return result;
  }
  
  // 如果是普通URL
  try {
    debugLog('开始获取远程图片...');
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const mimeType = blob.type || 'image/jpeg';
    
    debugLog('将图片转换为base64...');
    const base64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    
    debugLog(`远程图片转换成功, MIME类型: ${mimeType}, base64长度: ${base64.length}`);
    return { mimeType, base64 };
  } catch (error) {
    debugError('获取远程图片失败', error);
    throw new Error('Failed to fetch remote image');
  }
};

/**
 * 从 API 响应中提取图像数据
 * @param response 从 Gemini API 返回的响应
 * @returns 图像数据 URL 或 null
 */
const extractImageFromResponse = (response: GenerateContentResponse): string | null => {
  try {
    // 检查响应结构
    if (!response.candidates || response.candidates.length === 0) {
      debugError('响应中没有候选项');
      return null;
    }
    
    if (!response.candidates[0].content || !response.candidates[0].content.parts) {
      debugError('响应中没有内容部分');
      return null;
    }
    
    // 从响应中提取图像
    debugLog('从响应中提取图像...');
    for (const part of response.candidates[0].content.parts) {
      debugLog('处理部分:', part);
      // 增强检查，确保 inlineData 和 data 存在且有效
      if (part.inlineData && part.inlineData.data && typeof part.inlineData.data === 'string') {
        // 确保 MIME 类型存在，默认为 image/png
        const mimeType = part.inlineData.mimeType || 'image/png';
        debugLog(`找到内联数据, MIME类型=${mimeType}, 数据长度=${part.inlineData.data.length}`);
        
        // 检查数据是否已经是完整的数据URL格式
        if (part.inlineData.data.startsWith('data:')) {
          return part.inlineData.data;
        }
        
        return `data:${mimeType};base64,${part.inlineData.data}`;
      }
    }
    
    debugError('响应中没有找到图像');
    return null;
  } catch (error) {
    debugError('提取图像时出错', error);
    return null;
  }
};

/**
 * 下载图像文件
 * @param imageUrl 图像数据URL
 * @param filename 要保存的文件名
 */
export const downloadImage = (imageUrl: string, filename: string): void => {
  try {
    // 检查图像URL是否有效
    if (!imageUrl || typeof imageUrl !== 'string') {
      debugError('无效的图像URL');
      throw new Error('Invalid image URL');
    }
    
    // 处理 base64 数据
    let dataUrl = imageUrl;
    if (!imageUrl.startsWith('data:')) {
      // 假设这是纯 base64 数据，添加 MIME 类型和前缀
      dataUrl = `data:image/png;base64,${imageUrl}`;
    }
    
    // 创建下载链接
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    
    // 添加到文档并触发下载
    document.body.appendChild(link);
    
    // 使用 setTimeout 确保在某些浏览器中正确执行
    setTimeout(() => {
      link.click();
      // 延迟移除链接，确保下载完成
      setTimeout(() => {
        document.body.removeChild(link);
      }, 100);
    }, 0);
    
    debugLog(`开始下载图像: ${filename}`);
  } catch (error) {
    debugError('下载图像时出错', error);
    throw error;
  }
};

/**
 * 根据提示词生成或修改图像
 * @param imageUrl 原始图像的数据URL
 * @param prompt 提示词
 * @returns 生成的图像数据URL
 */
export const generateImageFromPrompt = async (
  imageUrl: string,
  prompt: string
): Promise<string | null> => {
  // 设置断点位置 #2
  debugLog('断点位置 #2 - generateImageFromPrompt 开始执行');
  debugLog(`生成图像参数: prompt="${prompt}", imageUrl长度=${imageUrl?.length || 0}`);
  
  try {
    if (!imageUrl || !prompt) {
      debugError('图像URL或提示词缺失', { imageUrl: !!imageUrl, prompt: !!prompt });
      return null;
    }

    // 设置断点位置 #3
    debugLog('断点位置 #3 - 开始提取数据URL');
    
    const { base64, mimeType } = extractFromDataUrl(imageUrl);
    debugLog(`提取成功: MIME类型=${mimeType}, base64长度=${base64.length}`);
    
    const imagePart = base64ToGenerativePart(base64, mimeType);
    const textPart = { text: prompt };

    debugLog('准备发送请求到Gemini API...');
    debugLog('请求详情:', {
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [{ type: 'image', mimeType }, { type: 'text', text: prompt }] },
    });
    
    // 设置断点位置 #4
    debugLog('断点位置 #4 - 开始API调用');
    
    try {
      debugLog('执行API调用...');
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      
      // 设置断点位置 #5
      debugLog('断点位置 #5 - API调用完成，处理响应');
      
      // 打印原始响应以进行调试
      debugLog('收到API响应:', response);
      
      // 使用统一的响应处理函数提取图像
      return extractImageFromResponse(response);
    } catch (error) {
      debugError('API请求失败', error);
      return null;
    }
  } catch (error) {
    debugError('生成图像时出错', error);
    return null;
  }
};

/**
 * 根据模板和照片生成头像
 * @param templateImageUrl 模板图像的数据URL
 * @param photoImageUrl 照片的数据URL
 * @param templatePrompt 模板提示词
 * @returns 生成的头像数据URL
 */
export const generateImageFromTemplateAndPhoto = async (
  templateImageUrl: string,
  photoImageUrl: string,
  templatePrompt: string
): Promise<string | null> => {
  // 设置断点位置 #6
  debugLog('断点位置 #6 - generateImageFromTemplateAndPhoto 开始执行');
  debugLog(`生成头像参数: templatePrompt="${templatePrompt}", templateImageUrl长度=${templateImageUrl?.length || 0}, photoImageUrl长度=${photoImageUrl?.length || 0}`);
  
  try {
    if (!templateImageUrl || !photoImageUrl) {
      debugError('模板图像URL或照片URL缺失', { 
        templateImageUrl: !!templateImageUrl, 
        photoImageUrl: !!photoImageUrl 
      });
      return null;
    }

    // 设置断点位置 #7
    debugLog('断点位置 #7 - 开始提取模板和照片数据');
    
    const [{ base64: templateBase64, mimeType: templateMimeType }, { base64: photoBase64, mimeType: photoMimeType }] = await Promise.all([
      extractFromDataUrl(templateImageUrl),
      extractFromDataUrl(photoImageUrl)
    ]);
    
    debugLog(`模板提取成功: MIME类型=${templateMimeType}, base64长度=${templateBase64.length}`);
    debugLog(`照片提取成功: MIME类型=${photoMimeType}, base64长度=${photoBase64.length}`);

    const templatePart = base64ToGenerativePart(templateBase64, templateMimeType);
    const photoPart = base64ToGenerativePart(photoBase64, photoMimeType);
    
    // 构建提示词，包括模板和照片的描述
    const fullPrompt = templatePrompt || 
      "使用第一张图片作为模板样式，将第二张图片中的人物转换为该样式。保持800x800像素，72dpi的高质量图像。";
    
    const textPart = { text: fullPrompt };

    debugLog('准备发送模板和照片请求到Gemini API...');
    debugLog('模板和照片请求详情:', {
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [{ type: 'template' }, { type: 'photo' }, { type: 'text', text: fullPrompt }] },
    });
    
    // 设置断点位置 #8
    debugLog('断点位置 #8 - 开始模板和照片API调用');
    
    try {
      debugLog('执行模板和照片API调用...');
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [templatePart, photoPart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      
      // 设置断点位置 #9
      debugLog('断点位置 #9 - 模板和照片API调用完成，处理响应');
      
      // 打印原始响应以进行调试
      debugLog('收到模板和照片API响应:', response);
      
      // 使用统一的响应处理函数提取图像
      return extractImageFromResponse(response);
    } catch (error) {
      debugError('模板和照片API请求失败', error);
      return null;
    }
  } catch (error) {
    debugError('生成头像时出错', error);
    return null;
  }
};

/**
 * 修饰图像的特定区域
 * @param imageUrl 原始图像的数据URL
 * @param prompt 提示词
 * @param hotspot 热点位置
 * @returns 修饰后的图像数据URL
 */
export const retouchImage = async (
  imageUrl: string,
  prompt: string,
  hotspot: HotspotPoint
): Promise<string | null> => {
  // 设置断点位置 #10
  debugLog('断点位置 #10 - retouchImage 开始执行');
  debugLog(`修饰图像参数: prompt="${prompt}", imageUrl长度=${imageUrl?.length || 0}, hotspot=`, hotspot);
  
  try {
    if (!imageUrl || !prompt) {
      debugError('图像URL或提示词缺失', { imageUrl: !!imageUrl, prompt: !!prompt });
      return null;
    }

    // 设置断点位置 #11
    debugLog('断点位置 #11 - 开始提取修饰图像数据');
    
    const { base64, mimeType } = extractFromDataUrl(imageUrl);
    debugLog(`修饰图像提取成功: MIME类型=${mimeType}, base64长度=${base64.length}`);
    
    const imagePart = base64ToGenerativePart(base64, mimeType);
    
    // 构建包含热点位置的提示词
    const fullPrompt = `在图像的坐标 x=${hotspot.x}, y=${hotspot.y} 处: ${prompt}`;
    const textPart = { text: fullPrompt };

    debugLog('准备发送修饰请求到Gemini API...');
    debugLog('修饰请求详情:', {
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [{ type: 'image' }, { type: 'text', text: fullPrompt }] },
      hotspot,
    });
    
    // 设置断点位置 #12
    debugLog('断点位置 #12 - 开始修饰API调用');
    
    try {
      debugLog('执行修饰API调用...');
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [imagePart, textPart] },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      
      // 设置断点位置 #13
      debugLog('断点位置 #13 - 修饰API调用完成，处理响应');
      
      // 打印原始响应以进行调试
      debugLog('收到修饰API响应:', response);
      
      // 使用统一的响应处理函数提取图像
      return extractImageFromResponse(response);
    } catch (error) {
      debugError('修饰API请求失败', error);
      return null;
    }
  } catch (error) {
    debugError('修饰图像时出错', error);
    return null;
  }
};

/**
 * 模拟生成图像响应
 * 当 API 调用失败时使用此函数返回模拟数据
 * @param originalImageUrl 原始图像 URL
 * @returns 模拟的图像 URL
 */
// 移除mockGenerateImageResponse函数

/**
 * 仅通过文本提示词生成图像
 * @param prompt 提示词
 * @returns 生成的图像数据URL
 */
export const generateImageFromTextPrompt = async (
  prompt: string
): Promise<string | null> => {
  debugLog('generateImageFromTextPrompt 开始执行');
  debugLog(`生成图像参数: prompt="${prompt}"`);
  
  try {
    if (!prompt) {
      debugError('提示词缺失');
      return null;
    }

    // 构建请求
    const textPart = { text: prompt };

    debugLog('准备发送纯文本提示词请求到Gemini API...');
    debugLog('文本请求详情:', {
      model: 'gemini-2.5-flash-image-preview',
      contents: { parts: [{ type: 'text', text: prompt }] },
    });
    
    try {
      debugLog('执行纯文本提示词API调用...');
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image-preview',
        contents: { parts: [textPart] },
        config: {
          responseModalities: [Modality.IMAGE, Modality.TEXT],
        },
      });
      
      debugLog('收到纯文本提示词API响应:', response);
      
      // 使用统一的响应处理函数提取图像
      return extractImageFromResponse(response);
    } catch (error) {
      debugError('纯文本提示词API请求失败', error);
      return null;
    }
  } catch (error) {
    debugError('生成图像时出错', error);
    return null;
  }
};

// 导出工具函数
export const utils = {
  base64ToGenerativePart,
  extractFromDataUrl,
  extractImageFromResponse,
  downloadImage
};
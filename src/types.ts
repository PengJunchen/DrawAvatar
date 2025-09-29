// 语言类型
export type Lang = 'en' | 'zh';

// 裁剪类型
export type CropType = 'rect' | 'circle';

// 热点点击位置
export interface HotspotPoint {
  x: number;
  y: number;
}

// 模板定义
export interface Template {
  id: string;
  name: string | { zh: string; en: string };
  imageUrl: string;
  thumbnailUrl: string;
  prompt: string | { zh: string; en: string };
}

export type TemplateName = string | { zh: string; en: string };
export type TemplatePrompt = string | { zh: string; en: string };

// 图像信息接口
export interface ImageInfo {
  dataUrl: string;
  filename: string;
}

// 默认提示词
export interface DefaultPrompt {
  id: string;
  text: {
    en: string;
    zh: string;
  };
}
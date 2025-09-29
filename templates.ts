import { Template } from '../types';

// 头像模板数据
export const templates: Template[] = [
  {
    id: 'template-1',
    name: '圆形框架',
    imageUrl: '/templates/circle-frame.png',
    thumbnailUrl: '/templates/circle-frame.png',
    prompt: '将照片放在一个精美的圆形框架中，保持主体清晰，800x800像素，72dpi高质量图像'
  },
  {
    id: 'template-2',
    name: '水彩风格',
    imageUrl: '/templates/watercolor.png',
    thumbnailUrl: '/templates/watercolor.png',
    prompt: '将照片转换为水彩画风格，保持主体特征清晰可辨，800x800像素，72dpi高质量图像'
  },
  {
    id: 'template-3',
    name: '卡通化',
    imageUrl: '/templates/cartoon.png',
    thumbnailUrl: '/templates/cartoon.png',
    prompt: '将照片转换为卡通风格，保持面部特征和表情，800x800像素，72dpi高质量图像'
  },
  {
    id: 'template-4',
    name: '复古风格',
    imageUrl: '/templates/vintage.png',
    thumbnailUrl: '/templates/vintage.png',
    prompt: '将照片转换为复古风格，添加老照片效果和纹理，800x800像素，72dpi高质量图像'
  },
  {
    id: 'template-5',
    name: '霓虹轮廓',
    imageUrl: '/templates/neon.png',
    thumbnailUrl: '/templates/neon.png',
    prompt: '创建照片的霓虹灯轮廓效果，在黑色背景上突出主体，800x800像素，72dpi高质量图像'
  },
  {
    id: 'template-6',
    name: '国旗背景',
    imageUrl: '/templates/flag.png',
    thumbnailUrl: '/templates/flag.png',
    prompt: '将照片与国旗背景融合，确保国旗比例和颜色完全准确，800x800像素，72dpi高质量图像'
  }
];

// 获取默认模板缩略图URL
export const getPlaceholderTemplateUrl = () => '/templates/placeholder.png';
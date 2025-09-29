# 头像绘制工具

一个基于Gemini API的头像绘制工具，支持模板选择、图像上传、提示词修改、裁剪和修饰等功能。

## 功能特点

- 双区域布局：头像上传/模板选择区和生成结果区
- 支持图像上传和模板选择
- 支持多语言提示词输入（中英文）
- 支持矩形和圆形裁剪
- 支持点击区域修饰（类似Retouch功能）
- 支持30+种预设模板
- 完整的中英文界面切换
- 深色主题设计
- 响应式布局，适配移动设备

## 技术栈

- React + TypeScript
- Vite 构建工具
- Tailwind CSS 样式框架
- react-i18next 国际化
- Google Generative AI SDK
- 自定义图像处理工具链

## 安装与运行

1. 克隆仓库

```bash
git clone <repository-url>
cd AvatarDrawing
```

2. 安装依赖

```bash
npm install
```

3. 配置环境变量

创建.env文件并添加Gemini API密钥：

```bash
VITE_GEMINI_API_KEY=your_api_key_here
```

4. 启动开发服务器

```bash
npm run dev
```

5. 构建生产版本

```bash
npm run build
```

## 项目结构

```
AvatarDrawing/
├── public/
│   ├── templates/       # 模板JSON和图片
│   └── images/          # 模板预览图
├── src/
│   ├── components/      # React组件
│   ├── locales/         # 国际化资源(zh.json/en.json)
│   ├── services/        # API服务
│   ├── types/           # 类型定义
│   ├── App.tsx          # 主应用组件
│   ├── i18n.ts          # 国际化配置
│   └── main.tsx         # 入口文件
├── .env.example         # 环境变量示例
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 使用说明

1. 上传个人头像照片
2. 从30+预设模板中选择喜欢的风格
3. 在输入框中修改或补充提示词（中英文均可）
4. 点击"生成"按钮创建个性化头像
5. 可选操作：
   - 使用裁剪工具调整图像
   - 点击特定区域进行局部修饰
   - 重新生成不同版本
6. 下载最终满意的头像

## 注意事项

- 所有生成的图像均为800x800像素，72dpi高质量输出
- 模板提示词已优化确保最佳生成效果
- 建议使用清晰的正脸照片以获得最好效果
- 生成时间取决于网络状况，通常10-30秒
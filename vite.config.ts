import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    // 使用define选项直接定义环境变量
    define: {
      'import.meta.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY || '')
    },
    // 开发模式下的sourcemap配置
    devSourcemap: true,
    // 构建时的sourcemap配置
    build: {
      sourcemap: true,
    },
    // 开发服务器配置
    server: {
      hmr: true
    }
  };
});
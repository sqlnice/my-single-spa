import { defineConfig } from 'vite'
import { resolve } from 'path'
export default defineConfig({
  plugins: [],
  build: {
    target: 'modules', // 默认 modules
    outDir: 'lib',
    sourcemap: true,
    // 库模式
    lib: {
      entry: resolve(__dirname, 'packages/index.js'), //指定组件编译入口文件
      name: 'mySingleSpa',
      fileName: 'my-single-spa'
    },
    watch: true
  }
})

import { defineConfig, loadEnv } from "vite";
import uni from "@dcloudio/vite-plugin-uni";
import AutoImport from "unplugin-auto-import/vite";
// import VComponents from 'unplugin-vue-components/vite'
import Components from "@uni-helper/vite-plugin-uni-components";
import { NutResolver } from "nutui-uniapp";

export default defineConfig(({ command, mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
    define: {
      "process.env": env
    },
    css: {
      postcss: {
        plugins: [require("tailwindcss"), require("autoprefixer")]
      },
      preprocessorOptions: {
        scss: {
          additionalData: '@import "nutui-uniapp/styles/variables.scss";'
        }
      }
    },
    plugins: [
      Components({
        resolvers: [NutResolver()]
      }),
      uni(),
      // UnoCSS(),
      AutoImport({
        imports: ["vue", "uni-app", "pinia"],
        dirs: ["src/**/index.ts", "src/api/*.ts"]
      })
    ]
  };
});

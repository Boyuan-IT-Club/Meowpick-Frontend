import { createSSRApp } from "vue";
import App from "./App.vue";
import * as Pinia from "pinia";
import { createUnistorage } from "pinia-plugin-unistorage";

import "./main.scss";

export function createApp() {
  const app = createSSRApp(App);
  const pinia = Pinia.createPinia();
  pinia.use(createUnistorage());
  app.use(pinia);
  uni.addInterceptor("navigateTo", {
    invoke(e: { url: string }) {
      useRouteStore().setUrl(e.url);
    }
  });

  return {
    app,
    Pinia
  };
}

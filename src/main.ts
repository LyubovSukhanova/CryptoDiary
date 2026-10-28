import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";
import PrimeVue from "primevue/config";
import { ru } from "primelocale/js/ru.js";
import Aura from "@primeuix/themes/aura"; // Импортируем голубую тему Aura
import { ToastService } from "primevue";
import "primeicons/primeicons.css";
import router from "./router";
import { createPinia } from "pinia";

const app = createApp(App);

app.use(PrimeVue, {
    locale: ru,
    theme: {
        preset: Aura, // По умолчанию Aura — это сине-голубая тема
        options: {
            darkModeSelector: ".my-app-dark", // Класс для тёмной темы
        },
    },
});

const pinia = createPinia();
app.use(router);
app.use(pinia);
app.use(ToastService);
app.mount("#app");

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
    plugins: [vue()],
    server: {
        proxy: {
            // Настройка прокси для API
            "/api": {
                target: "https://api.coinlore.net", // Целевой адрес API
                changeOrigin: true, // Изменяет origin заголовка Host на target
            },
        },
    },
});

import vue from "@vitejs/plugin-vue";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [vue()],
    base: "/CryptoDiary/",
    server: {
        proxy: {
            // Перехватываем запросы, начинающиеся с /api
            "/api": {
                target: "https://api.coinlore.net",
                changeOrigin: true,
                // Убираем /api из пути, чтобы на CoinLore ушёл чистый /api/...
                // (если эндпоинт уже содержит /api, rewrite не нужен, но с ним безопаснее)
                rewrite: (path) => path.replace(/^\/api/, "/api"),
            },
        },
    },
});

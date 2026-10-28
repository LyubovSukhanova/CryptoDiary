// клиент подключения к базе supabase
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

export const supabase = createClient<Database>(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY,
    {
        auth: {
            persistSession: true, // Сессия сохраняется в localStorage и не теряется при обновлении страницы
            autoRefreshToken: true, // Автоматическое обновление токена
            detectSessionInUrl: true,
        },
    },
);

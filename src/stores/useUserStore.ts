import { ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";

export interface User {
    id: string; // Auth использует UUID
    name: string;
    login: string;
}

export const useUserStore = defineStore("user", () => {
    const user = ref<User | null>(null);
    const error = ref<string | null>(null);

    // Регистрация: фиктивный email + метаданные
    const registerUser = async (login: string, password: string, name: string): Promise<boolean> => {
        error.value = null;
        const fakeEmail = `${login}@pony-mail.strange`;

        const { data, error: sbError } = await supabase.auth.signUp({
            email: fakeEmail,
            password,
            options: {
                data: { login, name }, // Будет записано в raw_user_meta_data, триггер запишет в profiles
            },
        });

        if (sbError) {
            error.value = sbError.message;
            return false;
        }

        // Если в проекте включено подтверждение email, сессия может быть null, нужно отключить подтверждение email в настройках Auth
        if (data.user) {
            user.value = {
                id: data.user.id,
                name: data.user.user_metadata.name,
                login: data.user.user_metadata.login,
            };
        }
        return true;
    };

    // Вход: сначала найдите email по логину, затем войдите через Auth
    const loginUser = async (login: string, password: string): Promise<string> => {
        user.value = null;
        error.value = null;

        // 1. Найдите email по логину (profiles доступна для чтения, но email здесь нет)
        const fakeEmail = `${login}@pony-mail.strange`;

        // 2. Войдите напрямую с фиктивным email
        const { data, error: sbError } = await supabase.auth.signInWithPassword({
            email: fakeEmail,
            password,
        });

        if (sbError) {
            error.value = sbError.message;
            return "not found"; // Или "error", в зависимости от потребностей
        }

        if (data.user) {
            user.value = {
                id: data.user.id,
                name: data.user.user_metadata.name,
                login: data.user.user_metadata.login,
            };
            return "ok";
        }
        return "error";
    };

    // Выход
    const signOutUser = async (): Promise<void> => {
        await supabase.auth.signOut();
        user.value = null;
    };

    return { user, error, registerUser, loginUser, signOutUser };
});

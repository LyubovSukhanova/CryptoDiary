<template>
    <Dialog :visible="visible" modal header="Регистрация" @update:visible="emit('close', false)"
        style="width: 30vw; height: 50vh;">
        <div class="input-caption">
            <span class="caption">Логин</span>
            <InputText v-model="login" />
        </div>
        <div class="input-caption">
            <span class="caption">Пароль</span>
            <IconField iconPosition="right">
                <InputText v-model="password" :type="showPassword ? 'text' : 'password'" style="width: 100%;" />
                <InputIcon :class="['pi', showPassword ? 'pi-eye' : 'pi-eye-slash', 'cursor-pointer']"
                    @click="showPassword = !showPassword" />
            </IconField>
        </div>
        <div class="input-caption">
            <span class="caption">Отображаемое имя</span>
            <InputText v-model="name" />
        </div>

        <template #footer>
            <Button severity="primary" label="OK" @click="onApply" style="width: 100px;" />
            <Button severity="secondary" label="Отмена" @click="onCancel" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Button, Dialog, InputText, IconField, InputIcon } from 'primevue';
import { useToast } from 'primevue';
import { ref } from 'vue';
import { useUserStore } from '../../stores/useUserStore';

interface Props {
    visible: boolean;
};

const props = withDefaults(defineProps<Props>(), {
    visible: false,
});

const emit = defineEmits<{
    close: [value: boolean];
}>();

const toast = useToast();
const userStore = useUserStore();
const login = ref<string>('');
const password = ref<string>('');
const showPassword = ref<boolean>(false);
const name = ref<string>('');

const onApply = async (): Promise<void> => {
    if (!checkFields()) return;

    const success = await userStore.registerUser(
        login.value,
        password.value,
        name.value
    );

    if (success) {
        toast.add({
            severity: 'success',
            summary: 'Успешная регистрация',
            detail: 'Аккаунт создан',
            life: 3000,
        });
        emit('close', false);
    } else {
        toast.add({
            severity: 'error',
            summary: 'Ошибка регистрации',
            detail: userStore.error ?? 'Не удалось создать аккаунт',
            life: 3000,
        });
    }
};

const checkFields = (): boolean => {
    if (!name.value || !login.value || !password.value) {
        toast.add({
            severity: 'warn',
            summary: 'Заполните поля',
            detail: 'Все поля обязательны',
            life: 3000,
        });
        return false;
    };
    return true;
};

const onCancel = (): void => {
    emit('close', false);
};

</script>
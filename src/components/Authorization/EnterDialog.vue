<!-- Дилоговое модальное окно для входа в личный кабинет -->
<template>
    <Dialog :visible="visible" modal header="Вход" @update:visible="emit('close', false)"
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
        <template #footer>
            <Button severity="primary" label="Вход" @click="onEnter" style="width: 100px;" />
            <Button severity="secondary" label="Отмена" @click="onCancel" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Dialog, IconField, InputText, InputIcon, Button, useToast } from 'primevue';
import { ref } from 'vue';
import { useUserStore } from '../../stores/useUserStore';
import { useDiaryStore } from '../../stores/useDiaryStore';

const userStore = useUserStore();
const diaryStore = useDiaryStore();
const toast = useToast();

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
})

const login = ref<string>('');
const password = ref<string>('');
const showPassword = ref<boolean>(false);

const emit = defineEmits<{
    close: [value: boolean];
}>();

const onCancel = (): void => {
    emit('close', false);
};

const onEnter = async (): Promise<void> => {
    const result = await userStore.loginUser(login.value, password.value);

    if (result === 'not found') {
        toast.add({
            severity: 'error',
            summary: 'Ошибка входа',
            detail: 'Неверный логин или пароль',
            life: 3000,
        });
    } else if (result === 'error') {
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: userStore.error ?? 'Неизвестная ошибка',
            life: 3000,
        });
    } else if (result === 'ok') {
        toast.add({
            severity: 'success',
            summary: 'Успех',
            detail: `Добро пожаловать, ${userStore.user?.name ?? ''}!`,
            life: 3000,
        });
        emit('close', true);
        if (userStore.user?.id) {
            await diaryStore.fetchUserRecords(userStore.user.id);
        }
    }
};

</script>

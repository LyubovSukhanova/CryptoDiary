<!-- Диалог подтверждения выхода из учетной записи -->
<template>
    <Dialog :visible="visible" modal header="Подтверждение выхода" @update:visible="emit('close', false)"
        style="width: 20vw; height: 30vh;">
        <span>Вы действительно хотите выйти?</span>
        <template #footer>
            <Button severity="primary" label="Да" style="width: 100px;" @click="onExit" />
            <Button severity="secondary" label="Нет" @click="onCancel" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Dialog, Button } from 'primevue';
import { useUserStore } from '../../stores/useUserStore';

const userStore = useUserStore();

interface Props {
    visible: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
})

const emit = defineEmits<{
    close: [value: boolean];
}>();

const onCancel = () => {
    emit('close', false);
};

const onExit = () => {
    userStore.signOutUser();
    emit('close', false);
}
</script>
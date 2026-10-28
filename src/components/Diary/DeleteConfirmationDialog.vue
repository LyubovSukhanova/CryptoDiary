<!-- Диалог подтверждения удаления записи дневника -->
<template>
    <Dialog :visible="visible" modal header="Подтверждение удаления" @update:visible="(val) => emit('close', val)"
        style="width: 20vw; height: 30vh;">
        <span>Вы действительно хотите удалить эту запись?</span>
        <template #footer>
            <Button severity="primary" label="Да" style="width: 100px;" @click="onRecordDelete" />
            <Button severity="secondary" label="Нет" @click="onCancel" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { Dialog, Button, useToast } from 'primevue';
import { useDiaryStore } from '../../stores/useDiaryStore';

const diaryStore = useDiaryStore();
const toast = useToast();

interface Props {
    visible: boolean;
    recordId: number;
}

const props = withDefaults(defineProps<Props>(), {
    visible: false,
    recordId: 0,
})

const emit = defineEmits<{
    close: [value: boolean];
}>();

const onCancel = () => {
    emit('close', false);
};

const onRecordDelete = async (): Promise<void> => {
    try {
        await diaryStore.deleteRecord(props.recordId);
        emit('close', false);
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Неизвестная ошибка';
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: `Произошла ошибка: ${message}`,
            life: 3000,
        });
    };
};
</script>
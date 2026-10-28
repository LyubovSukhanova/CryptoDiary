<!-- Корневой компонент дневника пользователя -->
<template>
    <div v-if="user" class="vertical">
        <h2>Мои покупки/продажи</h2>
        <Button label="Добавить запись" @click="onAddNewRecord" style="margin-left: auto; margin-right: 10px;" />
        <div class="horizontal padding10 gap10">
            <div class="table-wrapper table">
                <DataTable :value="records" dataKey="id" contextMenu selectionMode="single"
                    v-model:selection="selectedRecord" v-model:contextMenuSelection="contextMenuRecord"
                    @row-contextmenu="onRowContextMenu" @row-dblclick="onEditRecord" scroll-height="400px">
                    <Column field="logged_at" header="Дата" sortable>
                        <template #body="{ data }">
                            {{ new Date(data.logged_at).toLocaleString('ru-RU') }}
                        </template>
                    </Column>
                    <Column field="coin_name" header="Монета" sortable />
                    <Column field="coin_symbol" header="Символ" sortable />
                    <Column field="number" header="Количество" sortable />
                    <Column field="price" header="Цена, $" sortable />
                    <Column field="price" header="Сумма, $">
                        <template #body="{ data }">
                            <div v-if="data.number && data.price">
                                {{ data.number * data.price }}
                            </div>
                        </template>
                    </Column>
                    <Column field="income" header="Купля/Продажа">
                        <template #body="{ data }">
                            <div v-if="data.income" class="sale-purchase purchase">+</div>
                            <div v-else class="sale-purchase sale">-</div>
                        </template>
                    </Column>
                </DataTable>
            </div>
            <div class="vertical right-part">
                <ProfitLossCard />
            </div>
        </div>
        <ContextMenu ref="cm" :model="menuModel" />
        <DeleteConfirmationDialog :visible="deleteDialogVisible" :record-id="selectedRecordId"
            @close="deleteDialogVisible = $event" />
    </div>
    <div v-else>
        Нет доступа
    </div>
</template>

<script setup lang="ts">
import { Button, DataTable, Column, ContextMenu, useToast } from 'primevue';
import { useUserStore } from '../stores/useUserStore';
import { useDiaryStore, type DiaryRecord } from '../stores/useDiaryStore';
import DeleteConfirmationDialog from '../components/Diary/DeleteConfirmationDialog.vue';
import ProfitLossCard from '../components/Diary/ProfitLossCard.vue';
import { storeToRefs } from 'pinia';
import { ref, onMounted, computed } from 'vue';
import router from '../router';

interface ContextMenuRef {
    show: (event: Event) => void;
    hide: () => void;
}

const toast = useToast();

const userStore = useUserStore();
const diaryStore = useDiaryStore();

const { user } = storeToRefs(userStore);
const { records } = storeToRefs(diaryStore);
const recordId = ref<number | undefined>(undefined);

const selectedRecordId = computed((): number => {
    return selectedRecord.value?.id || 0;
});

const cm = ref<ContextMenuRef>();
const selectedRecord = ref<DiaryRecord | undefined>(undefined);        // для обычного выделения
const contextMenuRecord = ref<DiaryRecord | undefined>(undefined);    // для контекстного меню
const deleteDialogVisible = ref<boolean>(false);

const menuModel = ref([
    {
        label: 'Редактировать',
        icon: 'pi pi-pencil',
        command: () => {
            router.push({ name: 'record_edit', params: { id: contextMenuRecord.value?.id } });
        }
    },
    {
        label: 'Удалить',
        icon: 'pi pi-trash',
        command: () => {
            deleteDialogVisible.value = true;
        }
    }
]);

const onRowContextMenu = (event: any) => {
    contextMenuRecord.value = event.data;
    cm.value?.show(event.originalEvent);
};

onMounted(async () => {
    if (user.value?.id) {
        await diaryStore.fetchUserRecords(user.value.id);
    }
});

const onAddNewRecord = async () => {
    if (!user.value?.id) return;
    try {
        recordId.value = await diaryStore.createRecord(user.value.id);
        toast.add({
            severity: 'success',
            summary: 'Готово',
            detail: 'Запись добавлена',
            life: 3000,
        });
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Неизвестная ошибка';
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: `Произошла ошибка: ${message}`,
            life: 3000,
        });
    };
    router.push({ name: 'record_edit', params: { id: recordId.value } })
}

const onEditRecord = (event: any): void => {
    router.push({ name: 'record_edit', params: { id: event.data.id } });
};

</script>

<style scoped>
.table {
    width: 60%;
}

.right-part {
    width: 40%;
}

.sale-purchase {
    font-size: large;
    font-weight: 700;
}

.sale {
    color: var(--sale);
}

.purchase {
    color: var(--purchase);
}
</style>

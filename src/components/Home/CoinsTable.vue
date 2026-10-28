<template>
    <div class="table-wrapper">
        <DataTable :value="coinsTop100" selectionMode="single" v-model:selection="selectedCoin"
            @row-select="handleRowSelect" dataKey="id" scroll-height="500px">
            <Column field="symbol" header="Символ" sortable style="width: 120px;" />
            <Column field="name" header="Наименование" sortable />
            <Column field="rank" header="Ранг" sortable style="width: 120px;" />
            <Column field="price_usd" header="Цена" sortable style="width: 120px;">
                <template #body="{ data }">
                    {{ formatPrice(data.price_usd) }}
                </template>
            </Column>
            <Column field="percent_change_24h" header="Изменение цены за 24 часа" sortable>
                <template #body="{ data }">
                    {{ addPercent(data.percent_change_24h) }}
                </template>
            </Column>
            <Column field="csupply" header="Текущее предложение" sortable />
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useCoinsStore } from '../../stores/useCoinsStore'
import type { Coin } from '../../stores/useCoinsStore'
import { Column, DataTable } from 'primevue'
import { ref } from 'vue'

interface RowSelectEvent<T> {
    originalEvent: Event,
    data: T,
    index: number,
    type: string
}

const coinsStore = useCoinsStore();
// Предполагаем, что coinsTop100 — это ref с данными
const { coinsTop100 } = storeToRefs(coinsStore);

const selectedCoin = ref<Coin | null>(null);

const addPercent = (n: number): string => `${n.toFixed(1).replace('.', ',')}%`;

const formatPrice = (n: number): string => `${n.toFixed(2).replace('.', ',')}$`;

// Обработчик выделения строки
const handleRowSelect = (event: RowSelectEvent<Coin>) => {
    coinsStore.setSelectedCoin(event.data);
}

</script>

<style scoped>
.table-wrapper {
    width: fit-content;
}
</style>
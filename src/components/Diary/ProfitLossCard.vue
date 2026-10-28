<!-- Карточка прибыли и потерь -->
<template>
    <div class="card-container">
        <div v-if="loading" class="muted">Загрузка цен…</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <template v-else>
            <DataTable :value="detailedCoinsPrices">
                <Column />
            </DataTable>
            <div class="total">
                <span class="label">Текущая стоимость</span>
                <span class="value">${{ totals.currentValue.toFixed(2) }}</span>
            </div>
            <div class="pnl" :class="totals.pnl >= 0 ? 'gain' : 'loss'">
                <span class="arrow">{{ totals.pnl >= 0 ? '▲' : '▼' }}</span>
                {{ totals.pnl >= 0 ? '+' : '' }}{{ totals.pnl.toFixed(2) }} $
                ({{ totals.pnlPercent.toFixed(2) }}%)
            </div>
            <div class="muted">Себестоимость: ${{ totals.cost.toFixed(2) }}</div>
            {{ detailedCoinsPrices }}
        </template>
    </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useDiaryStore } from '../../stores/useDiaryStore'
import { usePortfolioAnalytics } from '../../composables/usePortfolioAnalytics'
import { Column, DataTable } from 'primevue'

const diaryStore = useDiaryStore()
const { records } = storeToRefs(diaryStore)

const { loading, error, totals, detailedCoinsPrices } = usePortfolioAnalytics(records)


</script>

<style scoped>
.gain {
    color: var(--purchase, #10b981);
}

.loss {
    color: var(--sale, #ef4444);
}

.muted {
    color: var(--text-muted);
    font-size: 0.9rem;
}
</style>

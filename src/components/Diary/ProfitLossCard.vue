<!-- Карточка прибыли и потерь -->
<template>
    <div class="card-container">
        <h3>Стоимость портфеля</h3>
        <div v-if="loading" class="muted">Загрузка цен…</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <template v-else>
            <DataTable :value="detailedCoinsPrices" dataKey="id">
                <Column field="symbol" header="Монета" />
                <Column field="current_number" header="Количество" />
                <Column field="prime_cost" header="Себестоимость, $">
                    <template #body="{ data }">
                        <span>{{ data.prime_cost.toFixed(2).replaceAll('.', ',') }}</span>
                    </template>
                </Column>
                <Column field="current_cost" header="Текущая стоимость, $">
                    <template #body="{ data }">
                        <span>{{ data.current_cost.toFixed(2).replaceAll('.', ',') }}</span>
                    </template>
                </Column>
                <Column header="Прибыль/Убыток, $">
                    <template #body="{ data }">
                        <span :class="data.current_cost - data.prime_cost >= 0 ? 'profit' : 'loss'">
                            {{ (data.current_cost - data.prime_cost).toFixed(2).replaceAll('.', ',') }}
                        </span>
                    </template>
                </Column>
            </DataTable>
            <div class="total">
                <span style="padding-right: 5px;">Текущая стоимость портфеля</span>
                <span v-if="totals">${{ totals.currentValue.toFixed(2).replaceAll('.', ',') }}</span>
            </div>
            <div :class="totals && totals.pnl >= 0 ? 'profit' : 'loss'">
                <span v-if="totals">{{ totals.pnl >= 0 ? '▲' : '▼' }}</span>
                <span v-if="totals">
                    {{ totals.pnl >= 0 ? '+' : '' }}{{ `$${totals.pnl.toFixed(2).replaceAll('.', ',')}` }}
                </span>
                <span v-if="totals">({{ totals.pnlPercent.toFixed(2) }}%)</span>
            </div>
            <div v-if="totals" class="muted">Себестоимость: ${{ totals.cost.toFixed(2).replaceAll('.', ',') }}</div>
        </template>
    </div>
</template>

<script setup lang="ts">
import { Column, DataTable } from 'primevue'
import type { Totals, CoinsPricesInfo } from '../../composables/usePortfolioAnalytics'

interface Props {
    loading: boolean;
    error: string | null;
    totals: Totals | null;
    detailedCoinsPrices: CoinsPricesInfo[] | [];
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    error: null,
    totals: null,
    detailedCoinsPrices: () => [],
});


</script>

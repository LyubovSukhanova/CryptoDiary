<template>
    <div class="asset-container">
        <div ref="chartEl" class="chart"></div>
        <div v-if="loading" class="overlay">Загрузка цен...</div>
        <div v-else-if="error" class="overlay error">{{ error }}</div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from 'vue';
import Plotly from 'plotly.js-dist-min';
import type { Data, Layout } from 'plotly.js-dist-min';
import type { Allocation } from '../../composables/usePortfolioAnalytics';

interface Props {
    loading: boolean;
    error: string | null;
    allocation: Allocation[] | [];
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    error: null,
    allocation: () => [],
});

const chartEl = ref<HTMLElement | null>(null);

function renderChart() {
    if (!chartEl.value) return;
    const items = props.allocation;
    if (items.length === 0) {
        Plotly.purge(chartEl.value);
        return;
    }

    const data: Data[] = [{
        type: "pie",
        labels: items.map(i => i.symbol),
        values: items.map(i => i.value),
        textinfo: "label+percent",
        hovertemplate: "%{label}<br>Стоимость: $%{value:,.2f}<br>Доля: %{percent}<extra></extra>",
        marker: {
            colors: ["#F7931A", "#627EEA", "#26A17B"],
        },
    }];

    const layout: Partial<Layout> = {
        title: { text: 'Распределение активов' },
        showlegend: true,
        margin: { t: 40, b: 40, l: 40, r: 40 },
    };

    Plotly.react(chartEl.value, data, layout, { responsive: true });
    // принудительный resize после отрисовки
    requestAnimationFrame(() => {
        if (chartEl.value) Plotly.Plots.resize(chartEl.value);
    });
}

onMounted(renderChart);

watch([() => props.allocation, () => props.loading], () => {
    if (!props.loading && chartEl.value) {
        renderChart()
    }
}, { deep: true, flush: 'post' })

onUnmounted(() => {
    if (chartEl.value) Plotly.purge(chartEl.value);
});
</script>

<style scoped>
.asset-container {
    position: relative;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    min-height: 300px;
}

.chart {
    flex: 1 1 auto;
    min-height: 0;
    width: 100%;
}

.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--bg-elevated);
    z-index: 10;
    font-size: 1rem;
}

.overlay.error {
    color: var(--sale, #ef4444);
}
</style>

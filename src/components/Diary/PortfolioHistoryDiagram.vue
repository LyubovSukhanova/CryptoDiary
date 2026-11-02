<template>
    <div class="portfolio-history card-container">
        <div v-if="loading" class="overlay">Загрузка истории…</div>
        <div v-else-if="error" class="overlay error">{{ error }}</div>
        <div ref="chartEl" class="chart"></div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch, nextTick } from 'vue'
import Plotly from 'plotly.js-dist-min'
import type { Data, Layout } from 'plotly.js-dist-min'
import type { PriceHistory } from '../../composables/usePortfolioHistory'

interface Props {
    loading: boolean
    error: string | null
    priceHistory: PriceHistory[]
}

const props = withDefaults(defineProps<Props>(), {
    loading: true,
    error: null,
    priceHistory: () => [],
})

const chartEl = ref<HTMLElement | null>(null)

interface Timeline {
    dates: number[]
    byCoin: Map<number, Map<number, number>>
    coinIds: number[],
    symbolById: Map<number, string>
}

function buildTimeline(priceHistory: PriceHistory[]): Timeline {
    const dateSet = new Set<number>()
    const byCoin = new Map<number, Map<number, number>>()
    const coinIds: number[] = []
    const symbolById = new Map<number, string>()

    for (const ph of priceHistory) {
        coinIds.push(ph.id)
        symbolById.set(ph.id, ph.symbol)
        const priceMap = new Map<number, number>()
        for (const point of ph.history) {
            dateSet.add(point.dt)
            priceMap.set(point.dt, point.price)
        }
        byCoin.set(ph.id, priceMap)
    }

    return {
        dates: [...dateSet].sort((a, b) => a - b),
        byCoin,
        coinIds,
        symbolById,
    }
}

function priceAt(
    priceMap: Map<number, number> | undefined,
    date: number,
    allDates: number[]
): number | null {
    if (!priceMap) return null
    const direct = priceMap.get(date)
    if (direct != null) return direct

    for (let i = allDates.indexOf(date) - 1; i >= 0; i--) {
        const prev = allDates[i]
        if (priceMap.has(prev)) return priceMap.get(prev)!
    }
    return null
}

function renderChart() {
    if (!chartEl.value) return
    const items = props.priceHistory

    if (items.length === 0) {
        Plotly.purge(chartEl.value)
        return
    }

    const { dates, byCoin, coinIds, symbolById } = buildTimeline(items)

    // Трассы по каждой монете + сохранённые ys
    const coinTraces: Data[] = []
    const coinYs: (number | null)[][] = []

    for (const coinId of coinIds) {
        const priceMap = byCoin.get(coinId)
        const symbol = symbolById.get(coinId) ?? `#${coinId}`
        const ys: (number | null)[] = dates.map((dt) => {
            const v = priceAt(priceMap, dt, dates)
            return v != null ? v / 1000 : null
        })
        coinYs.push(ys)

        coinTraces.push({
            type: 'scatter',
            mode: 'lines',
            name: `${symbol}`,
            x: dates,
            y: ys,
            connectgaps: false,
            line: { width: 1.5 },
            hovertemplate: `%{y:,.2f} тыс. $<extra>${symbol}</extra>`,
        })
    }

    // Суммирующая кривая — по сохранённым ys, без чтения из Data
    const totalYs: (number | null)[] = dates.map((_, i) => {
        let sum = 0
        let hasAny = false
        for (const ys of coinYs) {
            const y = ys[i]
            if (y != null && Number.isFinite(y)) {
                sum += y
                hasAny = true
            }
        }
        return hasAny ? sum : null
    })

    const totalTrace: Data = {
        type: 'scatter',
        mode: 'lines',
        name: 'Портфель (сумма)',
        x: dates,
        y: totalYs,
        connectgaps: false,
        line: { width: 3, color: '#111' },
        hovertemplate: '%{y:,.2f} тыс. $<extra>Всего</extra>',
    }

    const data: Data[] = [...coinTraces, totalTrace]

    const layout: Partial<Layout> = {
        title: { text: 'Историческая стоимость портфеля' },
        showlegend: true,
        xaxis: {
            type: 'date',
            tickformat: '%d.%m.%Y',
            rangeslider: { visible: false },
        },
        yaxis: {
            title: { text: 'Стоимость, тыс. $' },
            tickformat: '.0f',
        },
        hovermode: 'x unified',
        legend: { orientation: 'h', y: -0.15 },
        margin: { t: 50, b: 80, l: 60, r: 20 },
    }

    Plotly.react(chartEl.value, data, layout, {
        responsive: true,
        displayModeBar: false,
    })

    requestAnimationFrame(() => {
        if (chartEl.value) Plotly.Plots.resize(chartEl.value)
    })
}

onMounted(async () => {
    await nextTick()
    renderChart()
})

watch(
    () => props.priceHistory,
    async () => {
        await nextTick()
        renderChart()
    },
    { deep: true }
)

onUnmounted(() => {
    if (chartEl.value) Plotly.purge(chartEl.value)
})
</script>

<style scoped>
.portfolio-history {
    position: relative;
    width: 100%;
    min-height: 200px;
}

.chart {
    width: 100%;
    height: 300px;
}

.overlay {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bg-elevated);
    z-index: 10;
}

.overlay.error {
    color: var(--danger);
}
</style>

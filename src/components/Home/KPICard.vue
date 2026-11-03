<template>
    <div v-if="loading" class="card-container card-background">
        Загрузка...
    </div>
    <div v-else class="vertical padding10 card-container card-background center">
        <div class="horizontal padding10 gap10 center">
            <div class="card-container center general-stats" style="padding: 10px;">
                <h3>Капитализация ТОП-100</h3>
                <span class="neutral">
                    ${{ (stats?.totalCap / 1_000_000_000_000).toFixed(2).replaceAll('.', ',') }}трлн.
                </span>
            </div>
            <div class="card-container center general-stats" style="padding: 10px;">
                <h3>Объем за 24 часа</h3>
                <span class="neutral">
                    ${{ (stats?.totalVolume / 1_000_000_000).toFixed(2).replaceAll('.', ',') }}млрд.
                </span>
            </div>
            <div class="card-container center general-stats" style="padding: 10px;">
                <h3>Среднее изменение</h3>
                <span v-if="stats?.avgChange >= 0" class="profit">
                    ▲ ${{ (stats?.avgChange).toFixed(2).replaceAll('.', ',') }}%
                </span>
                <span v-else class="loss">
                    ▼ ${{ (stats?.avgChange).toFixed(2).replaceAll('.', ',') }}%
                </span>
            </div>
            <div class="card-container center general-stats" style="padding: 10px;">
                <h3>Изменения</h3>
                <div class="string gap10">
                    <span class="profit" title="Количество поднявшихся монет">
                        ↑ {{ stats?.gainers }}
                    </span>
                    <span class="loss" title="Количество упавших монет">
                        ↓ {{ stats?.losers }}
                    </span>
                </div>
            </div>
        </div>
        <div class="horizontal padding10 gap10" style="justify-content: center;">
            <div class="card-container center profit top-coin" style="padding: 10px;">
                <h3>Лидер за 24 часа</h3>
                <div class="string gap10">
                    <span>{{ stats?.topGainer?.symbol }}</span>
                    <span>{{ stats?.topGainer?.name }}</span>
                    <span title="Ранг монеты">{{ stats?.topGainer?.rank }}</span>
                </div>
                <div class="string gap10">
                    <span title="Цена">${{ stats?.topGainer?.price_usd.toFixed(2).replaceAll('.', ',') }}</span>
                    <span title="Подъем за 24 часа">
                        +{{ stats?.topGainer?.percent_change_24h.toFixed(2).replaceAll('.', ',') }}%
                    </span>
                </div>
                <div class="string gap10">
                    <span title="Текущий объем">{{ stats?.topGainer?.csupply }}</span>
                    <span title="Объем продаж за 24 часа">
                        ${{ stats?.topGainer?.volume24.toFixed(2).replaceAll('.', ',') }}
                    </span>
                </div>
            </div>
            <div class="card-container center loss top-coin" style="padding: 10px;">
                <h3>Антилидер за 24 часа</h3>
                <div class="string gap10">
                    <span>{{ stats?.topLoser?.symbol }}</span>
                    <span>{{ stats?.topLoser?.name }}</span>
                    <span title="Ранг монеты">{{ stats?.topLoser?.rank }}</span>
                </div>
                <div class="string gap10">
                    <span title="Цена">${{ stats?.topLoser?.price_usd.toFixed(2).replaceAll('.', ',') }}</span>
                    <span title="Подъем за 24 часа">
                        {{ stats?.topLoser?.percent_change_24h.toFixed(2).replaceAll('.', ',') }}%
                    </span>
                </div>
                <div class="string gap10">
                    <span title="Текущий объем">{{ stats?.topLoser?.csupply }}</span>
                    <span title="Объем продаж за 24 часа">
                        ${{ stats?.topLoser?.volume24.toFixed(2).replaceAll('.', ',') }}
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useCoinsStore } from '../../stores/useCoinsStore'

const { coinsTop100, loading } = storeToRefs(useCoinsStore())

const stats = computed(() => {
    const coins = coinsTop100.value
    if (!coins.length) {
        return { totalCap: 0, totalVolume: 0, avgChange: 0, gainers: 0, losers: 0, topGainer: null, topLoser: null }
    }

    let totalCap = 0
    let totalVolume = 0
    let changeSum = 0
    let gainers = 0
    let losers = 0
    let topGainer = coins[0]
    let topLoser = coins[0]

    for (const coin of coins) {
        totalCap += Number(coin.market_cap_usd) || 0
        totalVolume += Number(coin.volume24) || 0
        const change = Number(coin.percent_change_24h) || 0
        changeSum += change
        if (change > 0) gainers++
        else if (change < 0) losers++
        if (change > (Number(topGainer.percent_change_24h) || 0)) topGainer = coin
        if (change < (Number(topLoser.percent_change_24h) || 0)) topLoser = coin
    }

    return {
        totalCap,
        totalVolume,
        avgChange: changeSum / coins.length,
        gainers,
        losers,
        topGainer,
        topLoser,
    }
})
</script>

<style scoped>
.top-coin {
    width: 30%;
}

.general-stats {
    width: 22%;
}
</style>

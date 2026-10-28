// Функции для расчета аналитики портфолио
import { computed, ref, watch, type Ref } from "vue";
import type { DiaryRecord } from "../stores/useDiaryStore";
import { API_BASE_URL } from "../constants";
import axios from "axios";

interface CoinPrice {
    id: string;
    symbol: string;
    price_usd: number;
    percent_change_24h: number;
}

interface CoinsPricesInfo {
    id: string;
    symbol: string;
    current_number: number;
    prime_cost: number;
    current_cost: number;
}

export function usePortfolioAnalytics(records: Ref<DiaryRecord[]>) {
    const prices = ref<Record<string, CoinPrice & { fetchedAt: number }>>({});
    const loading = ref<boolean>(false);
    const error = ref<string | null>(null);

    const uniqueCoins = computed(() => {
        const ids = new Set<string>();
        records.value.forEach((r) => {
            if (r.ref_coin) ids.add(String(r.ref_coin));
        });
        return [...ids];
    });

    async function fetchPrices() {
        const ids = uniqueCoins.value;
        if (ids.length === 0) {
            return;
        }
        const now = Date.now();
        const stale = ids.filter((id) => {
            const cached = prices.value[id];
            return !cached || now - cached.fetchedAt > 60000;
        });
        if (stale.length === 0) {
            return;
        }

        loading.value = true;
        error.value = null;
        try {
            const response = await axios.get(`${API_BASE_URL}/api/ticker/?id=${stale.join(",")}`);
            const data = response.data;
            for (const t of data) {
                prices.value[String(t.id)] = {
                    id: t.id,
                    symbol: t.symbol,
                    price_usd: Number(t.price_usd),
                    percent_change_24h: Number(t.percent_change_24h),
                    fetchedAt: now,
                };
            }
        } catch (e) {
            error.value = e instanceof Error ? e.message : "Ошибка загрузки цен";
        } finally {
            loading.value = false;
        }
    }

    watch(uniqueCoins, fetchPrices, { immediate: true });

    const totals = computed(() => {
        // параметры общей стоимости портфеля
        let cost = 0; // себестоимость
        let currentValue = 0; // текущая стоимость

        for (const r of records.value) {
            if (!r.ref_coin || !r.number || !r.price) continue;
            const qty = r.income ? r.number : -r.number; // приход +, расход -
            cost += qty * r.price;
            const p = prices.value[String(r.ref_coin)];
            if (p) currentValue += qty * p.price_usd;
        }

        return {
            cost,
            currentValue,
            pnl: currentValue - cost,
            pnlPercent: cost !== 0 ? ((currentValue - cost) / Math.abs(cost)) * 100 : 0,
        };
    });

    const detailedCoinsPrices = computed(() => {
        const data: CoinsPricesInfo[] = [];
        if (!uniqueCoins.value || uniqueCoins.value.length === 0) {
            return [];
        }
        for (let coin of uniqueCoins.value) {
            data.push({
                id: coin,
                symbol: "",
                current_number: 0,
                prime_cost: 0,
                current_cost: 0,
            });
        }
        for (let r of records.value) {
            if (!r.ref_coin || !r.number || !r.price || !r.coin_symbol || r.income === undefined) continue;
            const d = data.filter((dat) => dat.id === r.ref_coin?.toString())[0];
            d.symbol = r.coin_symbol;
            if (r.income) {
                d.current_number += r.number;
                d.prime_cost += r.price * r.number;
            } else {
                d.current_number -= r.number;
                d.prime_cost -= r.price * r.number;
            }
        }
        for (let d of data) {
            const price = prices.value[d.id.toString()].price_usd;
            d.current_cost = d.current_number * price;
        }
        return data;
    });

    const allocation = computed(() => {
        const map = new Map<string, { name: string; value: number }>();
        for (const r of records.value) {
            if (!r.ref_coin || !r.number) continue;
            const p = prices.value[String(r.ref_coin)];
            if (!p) continue;
            const qty = r.income ? r.number : -r.number;
            const value = qty * p.price_usd;
            const key = String(r.ref_coin);
            const existing = map.get(key);
            if (existing) {
                existing.value += value;
            } else {
                map.set(key, { name: r.coin_name ?? key, value });
            }
        }
        // Оставляем только положительные позиции
        return [...map.values()].filter((a) => a.value > 0);
    });

    return { prices, loading, error, totals, detailedCoinsPrices, allocation, fetchPrices };
}

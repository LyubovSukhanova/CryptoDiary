import type { DiaryRecord } from "../stores/useDiaryStore";
import { watch, ref, computed, type Ref } from "vue";

export interface HistoryPoint {
    dt: number;
    price: number;
}
export interface PriceHistory {
    id: number;
    symbol: string;
    history: HistoryPoint[];
}

const CONCURRENCY = 2; // не более 2 запросов одновременно

/** Загружает историю одной монеты. */
async function fetchOneCoinHistory(coinId: number, symbol: string, coinNumber: number): Promise<PriceHistory> {
    // Создаём контроллер для отмены запроса
    const controller = new AbortController();
    // Устанавливаем таймаут (15 секунд)
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    try {
        const response = await fetch(`/api/coin/ohlcv/?coin=${coinId}`, {
            signal: controller.signal, // Передаём сигнал в fetch
        });
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} for coin ${coinId}`);
        }
        const rawData = await response.json();
        const historyPoints: HistoryPoint[] = Object.entries(rawData)
            .map(([timestamp, ohlcv]: [string, any]) => {
                const close = Array.isArray(ohlcv) ? Number(ohlcv[4]) : NaN;
                if (!Number.isFinite(close)) return null;
                return {
                    dt: Number(timestamp) * 1000,
                    price: close * coinNumber,
                };
            })
            .filter((p): p is HistoryPoint => p !== null)
            .sort((a, b) => a.dt - b.dt);
        return { id: coinId, symbol: symbol, history: historyPoints };
    } finally {
        // Обязательно очищаем таймаут, чтобы он не сработал после успешного ответа
        clearTimeout(timeoutId);
    }
}

/**
 * Запускает задачи с ограничением параллельности.
 * `limit` воркеров берут задачи из общей очереди, пока она не опустеет.
 * Порядок результатов не гарантирован (зависит от скорости ответов).
 */
async function runWithConcurrency<T>(tasks: (() => Promise<T>)[], limit: number): Promise<T[]> {
    const results: T[] = [];
    let nextIndex = 0;

    async function worker(): Promise<void> {
        while (true) {
            const index = nextIndex++;
            if (index >= tasks.length) return;
            const task = tasks[index];
            const result = await task(); // ошибка пробрасывается наверх
            results.push(result);
        }
    }

    const workers = Array.from({ length: Math.min(limit, tasks.length) }, () => worker());
    await Promise.all(workers);
    return results;
}

export function usePotfolioHistory(records: Ref<DiaryRecord[]>) {
    const historyLoading = ref(false);
    const historyError = ref<string | null>(null);
    const priceHistory = ref<PriceHistory[]>([]);

    const uniqueCoins = computed(() => {
        const ids = new Set<number>();
        records.value.forEach((r) => {
            if (r.ref_coin != null) ids.add(r.ref_coin);
        });
        return [...ids];
    });

    const coinsNumber = computed(() => {
        const map = new Map<number, number>();
        for (const r of records.value) {
            if (r.ref_coin == null || r.number == null) continue;
            const qty = r.income ? r.number : -r.number;
            map.set(r.ref_coin, (map.get(r.ref_coin) ?? 0) + qty);
        }
        return map;
    });

    let requestId = 0;

    async function fetchCoinsHistory() {
        const myId = ++requestId;
        historyLoading.value = true;
        historyError.value = null;

        try {
            // 1. Собираем задачи: только монеты с положительным остатком
            const tasks: (() => Promise<PriceHistory>)[] = [];
            for (const coinId of uniqueCoins.value) {
                const coinNumber = coinsNumber.value.get(coinId) ?? 0;
                const symbol = records.value.find((r) => r.ref_coin === coinId)?.coin_symbol ?? `#${coinId}`;
                if (coinNumber <= 0) continue;
                tasks.push(() => fetchOneCoinHistory(coinId, symbol, coinNumber));
            }

            if (tasks.length === 0) {
                if (myId === requestId) priceHistory.value = [];
                return;
            }

            // 2. Запускаем с ограничением параллельности
            const result = await runWithConcurrency(tasks, CONCURRENCY);

            // 3. Применяем только если это последний запрос
            if (myId === requestId) priceHistory.value = result;
        } catch (e) {
            if (myId === requestId) {
                historyError.value = e instanceof Error ? e.message : "Ошибка загрузки истории";
                console.error("Failed to fetch coin history:", e);
            }
        } finally {
            if (myId === requestId) historyLoading.value = false;
        }
    }

    watch(records, fetchCoinsHistory, { immediate: true });

    return { historyLoading, historyError, priceHistory };
}

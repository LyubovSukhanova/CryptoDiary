import { ref } from "vue";
import { defineStore } from "pinia";
import { API_BASE_URL } from "../constants";
import axios from "axios";

export interface Coin {
    id: number;
    symbol: string;
    name: string;
    rank: number;
    price_usd: number;
    percent_change_24h: number;
    csupply: number;
}

export interface TickerResponse {
    data: Coin[];
    info: {
        coins_num: number;
        time: number;
    };
}

export const useCoinsStore = defineStore("coins", () => {
    // --- State ---
    const coinsTop100 = ref<Coin[]>([]);
    const selectedCoin = ref<Coin | null>(null);
    const loading = ref<boolean>(false);

    // --- Getters ---

    // --- Actions ---
    const fetchCoinsTop100 = async (): Promise<void> => {
        loading.value = true;
        try {
            const response = await axios.get<TickerResponse>(`${API_BASE_URL}/api/tickers/`, {
                params: { start: 0, limit: 100 },
            });
            const data = response.data.data;
            coinsTop100.value = data.map((d) => {
                return {
                    id: d.id,
                    symbol: d.symbol,
                    name: d.name,
                    rank: d.rank,
                    price_usd: Number(d.price_usd),
                    percent_change_24h: Number(d.percent_change_24h),
                    csupply: Number(d.csupply),
                };
            });
        } catch (error) {
            console.error("Ошибка получения ТОП-100 монет:");
            if (axios.isAxiosError(error)) {
                console.error("Axios error:", error.message);
                console.error("Status:", error.response?.status);
                console.error("Data:", error.response?.data);
            } else if (error instanceof Error) {
                console.error("Generic error:", error.message);
            } else {
                console.error("Unknown error:", error);
            }
            coinsTop100.value = [];
        } finally {
            loading.value = false;
        }
    };

    const setSelectedCoin = (value: Coin): void => {
        selectedCoin.value = { ...value };
        console.log("selected coin", selectedCoin.value);
    };

    return {
        coinsTop100,
        loading,
        fetchCoinsTop100,
        setSelectedCoin,
    };
});

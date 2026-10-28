import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { supabase } from "../lib/supabase";

export interface DiaryRecord {
    id: number;
    ref_user: string;
    logged_at: string;
    ref_coin?: number;
    comment?: string;
    price?: number;
    income?: boolean;
    number?: number;
    coin_symbol?: string;
    coin_name?: string;
}

export const useDiaryStore = defineStore("diary", () => {
    // --- State ---
    const records = ref<DiaryRecord[]>([]);
    const error = ref<string | null>(null);

    // --- Getters ---
    const recordById = computed(() => {
        return (id: number): DiaryRecord | undefined => records.value.find((r) => r.id === id);
    });

    // --- Actions ---

    const createRecord = async (userId: string): Promise<number> => {
        if (!userId) {
            throw new Error("user not found");
        }

        const { data, error: sbError } = await supabase
            .from("diary_entries")
            .insert({ ref_user: userId, logged_at: new Date().toISOString() })
            .select("id, logged_at")
            .single();

        if (sbError) throw sbError;

        const newRecord: DiaryRecord = {
            id: data.id,
            ref_user: userId,
            logged_at: data.logged_at ?? new Date().toISOString(),
        };
        //records.value.push(newRecord);

        return newRecord.id;
    };

    const fetchUserRecords = async (userId: string): Promise<string> => {
        if (!userId) {
            throw new Error("user not found!");
        }

        records.value = [];

        const { data, error: sbError } = await supabase
            .from("diary_entries")
            .select("id, logged_at, comment, ref_user, income, number, price, ref_coin, coins(symbol, name)")
            .eq("ref_user", userId);

        if (sbError) throw sbError;

        if (data.length === 0) {
            records.value = [];
        } else {
            records.value = data.map(
                (d): DiaryRecord => ({
                    id: d.id,
                    logged_at: d.logged_at ?? new Date().toISOString(),
                    comment: d.comment ?? undefined,
                    ref_user: d.ref_user ?? userId,
                    income: d.income ?? undefined,
                    number: d.number ?? undefined,
                    price: d.price ?? undefined,
                    ref_coin: d.ref_coin ?? undefined,
                    coin_symbol: d.coins?.symbol ?? undefined,
                    coin_name: d.coins?.name ?? undefined,
                }),
            );
        }

        return "success";
    };

    const saveRecord = async (record: DiaryRecord): Promise<string> => {
        if (!record) {
            throw new Error("user not found");
        }

        const { data, error: sbError } = await supabase
            .from("diary_entries")
            .update({
                logged_at: record.logged_at,
                ref_coin: record.ref_coin,
                comment: record.comment,
                price: record.price,
                income: record.income,
                number: record.number,
            })
            .eq("id", record.id)
            .select()
            .single();

        if (sbError) throw sbError;
        if (!data) throw new Error("update returned no data");

        const updated: DiaryRecord = {
            id: data.id,
            ref_user: data.ref_user ?? record.ref_user,
            logged_at: data.logged_at ?? new Date().toDateString(),
            comment: data.comment ?? undefined,
            income: data.income ?? undefined,
            number: data.number ?? undefined,
            price: data.price ?? undefined,
            ref_coin: data.ref_coin ?? undefined,
        };

        const index = records.value.findIndex((r) => r.id === updated.id);
        if (index !== -1) {
            records.value[index] = updated;
        } else {
            records.value.push(updated); // на случай, если записи не было в сторе
        }
        return "success";
    };

    const deleteRecord = async (recordId: number): Promise<string> => {
        if (!recordId) {
            throw new Error("record id is required");
        }
        const { data, error: sbError } = await supabase.from("diary_entries").delete().eq("id", recordId).select();
        if (sbError) throw sbError;

        if (!data || data.length === 0) {
            throw new Error("record not found");
        }
        records.value = records.value.filter((r) => r.id !== recordId);
        return "success";
    };

    return {
        records,
        error,
        recordById,
        createRecord,
        fetchUserRecords,
        saveRecord,
        deleteRecord,
    };
});

<!-- Форма добавления/редактирования записи дневника -->
<template>
    <div v-if="user">
        <div class="vertical padding10">
            <h3>Редактирование записи</h3>
            <div class="string gap10">
                <div class="input-caption">
                    <span class="caption">Дата</span>
                    <DatePicker v-model="date" />
                </div>
                <div class="input-caption">
                    <span class="caption">Наименование монеты</span>
                    <Select :options="coinsTop100" v-model="selectedCoin" optionLabel="name" style="width: 20vw;" />
                </div>
                <div class="input-caption">
                    <span class="caption">Количество</span>
                    <InputNumber v-model="coinsNumber" showButtons style="width: 10vw;" />
                </div>
                <div class="input-caption">
                    <span class="caption">Цена, $</span>
                    <InputNumber v-model="price" mode="decimal" :minFractionDigits="2" :maxFractionDigits="2"
                        showButtons style="width: 10vw;" />
                </div>
                <div class="input-caption">
                    <span class="caption">Сумма, $</span>
                    <span class="sum-span" v-if="coinsNumber && price">
                        {{ (coinsNumber * price).toFixed(2).replaceAll('.', ',') }}
                    </span>
                    <span class="sum-span" v-else></span>
                </div>
                <div class="input-caption">
                    <span class="caption">Купля/продажа</span>
                    <div class="string gap10">
                        <div class="string gap5">
                            <RadioButton v-model="isIncome" value="buy" inputId="income" name="type" />
                            <label for="income">Купля</label>
                        </div>
                        <div class="string gap5">
                            <RadioButton v-model="isIncome" value="sell" inputId="expense" name="type" />
                            <label for="expense">Продажа</label>
                        </div>
                    </div>
                </div>
            </div>
            <div class="input-caption">
                <span class="caption">Комментарий</span>
                <TextEditor v-model="comment" />
            </div>
            <div class="footer-buttons">
                <Button label="Сохранить" @click="onSaveClick" />
                <Button label="Отмена" severity="secondary" @click="onCancelClick" />
            </div>
        </div>
    </div>
    <div v-else>Нет доступа</div>
</template>

<script setup lang="ts">
import router from '../router';
import { useRoute } from 'vue-router';
import { useUserStore } from '../stores/useUserStore';
import { useCoinsStore } from '../stores/useCoinsStore';
import { useDiaryStore } from '../stores/useDiaryStore';
import type { DiaryRecord } from '../stores/useDiaryStore';
import { storeToRefs } from 'pinia';
import { DatePicker, Select, InputNumber, RadioButton, Button, useToast } from 'primevue';
import { watch, ref, computed } from 'vue';
import TextEditor from '../components/TextEditor.vue';

const route = useRoute();
const toast = useToast();

const userStore = useUserStore();
const coinsStore = useCoinsStore();
const diaryStore = useDiaryStore();
const { user } = storeToRefs(userStore);
const { coinsTop100 } = storeToRefs(coinsStore);

const record = ref<DiaryRecord | undefined>(undefined);

const selectedCoin = computed({
    get: () => {
        const refCoin = record.value?.ref_coin;
        if (!refCoin) return null;
        return coinsTop100.value.find(c => Number(c.id) === Number(refCoin)) ?? null;
    },
    set: (coin) => {
        if (record.value) record.value.ref_coin = coin?.id != null ? Number(coin.id) : undefined;
    },
});
const date = ref<Date | null>(null);
const coinsNumber = ref<number | undefined>(undefined);
const price = ref<number | undefined>(undefined);
const isIncome = ref<string>('buy');
const comment = ref<string>('')

watch(
    () => user.value?.id,
    async (userId) => {
        if (!userId) return;
        await diaryStore.fetchUserRecords(userId);

        record.value = diaryStore.recordById(Number(route.params.id));
        if (record.value?.logged_at) {
            date.value = new Date(record.value.logged_at);
        };
        if (record.value?.number) {
            coinsNumber.value = record.value.number;
        };
        if (record.value?.price) {
            price.value = record.value.price;
        };
        if (typeof record.value?.income === 'boolean') {
            if (record.value.income) {
                isIncome.value = 'buy';
            } else {
                isIncome.value = 'sell';
            }
        };
        if (record.value?.comment) {
            comment.value = record.value.comment;
        };
    },
    { immediate: true }
);


const onSaveClick = async () => {
    let income: boolean | undefined = undefined;
    if (isIncome.value === 'buy') {
        income = true;
    } else if (isIncome.value === 'sell') {
        income = false;
    };
    const payload: DiaryRecord = {
        id: Number(route.params.id),
        ref_user: record.value?.ref_user ?? '0',
        logged_at: date.value?.toISOString() ?? (new Date().toISOString()),
        ref_coin: selectedCoin.value?.id,
        comment: comment.value,
        price: price.value,
        income: income,
        number: coinsNumber.value,
    };

    try {
        const response = await diaryStore.saveRecord(payload);
        if (response === 'success') {
            toast.add({
                severity: 'success',
                summary: 'Успешно',
                detail: 'Запись сохранена',
                life: 3000,
            })
        }
        router.push({ name: 'diary' });
    } catch (e) {
        const message = e instanceof Error ? e.message : 'Неизвестная ошибка';
        toast.add({
            severity: 'error',
            summary: 'Ошибка',
            detail: `Произошла ошибка: ${message}`,
            life: 3000,
        });
    }
};

const onCancelClick = () => {
    router.push({ name: 'diary' });
};


</script>

<style scoped>
.sum-span {
    display: block;
    height: 39px;
    width: 10vw;
    border: 0.5px solid var(--border);
    border-radius: 0.3rem;
    padding: 0.3rem;
    font-size: 0.9rem;
}
</style>

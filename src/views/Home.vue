<template>
    <div class="vertical padding10 gap10">
        <KPICard />
        <div class="vertical">
            <CoinsTable />
        </div>
    </div>
</template>

<script setup lang="ts">
import CoinsTable from '../components/Home/CoinsTable.vue';
import KPICard from '../components/Home/KPICard.vue';

</script>

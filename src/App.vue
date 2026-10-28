<template>
  <Toast position="center" />
  <MainMenu />
  <RouterView />
</template>

<script setup lang="ts">
import { Toast } from 'primevue';
import MainMenu from './components/MainMenu.vue';
import { onMounted } from 'vue';
import { useCoinsStore } from './stores/useCoinsStore';
import { supabase } from './lib/supabase';
import { useUserStore } from './stores/useUserStore';

const userStore = useUserStore();
const coinsStore = useCoinsStore();

onMounted(async () => {
  // 1. Восстанавливаем сессию (не блокируя рендер)
  const { data: { session } } = await supabase.auth.getSession();
  if (session?.user) {
    userStore.user = {
      id: session.user.id,
      name: session.user.user_metadata.name ?? '',
      login: session.user.user_metadata.login ?? '',
    };
  }

  // 2. Загружаем данные
  await coinsStore.fetchCoinsTop100();
});
</script>

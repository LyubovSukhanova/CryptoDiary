<template>
    <div class="menu-container">
        <Menubar :model="items">
            <template #end>
                <Button v-if="!user" type="button" icon="pi pi-user" @click="toggleUserMenu" />
                <div v-if="!user" class="popup-menu">
                    <Menu id="user_menu" ref="userMenuRef" :model="userItems" :popup="true" />
                </div>
                <div v-else class="user-cabinet" @click="toggleCabinetMenu">
                    <i class="pi pi-user"></i>
                    {{ user.name }}
                    <Menu id="cabinet_menu" ref="cabinetMenuRef" :model="cabinetItems" :popup="true" />
                </div>
            </template>
        </Menubar>
    </div>

    <EnterDialog :visible="enterDialogVisible" @close="onEnterDialogClose" />
    <RegistrationDialog :visible="registrationDialogVisible" @close="onRegistrationDialogClose" />
    <ExitDialog :visible="exitDialogVisible" @close="onExitDialogClose" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { Menubar, Button, Menu } from 'primevue';
import type { MenuItem } from 'primevue/menuitem';
import EnterDialog from './Authorization/EnterDialog.vue';
import RegistrationDialog from './Authorization/RegistrationDialog.vue';
import router from '../router';
import { useUserStore } from '../stores/useUserStore';
import { storeToRefs } from 'pinia';
import ExitDialog from './Authorization/ExitDialog.vue';

const userStore = useUserStore();

const items = computed<MenuItem[]>(() => {
    const base: MenuItem[] = [
        {
            label: 'Главная',
            icon: 'pi pi-home',
            command: () => {
                router.push({ name: 'home' })
            }
        },
    ];
    if (user.value) {
        base.push(
            {
                label: 'Мой дневник',
                icon: 'pi pi-file-edit',
                command: () => { router.push({ name: 'diary' }) },
            }
        );
    };
    return base;
});

const { user } = storeToRefs(userStore);

const userItems = ref<MenuItem[]>([
    {
        label: 'Вход',
        icon: 'pi pi-sign-in',
        command: () => {
            enterDialogVisible.value = true;
        }
    },
    {
        label: 'Регистрация',
        icon: 'pi pi-user-plus',
        command: () => {
            registrationDialogVisible.value = true;
        }
    }
]);
const cabinetItems = ref<MenuItem[]>([
    {
        label: 'Выход',
        icon: 'pi pi-sign-out',
        command: () => {
            exitDialogVisible.value = true;
        }
    }
]);

const userMenuRef = ref<InstanceType<typeof Menu> | null>(null);
const cabinetMenuRef = ref<InstanceType<typeof Menu> | null>(null);

const toggleUserMenu = (event: Event) => {
    userMenuRef.value?.toggle(event);
};
const toggleCabinetMenu = (event: Event) => {
    cabinetMenuRef.value?.toggle(event);
}

const registrationDialogVisible = ref<boolean>(false);
const enterDialogVisible = ref<boolean>(false);
const exitDialogVisible = ref<boolean>(false);

const onEnterDialogClose = (): void => {
    enterDialogVisible.value = false;
};
const onRegistrationDialogClose = (): void => {
    registrationDialogVisible.value = false;
}
const onExitDialogClose = (): void => {
    exitDialogVisible.value = false;
}

</script>

<style scoped>
.menu-container {
    width: 100%;
    padding: 10px;
    background-color: var(--menu-background);
    border-radius: 4px;
    box-shadow: 0 2px 0 0 var(--shadow-color);
}

.popup-menu :deep(.p-menu) {
    background-color: var(--menu-background);
}
</style>

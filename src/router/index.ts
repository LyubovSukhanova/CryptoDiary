import { createRouter, createWebHistory } from "vue-router";
import type { RouteRecordRaw } from "vue-router";
import Home from "../views/Home.vue";
import Diary from "../views/Diary.vue";
import RecordEdit from "../views/RecordEdit.vue";

const routes: Array<RouteRecordRaw> = [
    {
        path: "/",
        name: "home",
        component: Home,
    },
    {
        path: "/diary",
        name: "diary",
        component: Diary,
    },
    {
        path: "/record-edit/:id",
        name: "record_edit",
        component: RecordEdit,
    },
];

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes,
});

export default router;

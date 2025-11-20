import { createRouter, createWebHistory } from "vue-router";
import TransactionsPage from "../views/TransactionsPage.vue";
import DashboardPage from "../views/DashboardPage.vue";

const routes = [
  { path: "/", name: "transactions", component: TransactionsPage },
  { path: "/dashboard", name: "dashboard", component: DashboardPage },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  },
});

export default router;

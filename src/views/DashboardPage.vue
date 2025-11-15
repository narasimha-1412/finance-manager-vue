<template>
  <div class="container">
    <InsightsDashboard/>
    <BarChart/>
    <TwoCharts/>
  </div>
</template>

<script setup>
import InsightsDashboard from "@/components/dashboard/InsightsDashboard.vue";
import { useFinanceStore } from "../stores/finance";
import { onMounted } from "vue";
import BarChart from "@/components/dashboard/BarChart.vue";
import TwoCharts from "@/components/dashboard/TwoCharts.vue";

const store = useFinanceStore();

onMounted(() => {
  store.loadData(); // load transactions before rendering charts
});
</script>

<style scoped>
</style>

<template>
  <div class="container">
    <HeaderBar />
    <SummaryCard />
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useFinanceStore } from "./stores/finance";
import HeaderBar from "./components/HeaderBar.vue";
import SummaryCard from "./components/SummaryCard.vue";

const store = useFinanceStore();
onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
});
</script>

<template>
  <div class="container">
    <NavBar />
    <SummaryCard />

    <router-view @filter-change-from-controlbar="filters = $event" />
  </div>
</template>

<script setup>
import { onMounted } from "vue";
import { useFinanceStore } from "./stores/finance";
import SummaryCard from "./components/SummaryCard.vue";
import NavBar from "./components/NavBar.vue";

const store = useFinanceStore();
onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
});
</script>

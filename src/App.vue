<template>
  <div class="container">
    <NavBar />
    <SummaryCard />

    <router-view />
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

<style lang="scss" scoped>
.container {
  max-width: 1100px;
  margin: 24px auto;
  padding-top: 51px;
}
</style>

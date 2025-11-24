<template>
  <!-- <div class="container">
    <NavBar />
    <SummaryCard />

    <router-view />
  </div> -->

  <VApp>
    <VMain>
      <NavBar />
      <SummaryCard />
      <router-view />
    </VMain>
  </VApp>
</template>

<script setup>
import { onMounted } from "vue";
import { useFinanceStore } from "./stores/finance";
import SummaryCard from "./components/SummaryCard.vue";
import NavBar from "./components/NavBar.vue";

const store = useFinanceStore();
onMounted(() => {
  store.loadData();
});
</script>

<style lang="scss" scoped>
// .container {
//   max-width: 1100px;
//   margin: 24px auto;
//   padding-top: 51px;
// }

.v-theme--light .v-main {
  background: #f3f3f5 !important;
}
</style>

<template>
  <v-fade-transition mode="out-in">
    <div :key="theme">
      <VApp>
        <VMain>
          <NavBar />
          <SummaryCard />
          <router-view />
        </VMain>
      </VApp>
    </div>
  </v-fade-transition>
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

<style lang="scss">
.v-theme--light .v-main {
  background: #f3f3f5 !important;
}
.v-btn .v-btn__content {
  text-transform: none !important;
}
</style>

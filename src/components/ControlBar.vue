<template>
  <section class="controls">
    <button class="btn primary" @click="openAdd">+ Add Transaction</button>
    <FilterTransactions @filter-change="forwardFilter" />
    <AddTransaction ref="addRef" />
  </section>
</template>

<script setup>
import { ref } from "vue";
import FilterTransactions from "./controls/FilterTransactions.vue";
import AddTransaction from "./controls/AddTransaction.vue";

const emit = defineEmits(["filter-change-from-controlbar"]);

const addRef = ref(null);

function openAdd() {
  addRef.value?.openAdd();
}

function forwardFilter(payload) {
  emit("filter-change-from-controlbar", payload);
}

function openEdit(tx) {
  addRef.value?.openEdit(tx);
}

defineExpose({ openEdit });
</script>

<style scoped lang="scss">
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0 0 0.8125rem 0;
}
</style>

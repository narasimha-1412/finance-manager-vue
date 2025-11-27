<template>
  <div class="controls">
    <v-btn
      size="small"
      prepend-icon="mdi-plus-thick"
      color="primary"
      @click="openAdd"
      >Add Transaction</v-btn
    >
    <FilterTransactions @filter-change="forwardFilter" />
    <AddTransaction ref="addRef" />
  </div>
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
  margin-left: 5.5rem;
  margin-right: 5.5rem;
  margin-bottom: 0.5rem;
}
</style>

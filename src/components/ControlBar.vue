<template>
  <section class="controls">
    <!-- Add button uses internal AddTransaction modal -->
    <button class="btn primary" @click="openAdd">+ Add Transaction</button>
    <FilterTransactions @filter-change="forwardFilter" />
    <AddTransaction ref="addRef" />
  </section>
</template>

<script setup>
import { ref } from "vue";
import FilterTransactions from "./controls/FilterTransactions.vue";
import AddTransaction from "./controls/AddTransaction.vue";

const emit = defineEmits(["open-add", "filter-change-from-controlbar"]);

// ref to internal modal
const addRef = ref(null);

function openAdd({ fromParent = false } = {}) {
  addRef.value?.openAdd();
  if (!fromParent) emit("open-add");
}

// forward filter payload upward
function forwardFilter(payload) {
  emit("filter-change-from-controlbar", payload);
}

// expose functions so parent can trigger edit (TransactionsPage can call controlBarRef.value.openEdit(tx))
function openEdit(tx) {
  addRef.value?.openEdit(tx);
}

defineExpose({ openEdit, openAdd });
</script>

<style scoped lang="scss">
.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin: 0px 0px 13px 0px;
}
</style>

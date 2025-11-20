<template>
  <ControlBar
    ref="controlBarRef"
    @filter-change-from-controlbar="filters = $event"
  />

  <TransactionTable :filters="filters" @edit="openEdit" @delete="deleteTx" />
</template>

<script setup>
import { ref } from "vue";
import ControlBar from "../components/ControlBar.vue";
import TransactionTable from "../components/TransactionTable.vue";
import { useFinanceStore } from "../stores/finance";

const store = useFinanceStore();
const filters = ref({ start: null, end: null, category: "" });

const controlBarRef = ref(null);

function openEdit(id) {
  const tx = store.transactions.find((t) => t.id === id);
  if (tx) controlBarRef.value?.openEdit?.(tx);
}

function deleteTx(id) {
  const ok = confirm("Delete this transaction?");
  if (!ok) return;
  store.deleteTransaction(id);
}
</script>

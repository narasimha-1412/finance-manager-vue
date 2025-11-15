<template>
  <div class="container">
    <ControlBar
      ref="controlBarRef"
      @filter-change-from-controlbar="filters = $event"
      @open-add="openAdd"
    />

    <TransactionTable :filters="filters" @edit="openEdit" @delete="deleteTx" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ControlBar from "../components/ControlBar.vue";
import TransactionTable from "../components/TransactionTable.vue";
// AddTransaction is inside ControlBar now, so we DON'T import it here

import { useFinanceStore } from "../stores/finance";

const store = useFinanceStore();
const filters = ref({ start: null, end: null, category: "" });

const controlBarRef = ref(null);

// load data once
onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
});

// open ADD form via controlBar
function openAdd() {
  controlBarRef.value?.openAdd?.();
}

// open EDIT form (find tx and delegate to controlBar's modal)
function openEdit(id) {
  const tx = store.transactions.find((t) => t.id === id);
  if (tx) controlBarRef.value?.openEdit?.(tx);
}

// delete transaction
function deleteTx(id) {
  const ok = confirm("Delete this transaction?");
  if (!ok) return;
  store.deleteTransaction(id);
}
</script>

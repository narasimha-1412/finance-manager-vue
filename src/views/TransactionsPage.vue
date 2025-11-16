<template>
  <div class="container">
    <ControlBar
      ref="controlBarRef"
      @filter-change-from-controlbar="onControlBarFilters"
      @open-add="openAdd"
    />

    <TransactionTable :filters="filters" @edit="openEdit" @delete="deleteTx" />
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import ControlBar from "../components/ControlBar.vue";
import TransactionTable from "../components/TransactionTable.vue";
import { useFinanceStore } from "../stores/finance";

const emit = defineEmits(["filter-change-from-controlbar"]); // ADDED: re-emit upward

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

// ADDED: handler to receive filters from ControlBar, update local state,
// and re-emit the change up to App.vue
function onControlBarFilters(newFilters) {
  // normalize / protect: always store a fresh object
  filters.value = {
    ...(newFilters || { start: null, end: null, category: "" }),
  };

  // re-emit for App.vue to pick up (router-view listens to this)
  emit("filter-change-from-controlbar", { ...filters.value });
}
</script>

<template>
  <section class="summary" style="margin-top:24px;">
    <div class="card">
      <p class="label">Highest Expense Category</p>
      <h2>{{ topCategory }}</h2>
    </div>

    <div class="card">
      <p class="label">Avg Saving</p>
      <h2>₹{{ insightSavings }}</h2>
    </div>

    <div class="card">
      <p class="label">Total Transactions</p>
      <h2>{{ totalTransactions }}</h2>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useFinanceStore } from "../../stores/finance.js";

const store = useFinanceStore();

// reactive display values
const topCategory = ref("-");
const insightSavings = ref("0");
const totalTransactions = ref(0);

// load transactions from store (store.loadData ensures seed/LS logic)
async function loadTransactions() {
  if (typeof store.loadData === "function") {
    // synchronous in our store, but `await` is harmless if async
    await store.loadData();
  }
  return store.transactions ?? [];
}

// compute & set summary fields (keeps formatting logic similar to your original)
function renderSummary(transactions = []) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const net = totalIncome - totalExpense;
  const avgSave = Math.max(0, Math.round(net / 6));

  insightSavings.value = formatNum(avgSave);
  totalTransactions.value = transactions.length;

  // highest expense category
  const catTotals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catTotals[t.category] = (catTotals[t.category] || 0) + Number(t.amount || 0);
    });
  const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  topCategory.value = top ? top[0] : "-";
}

// small number formatter (keeps behavior from your code)
function formatNum(n) {
  const neg = n < 0;
  const abs = Math.abs(n);
  const formatted = Number(abs).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: abs % 1 ? 2 : 0,
  });
  return (neg ? "-" : "") + formatted;
}

// initialize and react to store changes
async function updateFromStore() {
  const tx = await loadTransactions();
  renderSummary(tx);
}

// run on mount
onMounted(() => {
  updateFromStore();

  // watch Pinia transactions for live updates
  // store.transactions is a getter (array), so watch the store state as deep
  const stopWatch = watch(
    () => store.transactions,
    (newVal) => {
      renderSummary(newVal ?? []);
    },
    { deep: true }
  );

  // listen for storage events (other tabs)
  function onStorage(e) {
    if (e.key === "financeData") {
      // reload from store/localStorage and update
      updateFromStore();
    }
    if (e.key === "theme") {
      // optional: if you want to react to theme changes, recalc colors or UI here
    }
  }
  window.addEventListener("storage", onStorage);

  onBeforeUnmount(() => {
    stopWatch();
    window.removeEventListener("storage", onStorage);
  });
});
</script>

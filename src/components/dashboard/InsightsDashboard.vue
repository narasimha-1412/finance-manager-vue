<template>
  <section class="summary" style="margin-top: 24px">
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
import { ref, computed, onMounted, watch } from "vue";
import { useFinanceStore } from "../../stores/finance.js";

const store = useFinanceStore();

const topCategory = ref("-");
const insightSavings = ref("0");
const totalTransactions = ref(0);

function formatNum(n) {
  const neg = n < 0;
  const abs = Math.abs(n);
  const formatted = Number(abs).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: abs % 1 ? 2 : 0,
  });
  return (neg ? "-" : "") + formatted;
}

function renderSummary(transactions = []) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const net = totalIncome - totalExpense;
  // group by month (YYYY-MM)
  const monthMap = {};

  transactions.forEach((t) => {
    const d = new Date(t.date + "T00:00:00");
    if (isNaN(d)) return;

    const key =
      d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");

    if (!monthMap[key]) {
      monthMap[key] = { income: 0, expense: 0 };
    }

    if (t.type === "income") monthMap[key].income += Number(t.amount || 0);
    else if (t.type === "expense")
      monthMap[key].expense += Number(t.amount || 0);
  });

  // compute monthly savings array
  const monthlySavings = Object.values(monthMap).map(
    (m) => m.income - m.expense
  );

  // actual monthly average saving
  const avgSave =
    monthlySavings.length > 0
      ? Math.round(
          monthlySavings.reduce((s, x) => s + x, 0) / monthlySavings.length
        )
      : 0;

  insightSavings.value = formatNum(avgSave);

  insightSavings.value = formatNum(avgSave);
  totalTransactions.value = transactions.length;

  // highest expense category
  const catTotals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catTotals[t.category] =
        (catTotals[t.category] || 0) + Number(t.amount || 0);
    });
  const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  topCategory.value = top ? top[0] : "-";
}

const transactions = computed(() => {
  return store.items?.transactions ?? store.items ?? [];
});

onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
  renderSummary(transactions.value);
});

watch(transactions, (newTx) => renderSummary(newTx), { immediate: true });
</script>
<!-- <script setup>
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  inject,
  nextTick,
} from "vue";
import { useFinanceStore } from "../../stores/finance.js";

const store = useFinanceStore();

// inject filters ref provided by App.vue
// (expects App.vue to call provide("filters", filtersRef))
const filters = inject("filters");

// defensive: if injection failed, fallback to a local ref so component still works
const localFilters = ref({ start: null, end: null, category: "" });
const activeFiltersRef = filters ?? localFilters;

// reactive display values
const topCategory = ref("-");
const insightSavings = ref("0");
const totalTransactions = ref(0);

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

// compute & set summary fields (keeps formatting logic similar to your original)
function renderSummary(transactions = []) {
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((s, t) => s + Number(t.amount || 0), 0);

  const net = totalIncome - totalExpense;
  // group by month (YYYY-MM)
  const monthMap = {};

  transactions.forEach((t) => {
    const d = new Date(t.date + "T00:00:00");
    if (isNaN(d)) return;

    const key =
      d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");

    if (!monthMap[key]) {
      monthMap[key] = { income: 0, expense: 0 };
    }

    if (t.type === "income") monthMap[key].income += Number(t.amount || 0);
    else if (t.type === "expense")
      monthMap[key].expense += Number(t.amount || 0);
  });

  // compute monthly savings array
  const monthlySavings = Object.values(monthMap).map(
    (m) => m.income - m.expense
  );

  // actual monthly average saving
  const avgSave =
    monthlySavings.length > 0
      ? Math.round(
          monthlySavings.reduce((s, x) => s + x, 0) / monthlySavings.length
        )
      : 0;

  insightSavings.value = formatNum(avgSave);

  insightSavings.value = formatNum(avgSave);
  totalTransactions.value = transactions.length;

  // highest expense category
  const catTotals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catTotals[t.category] =
        (catTotals[t.category] || 0) + Number(t.amount || 0);
    });
  const top = Object.entries(catTotals).sort((a, b) => b[1] - a[1])[0];
  topCategory.value = top ? top[0] : "-";
}

// helper: normalize incoming filter values to Date or null
function normalizeDateFilter(raw) {
  if (!raw && raw !== 0) return null;
  // If it's already a Date
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }
  // If it's an ISO-ish string like "2025-11-16"
  try {
    const d = new Date(String(raw) + "T00:00:00");
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

// processedList: apply active filters to store.transactions
const processedList = computed(() => {
  const list = Array.isArray(store.transactions) ? [...store.transactions] : [];

  // read and normalize filters (we read activeFiltersRef.value so Vue tracks)
  const rawStart = activeFiltersRef.value?.start ?? null;
  const rawEnd = activeFiltersRef.value?.end ?? null;
  const cat = activeFiltersRef.value?.category ?? "";

  const s = normalizeDateFilter(rawStart);
  // make end inclusive by setting to end of day
  const e = normalizeDateFilter(rawEnd)
    ? new Date(normalizeDateFilter(rawEnd).getTime() + 24 * 60 * 60 * 1000 - 1)
    : null;

  return list.filter((t) => {
    if (!t?.date) return false;
    const td = normalizeDateFilter(t.date);
    if (!td) return false;

    if (s && td < s) return false;
    if (e && td > e) return false;
    if (cat && cat !== "" && t.category !== cat) return false;
    return true;
  });
});

// update function that pulls filtered transactions and renders summary
function updateFromFiltered() {
  const tx = processedList.value ?? [];
  renderSummary(tx);
}

// initialization and watchers
onMounted(() => {
  // initial render (ensure store is loaded first)
  if (typeof store.loadData === "function") {
    // loadData may be synchronous — awaiting is safe
    store.loadData();
  }

  // initial compute (after nextTick so any injected filters settle)
  nextTick().then(updateFromFiltered);

  // watch processedList for changes (either store or filters)
  const stopProcessedWatch = watch(
    () => processedList.value,
    (newList, oldList) => {
      updateFromFiltered();
    },
    { deep: true }
  );

  // also watch the store.transactions directly for safety (recompute on raw changes)
  const stopStoreWatch = watch(
    () => store.transactions,
    (newVal) => {
      updateFromFiltered();
    },
    { deep: true }
  );

  // if we have injected filters, watch them too (useful when parent mutates properties)
  let stopFiltersWatch = () => {};
  if (activeFiltersRef) {
    stopFiltersWatch = watch(
      () => activeFiltersRef.value,
      (v) => {
        updateFromFiltered();
      },
      { deep: true }
    );
  }

  // storage event to refresh across tabs
  function onStorage(e) {
    if (e.key === "financeData") updateFromFiltered();
  }
  window.addEventListener("storage", onStorage);

  onBeforeUnmount(() => {
    stopProcessedWatch();
    stopStoreWatch();
    stopFiltersWatch();
    window.removeEventListener("storage", onStorage);
  });
});
</script> -->

<style scoped lang="scss">
.summary {
  display: grid;
  grid-template-columns: repeat(auto-fit, 260px);
  gap: 14px;
  justify-content: center;
  margin-top: 24px;

  .card {
    background: var(--card);
    padding: 18px;
    border-radius: 12px;
    box-shadow: var(--shadow);

    .label {
      font-size: 0.9rem;
      margin: 0;
      font-weight: 600;
      color: var(--text);
    }

    h2 {
      margin: 8px 0 0;
      font-size: 1.35rem;
      color: var(--primary);
    }
  }
}
</style>

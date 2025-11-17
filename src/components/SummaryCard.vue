<template>
  <section class="summary">
    <div class="card">
      <p class="label">Total Income</p>
      <h2 id="total-income">₹{{ summary.income }}</h2>
    </div>
    <div class="card">
      <p class="label">Total Expenses</p>
      <h2 id="total-expense">₹{{ summary.expense }}</h2>
    </div>
    <div class="card">
      <p class="label">Net Balance</p>
      <h2 id="income-left">₹{{ summary.left }}</h2>
    </div>
    <div class="card">
      <p class="label">Expense-to-Income Ratio</p>
      <h2 id="expense-ratio">{{ summary.ratio }}%</h2>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useFinanceStore } from "@/stores/finance";
const store = useFinanceStore();

onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
});

function formatNum(n) {
  const neg = n < 0;
  const abs = Math.abs(n);
  const formatted = Number(abs).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: abs % 1 ? 2 : 0,
  });
  return (neg ? "-" : "") + formatted;
}

function calcTotals(list = []) {
  const totalIncome = list
    .filter((t) => t.type === "income")
    .reduce((s, x) => s + Number(x.amount || 0), 0);
  const totalExpense = list
    .filter((t) => t.type === "expense")
    .reduce((s, x) => s + Number(x.amount || 0), 0);
  const incomeLeft = totalIncome - totalExpense;
  const expenseRatio =
    totalIncome > 0 ? Math.round((totalExpense / totalIncome) * 100) : 0;
  return { totalIncome, totalExpense, incomeLeft, expenseRatio };
}

const summary = computed(() => {
  const tx = store.items?.transactions ?? store.items ?? [];
  const s = calcTotals(tx);
  return {
    income: formatNum(s.totalIncome),
    expense: formatNum(s.totalExpense),
    left: formatNum(s.incomeLeft),
    ratio: s.expenseRatio,
  };
});
</script>

<style scoped lang="scss">
.summary {
  display: grid;
  margin-bottom: 18px;
  grid-template-columns: repeat(auto-fit, 260px);
  gap: 14px;
  margin-bottom: 18px;
  justify-content: center;

  .card {
    background: var(--card);
    border-radius: 12px;
    padding: 18px;
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

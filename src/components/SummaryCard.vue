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
import { computed, inject } from "vue";

// inject the processedList computed (provided from App.vue)
const processedList = inject("processedList");

// defensive fallback: empty array if not provided
const safeList = computed(() => (processedList ? processedList.value : []));

// formatting helper (same as you had)
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

// summary computed based on safeList
const summary = computed(() => {
  const s = calcTotals(safeList.value);
  return {
    income: formatNum(s.totalIncome),
    expense: formatNum(s.totalExpense),
    left: formatNum(s.incomeLeft),
    ratio: s.expenseRatio,
  };
});
</script>

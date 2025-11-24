<template>
  <v-row dense class="sum py-2">
    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4">
        <p class="text-subtitle-2">Total Income</p>
        <h2 class="text-h5">₹{{ summary.income }}</h2>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4">
        <p class="text-subtitle-2">Total Expenses</p>
        <h2 class="text-h5">₹{{ summary.expense }}</h2>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4">
        <p class="text-subtitle-2">Net Balance</p>
        <h2 class="text-h5">₹{{ summary.left }}</h2>
      </v-card>
    </v-col>

    <v-col cols="12" sm="6" md="3">
      <v-card class="pa-4">
        <p class="text-subtitle-2">Expense-to-Income Ratio</p>
        <h2 class="text-h5">{{ summary.ratio }}%</h2>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useFinanceStore } from "@/stores/finance";
const store = useFinanceStore();

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
  const tx = store.transactions ?? [];
  const s = calcTotals(tx);
  return {
    income: formatNum(s.totalIncome),
    expense: formatNum(s.totalExpense),
    left: formatNum(s.incomeLeft),
    ratio: s.expenseRatio,
  };
});
</script>

<style lang="scss" scoped>
.sum {
  margin: 0 5.5rem;
}
</style>

<!-- <style scoped lang="scss">
.summary {
  display: grid;
  margin-bottom: 1.125rem;
  grid-template-columns: auto auto auto auto;
  gap: 0.875rem;

  .card {
    background: $card;
    border-radius: 0.75rem;
    padding: 1.125rem;
    box-shadow: $shadow;

    .label {
      font-size: 0.9rem;
      margin: 0;
      font-weight: 600;
      color: $text;
    }

    h2 {
      margin: 0.5rem 0 0;
      font-size: 1.35rem;
      color: $primary;
    }
  }
}
</style> -->

<template>
  <v-row dense class="insight pb-2">
    <v-col cols="12" sm="4">
      <v-card class="pa-4" elevation="2">
        <p class="text-subtitle-2">Highest Expense Category</p>
        <h2>{{ topCategory }}</h2>
      </v-card>
    </v-col>

    <v-col cols="12" sm="4">
      <v-card class="pa-4" elevation="2">
        <p class="text-subtitle-2">Avg Saving</p>
        <h2>₹{{ insightSavings }}</h2>
      </v-card>
    </v-col>

    <v-col cols="12" sm="4">
      <v-card class="pa-4" elevation="2">
        <p class="text-subtitle-2">Total Transactions</p>
        <h2>{{ totalTransactions }}</h2>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
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

  const monthlySavings = Object.values(monthMap).map(
    (m) => m.income - m.expense
  );
  const avgSave =
    monthlySavings.length > 0
      ? Math.round(
          monthlySavings.reduce((s, x) => s + x, 0) / monthlySavings.length
        )
      : 0;

  insightSavings.value = formatNum(avgSave);

  insightSavings.value = formatNum(avgSave);
  totalTransactions.value = transactions.length;

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

const transactions = computed(() => store.transactions ?? []);

onMounted(() => {
  renderSummary(transactions.value);
});
</script>

<style lang="scss" scoped>
.insight {
  margin: 0 5.5rem;
}
</style>

<!-- <style scoped lang="scss">
.summary {
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 0.875rem;
  margin-top: 1.5rem;

  .card {
    background: $card;
    padding: 1.125rem;
    border-radius: 0.75rem;
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

<template>
  <v-card class="bar pa-3">
    <h3 class="mb-2">Monthly Income vs Expense</h3>
    <canvas ref="canvasRef" id="barChart"></canvas>
  </v-card>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import { Chart, registerables } from "chart.js";
import { useFinanceStore } from "@/stores/finance";
import { useTheme } from "vuetify";

Chart.register(...registerables);

const canvasRef = ref(null);
let barChart = null;
const store = useFinanceStore();
const transactions = computed(() => store.transactions ?? []);

const vuetifyTheme = useTheme();
const isDark = computed(() => {
  try {
    return Boolean(vuetifyTheme.global?.name?.value === "dark");
  } catch {
    return document.body.classList.contains("dark");
  }
});

function getColors() {
  return {
    text: isDark.value ? "#e6eef8" : "#1f2937",
    grid: isDark.value ? "#2a2a3e" : "#e1e8ed",
    income: "#16a34a",
    expense: "#ef4444",
  };
}

function normalizeDate(raw) {
  if (!raw) return null;
  const d = raw instanceof Date ? raw : new Date(String(raw) + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

function buildMonthly(txns = []) {
  const monthly = {};
  txns.forEach((t) => {
    const td = normalizeDate(t.date);
    if (!td) return;
    const m =
      td.getFullYear() + "-" + String(td.getMonth() + 1).padStart(2, "0");
    monthly[m] ??= { income: 0, expense: 0 };
    const key = t.type === "income" ? "income" : "expense";
    monthly[m][key] += Number(t.amount || 0);
  });
  const months = Object.keys(monthly).sort();
  return {
    months,
    incomeData: months.map((m) => monthly[m].income),
    expenseData: months.map((m) => monthly[m].expense),
  };
}

function renderChart() {
  if (!canvasRef.value) return;
  if (barChart) barChart.destroy();
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

  const colors = getColors();
  const { months, incomeData, expenseData } = buildMonthly(transactions.value);

  barChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          backgroundColor: colors.income,
          borderRadius: 6,
        },
        {
          label: "Expense",
          data: expenseData,
          backgroundColor: colors.expense,
          borderRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: {
            color: colors.text,
            usePointStyle: true,
            pointStyle: "rectRounded",
          },
        },
        tooltip: {
          usePointStyle: true,
          titleColor: colors.text,
          bodyColor: colors.text,
          backgroundColor: isDark.value ? "rgba(15,23,36,0.9)" : "#fff",
          borderColor: colors.grid,
          borderWidth: 1,
          callbacks: {
            label: (ctx) => `${ctx.dataset.label}: ₹${ctx.formattedValue}`,
          },
        },
      },
      scales: {
        x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
        y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
      },
    },
  });
}

watchEffect(renderChart);
</script>

<style lang="scss" scoped>
.bar {
  margin: 0 5.7rem;
}
</style>

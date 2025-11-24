<template>
  <v-card class="bar pa-4">
    <h2 class="mb-4">Monthly Income vs Expense</h2>
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

<!-- <style lang="scss" scoped>
.chart-wrap {
  background: $card;
  position: relative;
  padding: 1.25rem;
  border-radius: 0.75rem;
  margin-top: 1.0625rem;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.08);
}

/* No data overlay */
.no-data {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.no-data-inner {
  pointer-events: auto;
  text-align: center;
  background: rgba(255, 255, 255, 0.92);
  color: #334155;
  padding: 1.125rem 1.375rem;
  border-radius: 0.625rem;
  box-shadow: 0 0.375rem 1.25rem rgba(16, 24, 40, 0.08);
  transform: translateY(-0.375rem);
}

.dark .no-data-inner {
  background: rgba(6, 8, 13, 0.7);
  color: #e6eef8;
  box-shadow: none;
}

.no-data-inner p {
  margin: 0 0 0.375rem;
  font-weight: 600;
  font-size: 0.9375rem;
}

.no-data-inner small {
  color: inherit;
  opacity: 0.8;
  font-size: 0.75rem;
}

canvas {
  width: 100% !important;
  height: 21.875rem !important;
  cursor: crosshair;
}
</style> -->

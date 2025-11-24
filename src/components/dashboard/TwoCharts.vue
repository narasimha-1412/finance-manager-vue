<template>
  <v-row class="chart py-1" align="stretch">
    <v-col cols="12" md="6">
      <v-card class="pa-4 h-100">
        <h2 class="mb-4">Expense Distribution by Category</h2>
        <canvas ref="pieRef" id="pieChart"></canvas>
      </v-card>
    </v-col>

    <v-col cols="12" md="6">
      <v-card class="pa-4 h-100">
        <h2 class="mb-4">Balance Over Time</h2>
        <canvas ref="lineRef" id="lineChart"></canvas>
      </v-card>
    </v-col>
  </v-row>
</template>

<script setup>
import { ref, computed, watchEffect } from "vue";
import { Chart, registerables } from "chart.js";
import { useFinanceStore } from "@/stores/finance";
import { useTheme } from "vuetify";

Chart.register(...registerables);

const pieRef = ref(null);
const lineRef = ref(null);
let pieChart = null;
let lineChart = null;

const store = useFinanceStore();
const transactions = computed(() => store.transactions ?? []);

const theme = useTheme();
const isDark = computed(() => {
  try {
    return theme.global?.name?.value === "dark";
  } catch {
    return false;
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
    const month =
      td.getFullYear() + "-" + String(td.getMonth() + 1).padStart(2, "0");
    monthly[month] ??= { income: 0, expense: 0 };
    const key = t.type === "income" ? "income" : "expense";
    monthly[month][key] += Number(t.amount || 0);
  });
  const months = Object.keys(monthly).sort();
  return {
    months,
    incomeData: months.map((m) => monthly[m].income),
    expenseData: months.map((m) => monthly[m].expense),
  };
}

function buildCategoryPie(txns = []) {
  const byCat = {};
  txns.forEach((t) => {
    const cat = t.category || "Uncategorized";
    byCat[cat] = (byCat[cat] || 0) + Number(t.amount || 0);
  });
  const labels = Object.keys(byCat);
  const data = labels.map((l) => byCat[l]);
  return { labels, data };
}

function createBar(ctx, months, incomeData, expenseData, colors) {
  return new Chart(ctx, {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Income",
          data: incomeData,
          borderColor: colors.income,
          fill: false,
          tension: 0.3,
        },
        {
          label: "Expense",
          data: expenseData,
          borderColor: colors.expense,
          fill: false,
          tension: 0.3,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: colors.text } },
        tooltip: {
          callbacks: {
            label: (c) => `${c.dataset.label}: ₹${c.formattedValue}`,
          },
          titleColor: colors.text,
          bodyColor: colors.text,
          backgroundColor: isDark.value ? "rgba(15,23,36,0.9)" : "#fff",
          borderColor: colors.grid,
        },
      },
      scales: {
        x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
        y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
      },
    },
  });
}

function generateColorPalette(n) {
  const palette = [];
  for (let i = 0; i < n; i++) {
    const hue = (i * 360) / n;
    palette.push(`hsl(${hue}, 70%, ${isDark.value ? "55%" : "45%"})`);
  }
  return palette;
}

function createPie(ctx, labels, data, colors) {
  return new Chart(ctx, {
    type: "pie",
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: generateColorPalette(labels.length),
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { labels: { color: colors.text } },
        tooltip: {
          callbacks: { label: (c) => `${c.label}: ₹${c.formattedValue}` },
          titleColor: colors.text,
          bodyColor: colors.text,
          backgroundColor: isDark.value ? "rgba(15,23,36,0.9)" : "#fff",
          borderColor: colors.grid,
        },
      },
    },
  });
}

watchEffect((onInvalidate) => {
  const txns = transactions.value ?? [];
  const colors = getColors();

  const { months, incomeData, expenseData } = buildMonthly(txns);
  if (lineRef.value?.getContext) {
    try {
      lineChart?.destroy();
    } catch {}
    lineChart = createBar(
      lineRef.value.getContext("2d"),
      months,
      incomeData,
      expenseData,
      colors
    );
  }

  const { labels, data } = buildCategoryPie(
    txns.filter((t) => t.type === "expense")
  );
  if (pieRef.value?.getContext) {
    try {
      pieChart?.destroy();
    } catch {}
    pieChart = createPie(pieRef.value.getContext("2d"), labels, data, colors);
  }

  onInvalidate(() => {
    try {
      lineChart?.destroy();
    } catch {}
    try {
      pieChart?.destroy();
    } catch {}
    lineChart = null;
    pieChart = null;
  });
});
</script>

<style lang="scss" scoped>
.chart {
  margin: 0 5rem;
}
</style>

<!-- <style lang="scss" scoped>
.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-top: 0.625rem;
  background: $card;
  border-radius: 0.75rem;
}

.chart-row > div {
  padding: 1.25rem;
  border-radius: 0.75rem;
  box-shadow: 0 0.125rem 0.375rem rgba(0, 0, 0, 0.08);
}

canvas {
  width: 100% !important;
  height: 21.875rem !important;
  cursor: crosshair;
}

@media (max-width: 900px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style> -->

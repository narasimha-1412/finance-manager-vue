<template>
  <section class="table-section" style="margin-top: 24px">
    <div class="card chart-row">
      <div>
        <h2>Expense Distribution by Category</h2>
        <canvas ref="pieRef" id="pieChart"></canvas>
      </div>

      <div>
        <h2>Balance Over Time</h2>
        <canvas ref="lineRef" id="lineChart"></canvas>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";
import { Chart } from "chart.js";
import { useFinanceStore } from "@/stores/finance";

const pieRef = ref(null);
let pieChart = null;
const lineRef = ref(null);
let lineChart = null;

const store = useFinanceStore();
const transactions = computed(() => store.transactions ?? []);

function getColors() {
  const isDark = document.body.classList.contains("dark");
  return {
    text: isDark ? "#e6eef8" : "#1f2937",
    grid: isDark ? "#2a2a3e" : "#e1e8ed",
    income: "#16a34a",
    expense: "#ef4444",
    balance: "#2563eb",
  };
}

function normalizeDate(raw) {
  if (raw === null || raw === undefined) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  const d = new Date(String(raw) + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}
function buildMonthly(txns = []) {
  const monthly = {};
  txns.forEach((t) => {
    const td = normalizeDate(t.date);
    if (!td) return;
    const month =
      td.getFullYear() + "-" + String(td.getMonth() + 1).padStart(2, "0");
    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
    const key = t.type === "income" ? "income" : "expense";
    monthly[month][key] += Number(t.amount || 0);
  });

  const months = Object.keys(monthly).sort();
  const incomeData = months.map((m) => monthly[m].income);
  const expenseData = months.map((m) => monthly[m].expense);
  const balanceData = months.map(
    (m, i) =>
      incomeData.slice(0, i + 1).reduce((s, x) => s + x, 0) -
      expenseData.slice(0, i + 1).reduce((s, x) => s + x, 0)
  );

  return { months, incomeData, expenseData, balanceData };
}

function renderPieChart(txns) {
  const colors = getColors();
  const catTotals = {};
  txns
    .filter((t) => t.type === "expense")
    .forEach(
      (t) =>
        (catTotals[t.category] =
          (catTotals[t.category] || 0) + Number(t.amount || 0))
    );

  const labels = Object.keys(catTotals);
  const values = Object.values(catTotals);
  if (!pieRef.value) return;

  pieChart = new Chart(pieRef.value.getContext("2d"), {
    type: "doughnut",
    data: {
      labels,
      datasets: [
        {
          data: values,
          backgroundColor: [
            "#ef4444",
            "#f97316",
            "#facc15",
            "#22c55e",
            "#3b82f6",
            "#8b5cf6",
          ],
          borderColor: "transparent",
        },
      ],
    },
    options: {
      plugins: {
        legend: { position: "bottom", labels: { color: colors.text } },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            label(ctx) {
              const total = values.reduce((a, b) => a + b, 0);
              const pct = total
                ? ((ctx.parsed / total) * 100).toFixed(1)
                : "0.0";
              return `${ctx.label}: ₹${(
                ctx.parsed || 0
              ).toLocaleString()} (${pct}%)`;
            },
          },
          titleColor: colors.text,
          bodyColor: colors.text,
          backgroundColor: document.body.classList.contains("dark")
            ? "rgba(15, 23, 36, 0.9)"
            : "#ffffff",
          borderColor: colors.grid,
          borderWidth: 1,
          padding: 10,
          displayColors: true,
        },
      },
    },
  });
}

function renderLineChart(txns) {
  const colors = getColors();
  const { months, balanceData } = buildMonthly(txns);
  if (!lineRef.value) return;

  lineChart = new Chart(lineRef.value.getContext("2d"), {
    type: "line",
    data: {
      labels: months,
      datasets: [
        {
          label: "Balance Over Time",
          data: balanceData,
          borderColor: colors.balance,
          backgroundColor: colors.balance + "20",
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: colors.balance,
        },
      ],
    },
    options: {
      plugins: {
        legend: { labels: { color: colors.text } },
        tooltip: {
          usePointStyle: true,
          callbacks: {
            label(ctx) {
              const val = ctx.parsed?.y ?? ctx.parsed ?? 0;
              return `₹${Number(val).toLocaleString()}`;
            },
          },
          titleColor: colors.text,
          bodyColor: colors.text,
          backgroundColor: document.body.classList.contains("dark")
            ? "rgba(15, 23, 36, 0.9)"
            : "#ffffff",
          borderColor: colors.grid,
          borderWidth: 1,
          padding: 10,
          displayColors: true,
        },
      },
      scales: {
        x: { ticks: { color: colors.text }, grid: { color: colors.grid } },
        y: { ticks: { color: colors.text }, grid: { color: colors.grid } },
      },
    },
  });
}

function renderCharts(txns = []) {
  renderPieChart(txns);
  renderLineChart(txns);
}

onMounted(() => {
  renderCharts(transactions.value ?? []);
});
</script>

<style lang="scss" scoped>
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
</style>

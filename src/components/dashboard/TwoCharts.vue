<template>
  <section class="table-section" style="margin-top: 24px">
    <div class="chart-row">
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
import { ref, watch, onMounted, onBeforeUnmount, computed } from "vue";
import { useFinanceStore } from "../../stores/finance";

// Chart.js v4 proper imports
import { Chart, registerables } from "chart.js";
Chart.register(...registerables);

const store = useFinanceStore();

// canvas references
const pieRef = ref(null);
let pieChart = null;

const lineRef = ref(null);
let lineChart = null;

// ===== Chart Colors =====
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

// ===== Helpers =====
function buildMonthly(transactions = []) {
  const monthly = {};
  transactions.forEach((t) => {
    const month = (t.date || "").slice(0, 7);
    if (!month) return;
    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };

    monthly[month][t.type === "income" ? "income" : "expense"] += Number(
      t.amount || 0
    );
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

function destroyCharts() {
  if (pieChart) {
    try {
      pieChart.destroy();
    } catch (e) {}
    pieChart = null;
  }
  if (lineChart) {
    try {
      lineChart.destroy();
    } catch (e) {}
    lineChart = null;
  }
}

// ===== PIE CHART =====
function renderPieChart(transactions) {
  const colors = getColors();

  const catTotals = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      catTotals[t.category] =
        (catTotals[t.category] || 0) + Number(t.amount || 0);
    });

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
              return `${ctx.label}: ₹${
                ctx.parsed?.toLocaleString() ?? 0
              } (${pct}%)`;
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
      // ensure canvas uses our colors for accessibility
    },
  });
}

// ===== LINE CHART =====
function renderLineChart(transactions) {
  const colors = getColors();

  const { months, balanceData } = buildMonthly(transactions);

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
              const val = ctx.parsed?.y ?? 0;
              return `₹${val.toLocaleString()}`;
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

// ===== MASTER RENDER =====
function renderCharts(transactions = []) {
  // destroy then re-create so Chart.js picks up fresh colors
  destroyCharts();
  renderPieChart(transactions);
  renderLineChart(transactions);
}

// ===== Reactive Transactions =====
const transactions = computed(() => store.items?.transactions ?? []);

// Reload charts on data change
watch(transactions, (newTx) => renderCharts(newTx ?? []), { deep: true });

// React to dark/light mode (from any tab) and explicit theme-changed event
function onStorage(e) {
  if (e.key === "financeData") {
    renderCharts(transactions.value ?? []);
  }
  if (e.key === "theme") {
    // if you use storage-based theme, re-render charts
    renderCharts(transactions.value ?? []);
  }
}

// explicit custom event from same-tab toggles (recommended from HeaderBar)
function onThemeChanged() {
  renderCharts(transactions.value ?? []);
}

onMounted(() => {
  renderCharts(transactions.value ?? []);
  window.addEventListener("storage", onStorage);
  window.addEventListener("theme-changed", onThemeChanged);
});

onBeforeUnmount(() => {
  destroyCharts();
  window.removeEventListener("storage", onStorage);
  window.removeEventListener("theme-changed", onThemeChanged);
});
</script>

<style scoped>
.chart-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* two equal columns */
  gap: 20px; /* spacing between the two boxes */
  margin-top: 10px;
}

/* Each chart box */
.chart-row > div {
  padding: 20px; /* equal padding */
  /* background: var(--card-bg, #fff); */
  border-radius: 12px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

/* Ensure canvas scales properly */
canvas {
  width: 100% !important;
  height: 350px !important; /* same height for both charts */
}

/* Responsive: stack on smaller screens */
@media (max-width: 900px) {
  .chart-row {
    grid-template-columns: 1fr;
  }
}
</style>

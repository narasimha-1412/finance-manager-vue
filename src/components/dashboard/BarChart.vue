<template>
  <section class="table-section">
    <h2>Monthly Income vs Expense</h2>
    <canvas ref="canvasRef" id="barChart"></canvas>
  </section>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";
import { useFinanceStore } from "../../stores/finance";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const store = useFinanceStore();
const canvasRef = ref(null);
let barChart = null;

// ========== COLORS BASED ON THEME ==========
function getColors() {
  const isDark = document.body.classList.contains("dark");
  return {
    text: isDark ? "#e6eef8" : "#1f2937",
    grid: isDark ? "#2a2a3e" : "#e1e8ed",
    income: "#16a34a",
    expense: "#ef4444",
  };
}

// ========== BUILD MONTHLY DATA ==========
function buildMonthly(transactions = []) {
  const monthly = {};

  transactions.forEach((t) => {
    const month = (t.date || "").slice(0, 7);
    if (!month) return;

    if (!monthly[month]) monthly[month] = { income: 0, expense: 0 };
    monthly[month][t.type === "income" ? "income" : "expense"] += Number(t.amount || 0);
  });

  const months = Object.keys(monthly).sort();
  const incomeData = months.map((m) => monthly[m].income);
  const expenseData = months.map((m) => monthly[m].expense);

  return { months, incomeData, expenseData };
}

// ========== DESTROY OLD CHART ==========
function destroyChart() {
  if (barChart) {
    try {
      barChart.destroy();
    } catch {}
    barChart = null;
  }
}

// ========== RENDER CHART ==========
function renderCharts(transactions = []) {
  destroyChart();

  const colors = getColors();
  const { months, incomeData, expenseData } = buildMonthly(transactions);

  if (!canvasRef.value) return;

  barChart = new Chart(canvasRef.value.getContext("2d"), {
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
          callbacks: {
            label(ctx) {
              return `${ctx.dataset.label}: ₹${ctx.formattedValue}`;
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

// ========== REACTIVE TRANSACTIONS ==========
const transactions = computed(() => store.items?.transactions ?? []);

// Auto re-render when data changes
watch(transactions, (newVal) => {
  renderCharts(newVal ?? []);
}, { deep: true });

// ========== THEME + STORAGE EVENTS ==========
function onStorage(e) {
  if (e.key === "financeData" || e.key === "theme") {
    renderCharts(transactions.value ?? []);
  }
}

function onThemeChanged() {
  renderCharts(transactions.value ?? []);
}

// ========== MOUNT ==========
onMounted(() => {
  renderCharts(transactions.value ?? []);
  window.addEventListener("storage", onStorage);
  window.addEventListener("theme-changed", onThemeChanged);
});

onBeforeUnmount(() => {
  destroyChart();
  window.removeEventListener("storage", onStorage);
  window.removeEventListener("theme-changed", onThemeChanged);
});
</script>

<template>
  <section class="table-section">
    <h2>Monthly Income vs Expense</h2>

    <div class="chart-wrap">
      <canvas ref="canvasRef" id="barChart"></canvas>

      <!-- No-data overlay -->
      <div v-if="noData" class="no-data">
        <div class="no-data-inner">
          <p>No data to display</p>
          <small>Try changing the date range or category filter.</small>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import {
  ref,
  onMounted,
  onBeforeUnmount,
  watch,
  computed,
  inject,
  nextTick,
} from "vue";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const canvasRef = ref(null);
let barChart = null;

// inject processedList (provided from parent). fallback to an empty ref
const injectedProcessedList = inject("processedList", ref([]));
const safeList = computed(() =>
  Array.isArray(injectedProcessedList?.value) ? injectedProcessedList.value : []
);

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

// ========== DATE NORMALIZER ==========
function normalizeDate(raw) {
  if (raw === null || raw === undefined) return null;
  if (raw instanceof Date) {
    return isNaN(raw.getTime()) ? null : raw;
  }
  const d = new Date(String(raw) + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

// ========== BUILD MONTHLY DATA ==========
function buildMonthly(transactions = []) {
  const monthly = {};

  transactions.forEach((t) => {
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

  return { months, incomeData, expenseData };
}

// ========== DESTROY OLD CHART ==========
function destroyChart() {
  if (barChart) {
    try {
      barChart.destroy();
    } catch (e) {
      // ignore
    }
    barChart = null;
  }
}

// ========== RENDER CHART ==========
function renderCharts(transactions = []) {
  destroyChart();

  const colors = getColors();
  const { months, incomeData, expenseData } = buildMonthly(transactions);

  if (!canvasRef.value) return;
  const ctx = canvasRef.value.getContext("2d");
  if (!ctx) return;

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

// computed flag for UI overlay
const noData = computed(() => {
  const { months } = buildMonthly(safeList.value ?? []);
  return !months || months.length === 0;
});

// Auto re-render when injected processed list changes
const stopProcessedWatch = watch(
  safeList,
  (newVal, oldVal) => {
    if (newVal === oldVal) return;
    renderCharts(newVal ?? []);
  },
  { immediate: true, deep: false, flush: "post" }
);

// ========== THEME + STORAGE EVENTS ==========
function onStorage(e) {
  if (e.key === "financeData" || e.key === "theme") {
    renderCharts(safeList.value ?? []);
  }
}

function onThemeChanged() {
  renderCharts(safeList.value ?? []);
}

// ========== MOUNT ==========
onMounted(() => {
  // initial render after microtasks settle
  nextTick().then(() => renderCharts(safeList.value ?? []));
  window.addEventListener("storage", onStorage);
  window.addEventListener("theme-changed", onThemeChanged);
});

onBeforeUnmount(() => {
  destroyChart();
  stopProcessedWatch();
  window.removeEventListener("storage", onStorage);
  window.removeEventListener("theme-changed", onThemeChanged);
});
</script>

<style scoped>
.chart-wrap {
  position: relative;
}

/* No data overlay */
.no-data {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none; /* let interactions pass to canvas if needed */
}

.no-data-inner {
  pointer-events: auto;
  text-align: center;
  background: rgba(255, 255, 255, 0.92);
  color: #334155;
  padding: 18px 22px;
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(16, 24, 40, 0.08);
  transform: translateY(-6px);
}

.dark .no-data-inner {
  background: rgba(6, 8, 13, 0.7);
  color: #e6eef8;
  box-shadow: none;
}

.no-data-inner p {
  margin: 0 0 6px;
  font-weight: 600;
  font-size: 15px;
}

.no-data-inner small {
  color: inherit;
  opacity: 0.8;
  font-size: 12px;
}

/* Canvas sizing (keeps previous rules) */
canvas {
  width: 100% !important;
  height: 350px !important;
}
</style>

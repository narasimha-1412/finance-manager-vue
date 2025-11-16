<template>
  <div class="container">
    <HeaderBar />
    <SummaryCard />

    <!-- listen for filter event coming from the routed page -->
    <router-view @filter-change-from-controlbar="filters = $event" />
  </div>
</template>

<script setup>
import { onMounted, ref, provide, computed } from "vue";
import { useFinanceStore } from "./stores/finance";
import HeaderBar from "./components/HeaderBar.vue";
import SummaryCard from "./components/SummaryCard.vue";

const filters = ref({ start: null, end: null, category: "" });
provide("filters", filters);

// -- safe date normalizer used by processedList --
function normalizeDate(raw) {
  if (raw === null || raw === undefined) return null;
  if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;
  const d = new Date(String(raw) + "T00:00:00");
  return isNaN(d.getTime()) ? null : d;
}

const store = useFinanceStore();
onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
});

// computed raw transactions (same shape used across app)
const rawTransactions = computed(() => store.items?.transactions ?? []);

// processedList computed once here and provided
const processedList = computed(() => {
  const list = Array.isArray(rawTransactions.value)
    ? [...rawTransactions.value]
    : [];

  const rawStart = filters.value?.start ?? null;
  const rawEnd = filters.value?.end ?? null;
  const cat = filters.value?.category ?? "";

  const s = normalizeDate(rawStart);
  const e = normalizeDate(rawEnd)
    ? new Date(normalizeDate(rawEnd).getTime() + 24 * 60 * 60 * 1000 - 1)
    : null;

  return list.filter((t) => {
    if (!t?.date) return false;
    const td = normalizeDate(t.date);
    if (!td) return false;
    if (s && td < s) return false;
    if (e && td > e) return false;
    if (cat && cat !== "" && t.category !== cat) return false;
    return true;
  });
});

// Provide the computed processedList to descendants
// Important: provide the computed itself so injected consumers remain reactive
provide("processedList", processedList);
</script>

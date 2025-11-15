<template>
  <section class="table-section">
    <h2>Transactions</h2>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              Date
              <button class="sort-btn" @click="handleSortClick('date')">{{ sortIcon('date') }}</button>
            </th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>
              Amount
              <button class="sort-btn" @click="handleSortClick('amount')">{{ sortIcon('amount') }}</button>
            </th>
            <th class="center">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="t in paginatedList" :key="t.id">
            <td>{{ t.date }}</td>
            <td v-html="escapeHtml(t.description || '-')"></td>
            <td v-html="escapeHtml(t.category || '-')"></td>
            <td>{{ t.type === 'income' ? 'Credit' : 'Expense' }}</td>
            <td>₹{{ formatNum(Number(t.amount)) }}</td>
            <td class="center actions">
              <!-- use emit defined in script -->
              <button class="edit" @click="emitEdit(t.id)">Edit</button>
              <button class="delete" @click="emitDelete(t.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination Controls -->
    <div class="pagination" v-show="totalItems > 0">
      <button class="btn page-arrow" :disabled="currentPage === 1" @click="prevPage" title="Previous Page">❮</button>

      <span id="page-numbers">
        <template v-for="(p, idx) in pageButtons" :key="`pb-${idx}`">
          <button
            v-if="p !== '...'"
            class="btn"
            :class="{ 'active-page': p === currentPage }"
            @click="setPage(p)"
          >{{ p }}</button>
          <span v-else style="padding:0 6px">…</span>
        </template>
      </span>

      <button class="btn page-arrow" :disabled="currentPage === totalPages" @click="nextPage" title="Next Page">❯</button>
    </div>

    <p id="no-data" v-if="totalItems === 0">No transactions yet. Add one!</p>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useFinanceStore } from "../stores/finance";

// declare emits so parent can listen
const emit = defineEmits(['edit','delete']);

// small helpers to forward template clicks (keeps template clean)
function emitEdit(id) { emit('edit', id); }
function emitDelete(id) { emit('delete', id); }

// props for filters
const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ start: null, end: null, category: "" })
  }
});

const store = useFinanceStore();

const ITEMS_PER_PAGE = 10;
const currentPage = ref(1);
const sortState = ref({ column: null, order: null });
const activeFilters = computed(() => props.filters ?? { start: null, end: null, category: "" });

// safe transactions (support either store.items.transactions or store.items)
const transactions = computed(() => store.items?.transactions ?? store.items ?? []);

// ensure store has data (harmless if already loaded)
onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
});

// --- sorting logic ---
function handleSortClick(col) {
  if (sortState.value.column !== col) {
    sortState.value = { column: col, order: "asc" };
  } else if (sortState.value.order === "asc") {
    sortState.value.order = "desc";
  } else if (sortState.value.order === "desc") {
    sortState.value = { column: null, order: null };
  } else {
    sortState.value.order = "asc";
  }
  currentPage.value = 1;
}

function sortIcon(col) {
  const icons = { asc: "↑", desc: "↓", none: "⬍" };
  if (sortState.value.column === col) return icons[sortState.value.order] || icons.none;
  return icons.none;
}

watch(activeFilters, () => {
  currentPage.value = 1;
}, { deep: true });

// processedList: apply filters to whole dataset (reduces whole data)
const processedList = computed(() => {
  let list = Array.isArray(transactions.value) ? [...transactions.value] : [];

  const s = activeFilters.value.start;
  const e = activeFilters.value.end;
  const cat = activeFilters.value.category;

  // apply filters to entire list
  list = list.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    if (s && d < s) return false;
    if (e && d > e) return false;
    if (cat && cat !== "" && t.category !== cat) return false;
    return true;
  });

  // existing sorting logic (keep it)
  if (sortState.value.column && sortState.value.order) {
    const dir = sortState.value.order === "asc" ? 1 : -1;
    if (sortState.value.column === "date") {
      list.sort((a, b) => dir * (new Date(a.date + "T00:00:00") - new Date(b.date + "T00:00:00")));
    } else if (sortState.value.column === "amount") {
      list.sort((a, b) => dir * (Number(a.amount) - Number(b.amount)));
    }
  } else {
    list.sort((a, b) => {
      const ida = Number(a.id), idb = Number(b.id);
      if (!Number.isNaN(ida) && !Number.isNaN(idb)) return idb - ida;
      return 0;
    });
  }

  return list;
});

const totalItems = computed(() => processedList.value.length);
const totalPages = computed(() => Math.max(1, Math.ceil(totalItems.value / ITEMS_PER_PAGE) || 1));

// clamp currentPage whenever processedList or totalPages change to avoid empty pages
watch([processedList, totalPages], () => {
  if (currentPage.value > totalPages.value) currentPage.value = totalPages.value || 1;
});

// paginatedList uses processedList (no change needed if already using it)
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return processedList.value.slice(start, start + ITEMS_PER_PAGE);
});

function setPage(p) {
  currentPage.value = Math.min(Math.max(1, p), totalPages.value);
}
function prevPage() { if (currentPage.value > 1) currentPage.value--; }
function nextPage() { if (currentPage.value < totalPages.value) currentPage.value++; }

// page buttons with ellipsis (keeps your original UX)
const pageButtons = computed(() => {
  const tp = totalPages.value;
  const cp = currentPage.value;
  const out = [];
  if (tp <= 5) {
    for (let i = 1; i <= tp; i++) out.push(i);
    return out;
  }
  if (cp <= 3) {
    out.push(1, 2, 3, "...", tp);
    return out;
  }
  if (cp >= tp - 2) {
    out.push(1, "...", tp - 2, tp - 1, tp);
    return out;
  }
  out.push(1, "...", cp - 1, cp, cp + 1, "...", tp);
  return out;
});

// --- helpers from your code ---
function formatNum(n) {
  const neg = n < 0;
  const abs = Math.abs(n);
  const formatted = Number(abs).toLocaleString(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: abs % 1 ? 2 : 0,
  });
  return (neg ? "-" : "") + formatted;
}
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
</script>

<template>
  <section class="table-section">
    <h2>Transactions</h2>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>
              Date
              <button class="sort-btn" @click="handleSortClick('date')">
                {{ sortIcon("date") }}
              </button>
            </th>
            <th>Description</th>
            <th>Category</th>
            <th>Type</th>
            <th>
              Amount
              <button class="sort-btn" @click="handleSortClick('amount')">
                {{ sortIcon("amount") }}
              </button>
            </th>
            <th class="center">Actions</th>
          </tr>
        </thead>

        <!-- make tbody scrollable while still rendering all paginated rows -->
        <tbody class="scroll-body">
          <tr v-for="t in paginatedList" :key="t.id">
            <td>{{ t.date }}</td>
            <td v-html="escapeHtml(t.description || '-')"></td>
            <td v-html="escapeHtml(t.category || '-')"></td>
            <td>{{ t.type === "income" ? "Credit" : "Expense" }}</td>
            <td>₹{{ formatNum(Number(t.amount)) }}</td>
            <td class="center actions">
              <button class="edit" @click="emitEdit(t.id)">Edit</button>
              <button class="delete" @click="emitDelete(t.id)">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="pagination" v-show="totalItems > 0">
      <button
        class="btn page-arrow"
        :disabled="currentPage === 1"
        @click="prevPage"
        title="Previous Page"
      >
        ❮
      </button>

      <span id="page-numbers">
        <template v-for="(p, idx) in pageButtons" :key="`pb-${idx}`">
          <button
            v-if="p !== '...'"
            class="btn"
            :class="{ 'active-page': p === currentPage }"
            @click="setPage(p)"
          >
            {{ p }}
          </button>
          <span v-else style="padding: 0 6px">…</span>
        </template>
      </span>

      <button
        class="btn page-arrow"
        :disabled="currentPage === totalPages"
        @click="nextPage"
        title="Next Page"
      >
        ❯
      </button>
    </div>

    <p id="no-data" v-if="totalItems === 0">No transactions yet. Add one!</p>
  </section>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useFinanceStore } from "../stores/finance";

const emit = defineEmits(["edit", "delete"]);
function emitEdit(id) {
  emit("edit", id);
}
function emitDelete(id) {
  emit("delete", id);
}

const props = defineProps({
  filters: {
    type: Object,
    default: () => ({ start: null, end: null, category: "" }),
  },
});

const store = useFinanceStore();
const ITEMS_PER_PAGE = 10;
const currentPage = ref(1);
const sortState = ref({ column: null, order: null });
const activeFilters = computed(
  () => props.filters ?? { start: null, end: null, category: "" }
);

const transactions = computed(
  () => store.items?.transactions ?? store.items ?? []
);

onMounted(() => {
  if (typeof store.loadData === "function") store.loadData();
});

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
  if (sortState.value.column === col)
    return icons[sortState.value.order] || icons.none;
  return icons.none;
}

watch(
  activeFilters,
  () => {
    currentPage.value = 1;
  },
  { deep: true }
);

const processedList = computed(() => {
  let list = Array.isArray(transactions.value) ? [...transactions.value] : [];
  const s = activeFilters.value.start;
  const e = activeFilters.value.end;
  const cat = activeFilters.value.category;

  list = list.filter((t) => {
    const d = new Date(t.date + "T00:00:00");
    if (s && d < s) return false;
    if (e && d > e) return false;
    if (cat && cat !== "" && t.category !== cat) return false;
    return true;
  });

  if (sortState.value.column && sortState.value.order) {
    const dir = sortState.value.order === "asc" ? 1 : -1;
    if (sortState.value.column === "date") {
      list.sort(
        (a, b) =>
          dir *
          (new Date(a.date + "T00:00:00") - new Date(b.date + "T00:00:00"))
      );
    } else if (sortState.value.column === "amount") {
      list.sort((a, b) => dir * (Number(a.amount) - Number(b.amount)));
    }
  } else {
    list.sort((a, b) => {
      const ida = Number(a.id),
        idb = Number(b.id);
      if (!Number.isNaN(ida) && !Number.isNaN(idb)) return idb - ida;
      return 0;
    });
  }

  return list;
});

const totalItems = computed(() => processedList.value.length);
const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalItems.value / ITEMS_PER_PAGE) || 1)
);

watch([processedList, totalPages], () => {
  if (currentPage.value > totalPages.value)
    currentPage.value = totalPages.value || 1;
});

const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * ITEMS_PER_PAGE;
  return processedList.value.slice(start, start + ITEMS_PER_PAGE);
});

function setPage(p) {
  currentPage.value = Math.min(Math.max(1, p), totalPages.value);
}
function prevPage() {
  if (currentPage.value > 1) currentPage.value--;
}
function nextPage() {
  if (currentPage.value < totalPages.value) currentPage.value++;
}

const pageButtons = computed(() => {
  const tp = totalPages.value,
    cp = currentPage.value,
    out = [];
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

<style scoped lang="scss">
.table-section {
  padding: 18px;
  border-radius: 12px;
  background: var(--card);
  box-shadow: var(--shadow);

  h2 {
    margin-bottom: 4px;
    margin-top: 0px;
  }

  .table-wrap {
    overflow: hidden; // table handles scrolling for tbody
  }

  table {
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed; // keep column widths stable when tbody is block

    th,
    td {
      padding: 10px 12px;
      border-bottom: 1px solid rgba(16, 24, 40, 0.04);
      text-align: left;
    }

    td.center,
    th.center {
      text-align: center;
    }

    thead tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }

    /* make tbody a scrollable block showing ~5 rows by default */
    tbody.scroll-body {
      display: block;
      max-height: 190px; /* ~5 rows — adjust if your row height differs */
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
    }

    /* keep rows rendering like table rows so cells align with header */
    tbody.scroll-body tr {
      display: table;
      width: 100%;
      table-layout: fixed;
    }
  }

  .sort-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.1rem;
    color: var(--muted);
    padding: 0 6px;
  }

  .actions button {
    margin: 0 4px;
    padding: 6px 8px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
  }

  .actions .edit {
    background: #16a34a;
    color: #fff;
  }
  .actions .delete {
    background: #ef4444;
    color: #fff;
  }

  #no-data {
    padding: 16px;
    text-align: center;
    color: var(--muted);
  }
}

.pagination {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;

  .page-arrow {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }
  .active-page {
    background: var(--primary);
    color: #fff;
    border: none;
  }
}
</style>

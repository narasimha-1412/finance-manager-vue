<template>
  <section class="table-section">
    <v-card class="table-wrap">
      <v-card-title>Transactions</v-card-title>
      <div class="table-container">
        <v-table height="300px" fixed-header>
          <thead>
            <tr>
              <th>
                Date
                <v-btn
                  variant="text"
                  size="x-small"
                  class="sort-btn"
                  @click="handleSortClick('date')"
                >
                  {{ sortIcon("date") }}
                </v-btn>
              </th>
              <th>Description</th>
              <th>Category</th>
              <th>Type</th>
              <th>
                Amount
                <v-btn
                  variant="text"
                  size="x-small"
                  class="sort-btn"
                  @click="handleSortClick('amount')"
                >
                  {{ sortIcon("amount") }}
                </v-btn>
              </th>
              <th class="center">Actions</th>
            </tr>
          </thead>

          <tbody class="scroll-body">
            <tr v-for="t in paginatedList" :key="t.id">
              <td>{{ t.date }}</td>
              <td v-html="escapeHtml(t.description || '-')"></td>
              <td v-html="escapeHtml(t.category || '-')"></td>
              <td>{{ t.type === "income" ? "Credit" : "Expense" }}</td>
              <td>₹{{ formatNum(Number(t.amount)) }}</td>
              <td class="center actions">
                <v-btn
                  density="comfortable"
                  class="edit"
                  @click="emitEdit(t.id)"
                  >Edit</v-btn
                >
                <v-btn
                  density="comfortable"
                  color="error"
                  class="delete"
                  @click="emitDelete(t.id)"
                  >Delete</v-btn
                >
              </td>
            </tr>
          </tbody>
        </v-table>
      </div>

      <div class="pagination my-2" v-show="totalItems > 0">
        <v-btn
          class="page-arrow"
          :disabled="currentPage === 1"
          @click="prevPage"
          text
          >❮</v-btn
        >

        <span id="page-numbers">
          <template v-for="(p, idx) in pageButtons" :key="`pb-${idx}`">
            <v-btn
              v-if="p !== '...'"
              class="btn-page"
              :variant="p === currentPage ? 'tonal' : 'text'"
              @click="setPage(p)"
              small
            >
              {{ p }}
            </v-btn>
            <span v-else class="ellipsis">…</span>
          </template>
        </span>

        <v-btn
          class="page-arrow"
          :disabled="currentPage === totalPages"
          @click="nextPage"
          text
          >❯</v-btn
        >
      </div>
    </v-card>

    <p id="no-data" v-if="totalItems === 0">No transactions</p>
  </section>
</template>

<script setup>
import { ref, computed } from "vue";
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
const activeFilters = computed(() => {
  if (props.filters !== null && props.filters !== undefined) {
    currentPage.value = 1;
    return props.filters;
  } else {
    return { start: null, end: null, category: "" };
  }
});

const transactions = computed(() => store.transactions ?? []);

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
}

function sortIcon(col) {
  const icons = { asc: "↑", desc: "↓", none: "⬍" };
  if (sortState.value.column === col)
    return icons[sortState.value.order] || icons.none;
  return icons.none;
}

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
  // border-radius: 0.75rem;
  margin: 0.2rem 5.5rem;

  // h2 {
  //   margin-bottom: 0.25rem;
  //   margin-top: 0;
  // }

  // .table-wrap {
  //   overflow: hidden;
  // }

  // table {
  //   width: 100%;
  //   border-collapse: collapse;
  //   table-layout: fixed;

  //   // th,
  //   // td {
  //   //   padding: 0.625rem 0.75rem;
  //   //   border-bottom: 0.0625rem solid rgba(16, 24, 40, 0.04);
  //   //   text-align: left;
  //   // }

  //   // td.center,
  //   // th.center {
  //   //   text-align: center;
  //   // }

  //   // thead tr {
  //   //   display: table;
  //   //   width: 100%;
  //   //   table-layout: fixed;
  //   // }

  //   // tbody.scroll-body {
  //   //   display: block;
  //   //   max-height: 15rem;
  //   //   overflow-y: auto;
  //   //   -webkit-overflow-scrolling: touch;
  //   // }

  //   // tbody.scroll-body tr {
  //   //   display: table;
  //   //   width: 100%;
  //   //   table-layout: fixed;
  //   // }
  // }

  .sort-btn {
    cursor: pointer;
    font-size: 1.1rem;
    // color: $muted;
    // padding: 0 0.375rem;
    transition: color 0.2s;
    font-size: 1.5rem;
    padding-bottom: 1.9rem;
    line-height: 1;
    // &:hover {
    //   color: accent;
    // }
  }

  .actions button {
    margin: 0 0.25rem;
    padding: 0.375rem 0.5rem;
    border-radius: 0.375rem;
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
    padding: 1rem;
    text-align: center;
    // color: $muted;
  }
}

.pagination {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;

  // .page-arrow {
  //   width: 2.125rem;
  //   height: 2.125rem;
  //   border-radius: 50%;
  //   display: inline-flex;
  //   align-items: center;
  //   justify-content: center;

  //   // &:hover:not(:disabled) {
  //   //   // background: $primary;
  //   //   color: #fff;
  //   // }

  //   // &:disabled {
  //   //   opacity: 0.4;
  //   //   cursor: not-allowed;
  //   // }
  // }

  // .active-page {
  //   // background: $primary;
  //   color: blue;
  //   border: none;
  // }

  // button {
  //   padding: 0.375rem 0.625rem;
  //   border-radius: 0.375rem;
  //   // border-color: $card;
  // }
}
</style>

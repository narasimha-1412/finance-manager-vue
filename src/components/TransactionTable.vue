<template>
  <section class="table-section">
    <v-card>
      <!-- <v-card-title>Transactions</v-card-title>
      <v-divider /> -->
      <v-table class="equal-cols" height="340px" fixed-header>
        <thead>
          <tr>
            <th>
              <v-btn
                class="font-weight-bold"
                :ripple="false"
                variant="text"
                size="regular"
                rounded="lg"
                @click="handleSortClick('date')"
                :append-icon="sortIcon('date')"
                >Date</v-btn
              >
            </th>
            <th class="font-weight-bold">Description</th>
            <th class="font-weight-bold">Category</th>
            <th class="font-weight-bold">Type</th>
            <th>
              <v-btn
                class="font-weight-bold"
                :ripple="false"
                variant="text"
                size="regular"
                rounded="lg"
                @click="handleSortClick('amount')"
                :append-icon="sortIcon('amount')"
                >Amount</v-btn
              >
            </th>
            <th class="font-weight-bold">Actions</th>
          </tr>
        </thead>

        <tbody>
          <tr v-for="t in paginatedList" :key="t.id">
            <td>{{ t.date }}</td>
            <td v-html="escapeHtml(t.description || '-')"></td>
            <td v-html="escapeHtml(t.category || '-')"></td>
            <td>{{ t.type === "income" ? "Credit" : "Expense" }}</td>
            <td>₹{{ formatNum(Number(t.amount)) }}</td>
            <td class="action-cell">
              <v-hover v-slot="{ hover }">
                <v-menu
                  open-on-hover
                  location="right"
                  :offset="[8, 0]"
                  close-on-content-click
                >
                  <template #activator="{ props: menuProps }">
                    <v-btn
                      v-bind="menuProps"
                      variant="text"
                      size="small"
                      class="menu-btn pa-0"
                      min-width="0"
                      height="25"
                      width="25"
                      :class="{ 'menu-btn--hover': hover }"
                      icon="mdi-dots-vertical"
                    >
                    </v-btn>
                  </template>

                  <v-card elevation="1" width="85">
                    <v-btn
                      min-width="0"
                      height="25"
                      width="25"
                      variant="plain"
                      class="pa-0 pl-2 d-flex justify-start"
                      @click="emitEdit(t.id)"
                      prepend-icon="mdi-pencil"
                    >
                      Edit
                    </v-btn>

                    <v-divider />

                    <v-btn
                      min-width="0"
                      height="25"
                      width="25"
                      variant="plain"
                      class="pa-0 pl-2 d-flex justify-start"
                      @click="emitDelete(t.id)"
                      prepend-icon="mdi-delete"
                    >
                      Delete
                    </v-btn>
                  </v-card>
                </v-menu>
              </v-hover>
            </td>
          </tr>
        </tbody>
      </v-table>
      <v-divider />
      <div class="pagination my-2" v-show="totalItems > 0">
        <v-btn
          :ripple="false"
          variant="flat"
          icon
          height="27"
          width="27"
          :disabled="currentPage === 1"
          @click="prevPage"
          >❮</v-btn
        >

        <span id="page-numbers">
          <template v-for="(p, idx) in pageButtons" :key="`pb-${idx}`">
            <v-btn
              v-if="p !== '...'"
              :variant="p === currentPage ? 'flat' : 'text'"
              @click="setPage(p)"
              :color="p === currentPage ? 'primary' : ''"
              :text-color="p === currentPage ? 'white' : ''"
              :ripple="false"
              icon
              height="27"
              width="27"
              style="font-size: 11px"
            >
              {{ p }}
            </v-btn>
            <span v-else class="ellipsis">…</span>
          </template>
        </span>

        <v-btn
          :ripple="false"
          variant="flat"
          icon
          height="27"
          width="27"
          :disabled="currentPage === totalPages"
          @click="nextPage"
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
  if (sortState.value.column !== col) return "mdi-swap-vertical";
  return sortState.value.order === "asc"
    ? "mdi-arrow-up"
    : sortState.value.order === "desc"
    ? "mdi-arrow-down"
    : "mdi-swap-vertical";
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
  margin: 0.2rem 5.5rem;

  #no-data {
    padding: 1rem;
    text-align: center;
  }
}

.equal-cols th,
.equal-cols td {
  width: 1%;
  vertical-align: middle;
}
.equal-cols th {
  font-weight: 600; /* semibold */
}

.action-cell {
  position: relative;
}

.menu-btn--hover {
  background-color: rgba(0, 0, 0, 0.04); /* light hover bg */
}

.v-card > .v-btn {
  width: 100%;
  justify-content: center;
}

.pagination {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  margin-top: 1rem;
}
</style>

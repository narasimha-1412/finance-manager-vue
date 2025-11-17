<template>
  <div class="right">
    <button class="btn primary edit" @click="openFilter()">Filter</button>
    <button class="btn reset delete" @click="clearFilters()">Clear</button>
  </div>

  <div
    id="filter-modal"
    class="modal"
    :class="{ show: showFilter }"
    aria-hidden="true"
    @click="backdropClose"
  >
    <div class="modal-content" role="dialog" aria-modal="true">
      <h3>Filter Transactions</h3>

      <form @submit.prevent="applyFilters">
        <label for="filter-start">From Date</label>
        <input id="filter-start" v-model="filterStart" type="date" />

        <label for="filter-end">To Date</label>
        <input id="filter-end" v-model="filterEnd" type="date" />

        <label for="filter-category">Category</label>
        <select id="filter-category" v-model="filterCategory">
          <option value="">All Categories</option>
          <option value="Salary">Salary</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Travel">Travel</option>
          <option value="Other">Other</option>
        </select>

        <div class="modal-actions">
          <button type="button" class="btn reset" @click="closeFilter()">
            Cancel
          </button>
          <button type="submit" class="btn primary">Apply</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["filter-change"]);
const showFilter = ref(false);

// filter state (same as your original)
const filters = ref({
  start: null,
  end: null,
  category: "",
});

// input refs
const filterStart = ref("");
const filterEnd = ref("");
const filterCategory = ref("");

// open / close modal
function openFilter() {
  showFilter.value = true;
}
function closeFilter() {
  showFilter.value = false;
}

// clicking outside modal
function backdropClose(e) {
  if (e.target.classList.contains("modal")) closeFilter();
}

// apply filters (replace with emit if parent handles filtering)
function applyFilters() {
  const payload = {
    start: filterStart.value ? new Date(filterStart.value) : null,
    end: filterEnd.value ? new Date(filterEnd.value) : null,
    category: filterCategory.value || "",
  };

  // console.log("FILTER APPLIED →", payload);   // ✅ verify here

  emit("filter-change", payload);
  closeFilter();
}

// clear filters
function clearFilters() {
  // console.log("FILTER CLEARED");   // ✅ verify
  emit("filter-change", { start: null, end: null, category: "" });
  closeFilter();
}
</script>

<style scoped lang="scss">
.right {
  display: flex;
  align-items: center;
  gap: 6px;
}

.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.45);
  padding: 20px;
  justify-content: center;
  align-items: center;
  &.show {
    display: flex;
  }
}

.modal-content {
  width: 100%;
  max-width: 420px;
  background: var(--card);
  border-radius: 12px;
  padding: 18px;
  box-shadow: var(--shadow);
}

h3 {
  margin-bottom: 12px;
}

label {
  display: block;
  margin: 8px 0 6px;
  font-weight: 600;
}

input[type="date"],
select {
  width: 100%;
  padding: 9px;
  border-radius: 8px;
  border: 1px solid #000;
  background: transparent;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>

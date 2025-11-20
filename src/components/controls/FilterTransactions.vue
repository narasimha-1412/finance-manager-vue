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

const filters = ref({
  start: null,
  end: null,
  category: "",
});

const filterStart = ref("");
const filterEnd = ref("");
const filterCategory = ref("");

function openFilter() {
  showFilter.value = true;
}
function closeFilter() {
  showFilter.value = false;
}

function backdropClose(e) {
  if (e.target.classList.contains("modal")) closeFilter();
}

function applyFilters() {
  const payload = {
    start: filterStart.value ? new Date(filterStart.value) : null,
    end: filterEnd.value ? new Date(filterEnd.value) : null,
    category: filterCategory.value || "",
  };

  emit("filter-change", payload);
  closeFilter();
}

function clearFilters() {
  emit("filter-change", { start: null, end: null, category: "" });
  closeFilter();
}
</script>

<style scoped lang="scss">
.right {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.45);
  padding: 1.25rem;
  justify-content: center;
  align-items: center;
  &.show {
    display: flex;
  }
}

.modal-content {
  width: 100%;
  max-width: 26.25rem;
  background: $card;
  border-radius: 0.75rem;
  padding: 1.125rem;
  box-shadow: $shadow;
}

h3 {
  margin-bottom: 0.75rem;
}

label {
  display: block;
  margin: 0.5rem 0 0.375rem;
  font-weight: 600;
}

input[type="date"],
select {
  width: 100%;
  padding: 0.5625rem;
  border-radius: 0.5rem;
  border: 0.0625rem solid #000;
  background: transparent;
  box-sizing: border-box;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style>

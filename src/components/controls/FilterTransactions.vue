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
          <button type="button" class="btn reset" @click="closeFilter()">Cancel</button>
          <button type="submit" class="btn primary">Apply</button>
        </div>
      </form>
    </div>
  </div>
</template>


<script setup>
import { ref } from "vue";

const emit = defineEmits(['filter-change']);
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


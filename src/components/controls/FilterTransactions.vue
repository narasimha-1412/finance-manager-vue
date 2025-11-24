<template>
  <span class="right">
    <v-btn color="primary" class="me-2" @click="openFilter">Filter</v-btn>
    <v-btn color="error" @click="clearFilters">Clear</v-btn>
  </span>

  <v-dialog v-model="showFilter" width="500">
    <v-card class="pa-2">
      <v-card-title>Filter Transactions</v-card-title>

      <v-card-text>
        <v-form @submit.prevent="applyFilters">
          <v-text-field
            v-model="filterStart"
            label="From Date"
            type="date"
            density="comfortable"
          />

          <v-text-field
            v-model="filterEnd"
            label="To Date"
            type="date"
            density="comfortable"
          />

          <v-select
            v-model="filterCategory"
            label="Category"
            placeholder="Select"
            persistent-placeholder
            :items="categories"
            clearable
            density="comfortable"
          />
          <v-row>
            <v-col class="d-flex justify-end">
              <v-btn color="error" @click="closeFilter">Cancel</v-btn>
              <v-btn color="primary" class="ms-2" type="submit">Apply</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";

const emit = defineEmits(["filter-change"]);

const showFilter = ref(false);

const filterStart = ref("");
const filterEnd = ref("");
const filterCategory = ref();

const categories = [
  "Salary",
  "Food",
  "Shopping",
  "Bills",
  "Entertainment",
  "Travel",
  "Other",
];

function openFilter() {
  showFilter.value = true;
}
function closeFilter() {
  showFilter.value = false;
}

function applyFilters() {
  emit("filter-change", {
    start: filterStart.value ? new Date(filterStart.value) : null,
    end: filterEnd.value ? new Date(filterEnd.value) : null,
    category: filterCategory.value || "",
  });

  closeFilter();
}

function clearFilters() {
  filterStart.value = "";
  filterEnd.value = "";
  filterCategory.value = "";

  emit("filter-change", { start: null, end: null, category: "" });
  closeFilter();
}
</script>

<style scoped lang="scss">
.right {
  display: flex;
  align-items: center;
  // gap: 0.375rem;
}

// .modal {
//   display: none;
//   position: fixed;
//   inset: 0;
//   background: rgba(2, 6, 23, 0.45);
//   padding: 1.25rem;
//   justify-content: center;
//   align-items: center;
//   &.show {
//     display: flex;
//   }
// }

// .modal-content {
//   width: 100%;
//   max-width: 26.25rem;
//   background: $card;
//   border-radius: 0.75rem;
//   padding: 1.125rem;
//   box-shadow: $shadow;
// }

// h3 {
//   margin-bottom: 0.75rem;
// }

// label {
//   display: block;
//   margin: 0.5rem 0 0.375rem;
//   font-weight: 600;
// }

// input[type="date"],
// select {
//   width: 100%;
//   padding: 0.5625rem;
//   border-radius: 0.5rem;
//   border: 0.0625rem solid #000;
//   background: transparent;
//   box-sizing: border-box;
// }

// .modal-actions {
//   display: flex;
//   justify-content: flex-end;
//   gap: 0.5rem;
//   margin-top: 0.75rem;
// }
</style>

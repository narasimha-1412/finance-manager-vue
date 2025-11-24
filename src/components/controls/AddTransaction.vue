<template>
  <v-dialog v-model="showModal" width="520" persistent>
    <v-card role="dialog" :aria-labelledby="'modal-title'">
      <v-card-title>
        <span id="modal-title">{{
          editId ? "Edit Transaction" : "Add Transaction"
        }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-row>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="tDate"
                label="Date"
                type="date"
                required
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="tType"
                :items="[
                  { label: 'Expense', value: 'expense' },
                  { label: 'Credit', value: 'income' },
                ]"
                item-title="label"
                item-value="value"
                label="Type"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="tCategory"
                :items="categories"
                label="Category"
                placeholder="Select"
                persistent-placeholder
                @update:modelValue="onCategoryChange"
                clearable
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6" v-if="showOther">
              <v-text-field
                v-model="tCategoryOther"
                label="Custom Category"
                placeholder="Enter custom category"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12">
              <v-text-field
                v-model="tDesc"
                label="Description"
                placeholder="Optional description"
                density="comfortable"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="tAmount"
                label="Amount"
                type="number"
                min="0"
                step="0.01"
                required
                density="comfortable"
              />
            </v-col>
          </v-row>
          <v-row>
            <v-col class="d-flex justify-end">
              <v-btn color="error" class="mr-2" @click="closeModal"
                >Cancel</v-btn
              >
              <v-btn color="primary" @click="onSubmit">Save</v-btn>
            </v-col>
          </v-row>
        </v-form>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref } from "vue";
import { useFinanceStore } from "@/stores/finance";

const store = useFinanceStore();

const showModal = ref(false);
const editId = ref(null);

const tDate = ref("");
const tType = ref("expense");
const tCategory = ref("");
const tCategoryOther = ref("");
const tDesc = ref("");
const tAmount = ref(0);

const showOther = ref(false);
const formRef = ref(null);

const categories = [
  "Salary",
  "Food",
  "Shopping",
  "Bills",
  "Entertainment",
  "Travel",
  "Other",
];

function openAdd() {
  editId.value = null;
  tDate.value = new Date().toISOString().slice(0, 10);
  tType.value = "expense";
  tCategory.value = "Salary";
  tCategoryOther.value = "";
  tAmount.value = 0;
  tDesc.value = "";
  showOther.value = false;
  showModal.value = true;
}

function openEdit(tx) {
  editId.value = tx.id;
  tDate.value = tx.date;
  tType.value = tx.type;

  if (categories.includes(tx.category)) {
    tCategory.value = tx.category;
    showOther.value = false;
    tCategoryOther.value = "";
  } else {
    tCategory.value = "Other";
    showOther.value = true;
    tCategoryOther.value = tx.category;
  }

  tAmount.value = tx.amount;
  tDesc.value = tx.description || "";
  showModal.value = true;
}

function closeModal() {
  showModal.value = false;
  editId.value = null;
}

function onCategoryChange(val) {
  showOther.value = val === "Other";
  if (!showOther.value) tCategoryOther.value = "";
}

function onSubmit() {
  const finalCategory =
    tCategory.value === "Other"
      ? tCategoryOther.value?.trim()
      : tCategory.value;

  if (!finalCategory) {
    // keep behavior simple — replace with snackbar if desired
    alert("Please enter a custom category.");
    return;
  }

  const obj = {
    id: editId.value || Date.now().toString(),
    date: tDate.value,
    type: tType.value,
    category: finalCategory,
    amount: Number(tAmount.value),
    description: tDesc.value.trim(),
  };

  if (editId.value) store.updateTransaction(obj);
  else store.addTransaction(obj);

  closeModal();
}

defineExpose({ openAdd, openEdit });
</script>

<!-- <style scoped lang="scss">
.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.45);
  align-items: center;
  justify-content: center;
  padding: 1.25rem;
  z-index: 50;
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
  margin: 0 0 0.625rem 0;
}

label {
  display: block;
  margin-top: 0.5rem;
  margin-bottom: 0.375rem;
  color: inherit;
  font-weight: 600;
}

input[type="text"],
input[type="date"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 0.5625rem;
  border-radius: 0.5rem;
  border: 0.0625rem solid #000;
  background: transparent;
  box-sizing: border-box;
}

#t-category-other {
  margin-top: 0.5rem;
}

.modal-actions {
  gap: 0.5rem;
  margin-top: 0.75rem;
}
</style> -->

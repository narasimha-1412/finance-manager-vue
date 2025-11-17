<template>
  <div
    class="modal"
    :class="{ show: showModal }"
    aria-hidden="!showModal"
    @click="backdropClick"
  >
    <div class="modal-content" role="dialog" aria-modal="true">
      <h3 id="modal-title">
        {{ editId ? "Edit Transaction" : "Add Transaction" }}
      </h3>

      <form @submit.prevent="onSubmit" ref="formRef">
        <label for="t-date">Date</label>
        <input id="t-date" type="date" v-model="tDate" required />

        <label for="t-type">Type</label>
        <select id="t-type" v-model="tType">
          <option value="expense">Expense</option>
          <option value="income">Credit</option>
        </select>

        <label for="t-category-select">Category</label>
        <select
          id="t-category-select"
          v-model="tCategory"
          @change="onCategoryChange"
        >
          <option value="Salary">Salary</option>
          <option value="Food">Food</option>
          <option value="Shopping">Shopping</option>
          <option value="Bills">Bills</option>
          <option value="Entertainment">Entertainment</option>
          <option value="Travel">Travel</option>
          <option value="Other">Other</option>
        </select>

        <input
          v-if="showOther"
          id="t-category-other"
          type="text"
          v-model="tCategoryOther"
          placeholder="Enter custom category"
          style="margin-top: 8px"
        />

        <label for="t-desc">Description</label>
        <input
          id="t-desc"
          type="text"
          v-model="tDesc"
          placeholder="Optional description"
        />

        <label for="t-amount">Amount</label>
        <input
          id="t-amount"
          type="number"
          min="0"
          step="0.01"
          v-model.number="tAmount"
          required
        />

        <div class="modal-actions">
          <button type="button" class="btn reset" @click="closeModal">
            Cancel
          </button>
          <button type="submit" class="btn primary">Save</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, defineExpose } from "vue";
import { useFinanceStore } from "../../stores/finance";

const store = useFinanceStore();

const showModal = ref(false);
const editId = ref(null);

const tDate = ref("");
const tType = ref("expense");
const tCategory = ref("Salary");
const tCategoryOther = ref("");
const tDesc = ref("");
const tAmount = ref(0);

const showOther = ref(false);
const formRef = ref(null);

const defaultCategories = [
  "Salary",
  "Food",
  "Shopping",
  "Bills",
  "Entertainment",
  "Travel",
  "Other",
];

/* ===============================
   OPEN ADD MODE
================================*/
function openAdd() {
  editId.value = null;
  const today = new Date().toISOString().slice(0, 10);

  tDate.value = today;
  tType.value = "expense";
  tCategory.value = "Salary";
  tCategoryOther.value = "";
  tAmount.value = 0;
  tDesc.value = "";
  showOther.value = false;

  showModal.value = true;
}

/* ===============================
   OPEN EDIT MODE
================================*/
function openEdit(tx) {
  editId.value = tx.id;
  tDate.value = tx.date;
  tType.value = tx.type;

  if (defaultCategories.includes(tx.category)) {
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

/* ===============================
   CLOSE MODAL
================================*/
function closeModal() {
  showModal.value = false;
  editId.value = null;
}

/* close if clicked outside */
function backdropClick(e) {
  if (e.target.classList.contains("modal")) closeModal();
}

/* category change */
function onCategoryChange() {
  showOther.value = tCategory.value === "Other";
  if (!showOther.value) tCategoryOther.value = "";
}

/* ===============================
   SAVE
================================*/
function onSubmit() {
  const finalCategory =
    tCategory.value === "Other" ? tCategoryOther.value.trim() : tCategory.value;

  if (!finalCategory) {
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

/* expose modal methods to parent */
defineExpose({ openAdd, openEdit });
</script>

<style scoped lang="scss">
.modal {
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(2, 6, 23, 0.45);
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 50;
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
  margin: 0 0 10px 0;
}

label {
  display: block;
  margin-top: 8px;
  margin-bottom: 6px;
  color: inherit;
  font-weight: 600;
}

input[type="text"],
input[type="date"],
input[type="number"],
select,
textarea {
  width: 100%;
  padding: 9px;
  border-radius: 8px;
  border: 1px solid #000;
  background: transparent;
  box-sizing: border-box;
}

#t-category-other {
  margin-top: 8px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 12px;
}
</style>

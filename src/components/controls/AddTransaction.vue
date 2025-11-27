<template>
  <v-dialog v-model="showModal" width="500">
    <v-card class="pa-2" role="dialog">
      <v-card-title class="font-weight-bold"
        >{{ editId ? "Edit Transaction" : "Add Transaction" }}
      </v-card-title>

      <v-card-text class="pa-1">
        <v-form ref="formRef" @submit.prevent="onSubmit">
          <v-row dense>
            <v-col cols="12" md="6">
              <v-text-field
                v-model="tDate"
                label="Date *"
                type="date"
                required
                variant="outlined"
                :rules="[(v) => !!v || 'Date is required']"
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
                label="Type *"
                variant="outlined"
                :rules="[(v) => !!v || 'Type is required']"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-select
                v-model="tCategory"
                :items="categories"
                label="Category *"
                placeholder="Select"
                persistent-placeholder
                @update:modelValue="onCategoryChange"
                clearable
                variant="outlined"
                :rules="[(v) => !!v || 'Category is required']"
              />
            </v-col>

            <v-col cols="12" md="6" v-if="showOther">
              <v-text-field
                v-model="tCategoryOther"
                label="Custom Category"
                placeholder="Enter custom category"
                variant="outlined"
              />
            </v-col>

            <v-col cols="12" md="6">
              <v-text-field
                v-model.number="tAmount"
                label="Amount *"
                type="number"
                min="0"
                step="0.01"
                required
                variant="outlined"
                :rules="[
                  (v) => !!v || 'Amount is required',
                  (v) => v > 0 || 'Amount must be > 0',
                ]"
              />
            </v-col>

            <v-col cols="12">
              <v-textarea
                v-model="tDesc"
                label="Description"
                variant="outlined"
              />
            </v-col>
          </v-row>
          <v-row dense>
            <v-col class="d-flex justify-end">
              <v-btn size="small" color="error" class="mr-2" @click="closeModal"
                >Cancel</v-btn
              >
              <v-btn size="small" color="primary" @click="onSubmit">Save</v-btn>
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

async function onSubmit() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;

  const finalCategory =
    tCategory.value === "Other"
      ? tCategoryOther.value?.trim()
      : tCategory.value;

  if (!finalCategory) {
    alert("Please enter a custom category.");
    return;
  }

  const amountNum = Number(tAmount.value);
  if (!isFinite(amountNum) || amountNum <= 0) {
    alert("Please enter a valid amount greater than 0.");
    return;
  }

  const obj = {
    id: editId.value || Date.now().toString(),
    date: tDate.value,
    type: tType.value,
    category: finalCategory,
    amount: amountNum,
    description: (tDesc.value || "").trim(),
  };

  if (editId.value) store.updateTransaction(obj);
  else store.addTransaction(obj);

  closeModal();
}

defineExpose({ openAdd, openEdit });
</script>

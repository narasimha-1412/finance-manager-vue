import { defineStore } from "pinia";
import seedData from "../assets/data.json";

const LS_KEY = "financeData";

export const useFinanceStore = defineStore("finance", {
  state: () => ({
    transactions: [],
  }),

  getters: {
    transactionsList(state) {
      return state.transactions || [];
    },
  },

  actions: {
    saveLocal() {
      localStorage.setItem(
        LS_KEY,
        JSON.stringify({ transactions: this.transactions })
      );
    },

    loadData() {
      const raw = localStorage.getItem(LS_KEY);

      if (raw) {
        try {
          const parsed = JSON.parse(raw);

          if (parsed && Array.isArray(parsed.transactions)) {
            this.transactions = parsed.transactions;
            return;
          }
        } catch (e) {
          console.warn("Corrupt LS, using seed instead");
        }
      } else {
        this.transactions = seedData.transactions || [];
      }

      this.saveLocal();
    },

    addTransaction(tx) {
      this.transactions.unshift(tx);
      this.saveLocal();
    },

    updateTransaction(tx) {
      const idx = this.transactions.findIndex((t) => t.id === tx.id);
      if (idx !== -1) this.transactions.splice(idx, 1, tx);
      else this.transactions.unshift(tx);
      this.saveLocal();
    },

    deleteTransaction(id) {
      this.transactions = this.transactions.filter((t) => t.id !== id);
      this.saveLocal();
    },
  },
});

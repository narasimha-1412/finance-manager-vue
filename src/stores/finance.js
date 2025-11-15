// src/stores/finance.js
import { defineStore } from "pinia";
import seedData from "../assets/data.json"; // ← local seed

const LS_KEY = "financeData";

export const useFinanceStore = defineStore("finance", {
  state: () => ({
    items: { transactions: [] },
  }),

  getters: {
    transactions(state) {
      return state.items.transactions || [];
    },
  },

  actions: {
    saveLocal() {
      localStorage.setItem(LS_KEY, JSON.stringify(this.items));
    },

    loadData() {
      // 1) Check localStorage
      const raw = localStorage.getItem(LS_KEY);

      if (raw) {
        try {
          const parsed = JSON.parse(raw);

          if (parsed && Array.isArray(parsed.transactions)) {
            this.items = parsed;
            return;
          }
        } catch (e) {
          console.warn("Corrupt LS, using seed instead");
        }
      } else {
        this.items = seedData;
      }

      // 3) Save seed to LS
      this.saveLocal();
    },

    addTransaction(tx) {
      this.items.transactions.unshift(tx);
      this.saveLocal();
    },

    updateTransaction(tx) {
      const idx = this.items.transactions.findIndex((t) => t.id === tx.id);
      if (idx !== -1) this.items.transactions.splice(idx, 1, tx);
      else this.items.transactions.unshift(tx);
      this.saveLocal();
    },

    deleteTransaction(id) {
      this.items.transactions = this.items.transactions.filter(
        (t) => t.id !== id
      );
      this.saveLocal();
    },
  },
});

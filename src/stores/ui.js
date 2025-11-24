import { defineStore } from "pinia";

export const useUiStore = defineStore("theme", {
  state: () => ({
    theme: localStorage.getItem("theme") || "light",
  }),

  getters: {
    isDark(state) {
      return state.theme === "dark";
    },
  },

  actions: {
    toggle() {
      this.theme = this.theme === "light" ? "dark" : "light";
      localStorage.setItem("theme", this.theme);
    },
  },
});

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
    toggleTheme() {
      this.theme = this.theme === "dark" ? "light" : "dark";
      this.applyTheme();
    },

    applyTheme() {
      localStorage.setItem("theme", this.theme);

      document.body.classList.toggle("dark", this.theme === "dark");

      window.dispatchEvent(
        new CustomEvent("theme-changed", { detail: this.theme })
      );
    },
  },
});

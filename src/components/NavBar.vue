<template>
  <header>
    <div class="left">
      <h1>Finance Manager</h1>
    </div>

    <div class="right">
      <button class="btn primary" @click="goDashboard">
        {{ isDashboard ? "← Back" : "Dashboard" }}
      </button>
      <button class="btn primary" @click="toggleTheme">
        {{ isDark ? "Light" : "Dark" }}
      </button>
      <button class="btn reset" @click="resetData">Reset Data</button>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFinanceStore } from "../stores/finance";
import { useThemeStore } from "../stores/theme";

const store = useFinanceStore();
const router = useRouter();
const route = useRoute();

const theme = useThemeStore();

const isDark = computed(() => theme.isDark);

// navigation
const isDashboard = computed(() => route.path === "/dashboard");
function goDashboard() {
  if (isDashboard.value) router.push("/");
  else router.push("/dashboard");
}

// reset data
function resetData() {
  const ok = confirm("This will erase all saved transactions.\n\nContinue?");
  if (!ok) return;
  localStorage.removeItem("financeData");
  store.loadData();
}

// toggle theme
function toggleTheme() {
  theme.toggleTheme();
}

onMounted(() => {
  if (typeof theme.applyTheme === "function") {
    theme.applyTheme();
  } else {
    document.body.classList.toggle("dark", theme.isDark);
    window.dispatchEvent(
      new CustomEvent("theme-changed", { detail: theme.theme })
    );
  }
});
</script>

<style scoped lang="scss">
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: var(--card);
  box-shadow: var(--shadow);
  display: flex;
  justify-content: space-between;
  align-items: center;
  // margin-bottom: 10px;
  padding: 13px;

  .left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  h1 {
    font-size: 1.6rem;
    margin: 0;
    padding-left: 10px;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 6px;
  }
}
</style>

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
import { computed, ref, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFinanceStore } from "../stores/finance";

const store = useFinanceStore();
const router = useRouter();
const route = useRoute();

// current theme state (NOT saved anywhere)
const isDark = ref(false);

// Dashboard detection (reactive)
const isDashboard = computed(() => route.path === "/dashboard");

// --- Reset Logic ---
function resetData() {
  const ok = confirm("This will erase all saved transactions.\n\nContinue?");
  if (!ok) return;

  localStorage.removeItem("financeData");
  store.loadData();
}

// --- Navigation ---
function goDashboard() {
  if (isDashboard.value) router.push("/");
  else router.push("/dashboard");
}

// --- Theme Toggle ---
function toggleTheme() {
  isDark.value = !isDark.value;

  if (isDark.value) document.body.classList.add("dark");
  else document.body.classList.remove("dark");

  // tell dashboard charts to re-render
  window.dispatchEvent(new Event("theme-changed"));
}

// Default on mount: ALWAYS light mode
onMounted(() => {
  document.body.classList.remove("dark");
  isDark.value = false;
});
</script>

<template>
  <header>
    <div class="left">
      <h1>Finance Manager</h1>
    </div>

    <div class="right">
      <button class="btn primary" @click="goDashboard">
        {{ isDashboard ? "← Back" : "Dashboard" }}
      </button>
      <!-- <button class="btn primary" @click="toggleTheme">
        {{ isDark ? "Light" : "Dark" }}
      </button> -->
      <button class="btn reset" @click="resetData">Reset Data</button>
    </div>
  </header>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFinanceStore } from "../stores/finance";
// import { useUiStore } from "../stores/ui";

const store = useFinanceStore();
const router = useRouter();
const route = useRoute();

// const theme = useUiStore();

// const isDark = computed(() => theme.isDark);

const isDashboard = computed(() => route.path === "/dashboard");
function goDashboard() {
  if (isDashboard.value) router.push("/");
  else router.push("/dashboard");
}

function resetData() {
  const ok = confirm("This will erase all saved transactions.\n\nContinue?");
  if (!ok) return;
  localStorage.removeItem("financeData");
  store.loadData();
}
</script>

<style scoped lang="scss">
header {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 1000;
  background: $card;
  box-shadow: $shadow;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.8125rem;
  box-sizing: border-box;

  .left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  h1 {
    font-size: 1.6rem;
    margin: 0;
    padding-left: 0.625rem;
  }

  .right {
    display: flex;
    align-items: center;
    gap: 0.375rem;
  }
}
</style>

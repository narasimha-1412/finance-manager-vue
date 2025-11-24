<template>
  <v-card class="pa-2">
    <v-row align="center" no-gutters>
      <v-col cols="auto">
        <div class="text-h5">Finance Manager</div>
      </v-col>

      <v-spacer />

      <v-col cols="auto">
        <v-btn class="me-2" @click="toggleTheme">
          {{ isDark ? "Light" : "Dark" }}
        </v-btn>
        <v-btn class="me-2" color="primary" @click="goDashboard">
          {{ isDashboard ? "← Back" : "Dashboard" }}
        </v-btn>
        <v-btn color="error" @click="resetData">Reset Data</v-btn>
      </v-col>
    </v-row>
  </v-card>
</template>

<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useFinanceStore } from "../stores/finance";
import { useTheme } from "vuetify";

const theme = useTheme();

const store = useFinanceStore();
const router = useRouter();
const route = useRoute();

const isDark = computed(() => theme.global.name.value === "dark");

function toggleTheme() {
  const newTheme = isDark.value ? "light" : "dark";

  theme.global.name.value = newTheme;
  localStorage.setItem("theme", newTheme);
}

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

<!-- <style scoped lang="scss">
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
</style> -->

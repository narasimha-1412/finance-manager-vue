<template>
  <v-card class="pa-2">
    <v-row align="center" no-gutters>
      <v-col cols="auto">
        <div class="font-weight-bold text-h4">
          <v-icon icon="mdi-finance"></v-icon> Finance Manager
        </div>
      </v-col>

      <v-spacer />
      <v-col cols="auto">
        <v-btn
          size="x-small"
          class="me-2"
          @click="toggleTheme"
          :icon="
            isDark ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'
          "
        >
        </v-btn>

        <v-btn
          class="me-2"
          size="small"
          color="primary"
          @click="goDashboard"
          :prepend-icon="isDashboard ? 'mdi-arrow-left-thick' : ''"
        >
          {{ isDashboard ? "Back" : "Dashboard" }}
        </v-btn>
        <v-btn size="small" color="error" @click="resetData">Reset Data</v-btn>
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

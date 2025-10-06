<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { UC } from "../types/uc";

import UCCard from "./UCCard.vue";
import UCFilter from "./UCFilter.vue";
import UCSearch from "./UCSearch.vue";

import { ensureActivePinia } from "@/lib/pinia";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

ensureActivePinia();
const favoritesStore = useFavoritesStore();

const ucs = ref<UC[]>([]);
const searchTerm = ref("");
const selectedPerfil = ref("todos");
const loading = ref(true);
const error = ref<string | null>(null);
const perfis = ref<string[]>([]);

onMounted(async () => {
  try {
    const res = await fetch("/data/ucs.json");
    if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
    const data: UC[] = await res.json();
    ucs.value = data;

    perfis.value = ["todos", ...Array.from(new Set(data.map((uc) => uc.perfil)))];
  } catch (err) {
    console.error(err);
    error.value = "Erro ao carregar as unidades curriculares favoritas.";
  } finally {
    loading.value = false;
  }
});

const filteredFavoriteUcs = computed(() => {
  const favoriteSlugs = Array.from(favoritesStore.favorites);
  let filtered = ucs.value.filter((uc) => favoriteSlugs.includes(uc.slug));

  if (selectedPerfil.value !== "todos") {
    filtered = filtered.filter((uc) => uc.perfil === selectedPerfil.value);
  }

  if (searchTerm.value) {
    filtered = filtered.filter((uc) =>
      uc.nome.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }

  return filtered;
});
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <p class="text-muted-foreground text-lg">
        A carregar unidades curriculares favoritas...
      </p>
    </div>

    <div v-else-if="error" class="text-center py-12">
      <p class="text-destructive text-lg">{{ error }}</p>
      <p class="text-muted-foreground text-sm mt-2">
        Verifique se o ficheiro de dados está disponível.
      </p>
    </div>

    <div v-else class="space-y-6">
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="flex-1">
          <UCSearch v-model="searchTerm" />
        </div>
        <div class="sm:w-auto w-full">
          <UCFilter v-model="selectedPerfil" :perfis="perfis" />
        </div>
      </div>

      <div
        v-if="filteredFavoriteUcs.length > 0"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch"
      >
        <UCCard v-for="(uc, index) in filteredFavoriteUcs" :key="index" :uc="uc" />
      </div>

      <div v-else class="text-center py-12">
        <p class="text-muted-foreground text-lg">
          Ainda não marcaste nenhuma unidade curricular como favorita.
        </p>
        <p class="text-sm text-muted-foreground mt-2">
          Volta à <a href="/" class="text-primary hover:underline">página principal</a> para escolher as tuas favoritas.
        </p>
      </div>
    </div>
  </div>
</template>

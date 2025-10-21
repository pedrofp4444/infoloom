<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import type { UC } from "../types/uc";

import UCCard from "./UCCard.vue";
import UCFilter from "./UCFilter.vue";
import UCSearch from "./UCSearch.vue";

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
    error.value = "Erro ao carregar as unidades curriculares";
  } finally {
    loading.value = false;
  }
});

const filteredUcs = computed(() => {
  let filtered = [...ucs.value];
  if (selectedPerfil.value !== "todos") {
    filtered = filtered.filter((uc) => uc.perfil === selectedPerfil.value);
  }
  if (searchTerm.value) {
    filtered = filtered.filter((uc) =>
      uc.nome.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      uc.sigla.toLowerCase().includes(searchTerm.value.toLowerCase())
    );
  }
  return filtered;
});
</script>

<template>
  <div>
    <div v-if="loading" class="text-center py-12">
      <p class="text-muted-foreground text-lg">
        A carregar unidades curriculares...
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
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 items-stretch"
      >
        <UCCard v-for="(uc, index) in filteredUcs" :key="index" :uc="uc" />
      </div>

      <div v-if="filteredUcs.length === 0" class="text-center py-12">
        <p class="text-muted-foreground text-lg">Nenhuma unidade curricular encontrada.</p>
        <p class="text-muted-foreground text-sm mt-2">
          Tente ajustar os filtros ou termo de pesquisa.
        </p>
      </div>
    </div>
  </div>
</template>

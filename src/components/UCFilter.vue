<script setup lang="ts">
import { Filter, ChevronDown } from "lucide-vue-next";

defineProps<{
  modelValue: string;
  perfis: string[];
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const onChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  console.log("Selected perfil:", target.value);
  emit("update:modelValue", target.value);
};
</script>

<template>
  <div class="flex items-center gap-2 w-full sm:min-w-[200px]">
    <Filter class="h-4 w-4 text-muted-foreground flex-shrink-0" />
    <div class="relative w-full">
      <select
        :value="modelValue"
        @change="onChange"
        class="w-full px-3 py-2 pr-8 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 shadow-sm transition-colors appearance-none"
      >
        <option disabled value="">Filtrar por perfil</option>
        <option v-for="perfil in perfis" :value="perfil" :key="perfil">
          {{ perfil === "todos" ? "Todos os perfis" : perfil }}
        </option>
      </select>
      <ChevronDown class="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
    </div>
  </div>
</template>

<style scoped>
select {
  background-image: none;
}
</style>

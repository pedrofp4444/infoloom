<script setup lang="ts">
import { Search } from "lucide-vue-next";

defineProps<{ modelValue: string }>();
const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
}>();

const onInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  console.log("Search input:", target.value);
  emit("update:modelValue", target.value);
};
</script>

<template>
  <div class="relative flex-1">
    <Search class="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <input
      type="text"
      :value="modelValue"
      @input="onInput"
      placeholder="Pesquisar unidades curriculares..."
      class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 shadow-sm transition-colors"
    />
  </div>
</template>

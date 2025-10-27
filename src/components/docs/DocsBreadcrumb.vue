<template>
  <nav class="flex items-center space-x-1 text-sm text-muted-foreground mb-6">
    <template v-for="(item, index) in items" :key="index">
      <span
        class="transition-colors"
        :class="{ 'text-foreground font-medium': index === items.length - 1 }"
      >
        {{ item.label }}
      </span>
      <ChevronRight
        v-if="index < items.length - 1"
        class="h-4 w-4"
      />
    </template>
  </nav>
</template>

<script setup lang="ts">
import { ChevronRight } from 'lucide-vue-next';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface Props {
  items: BreadcrumbItem[];
}

defineProps<Props>();
</script>

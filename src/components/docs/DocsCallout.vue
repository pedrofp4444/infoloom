<template>
  <div
    class="my-6 flex gap-3 rounded-lg border p-4"
    :class="{
      'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950': variant === 'info',
      'border-yellow-200 bg-yellow-50 dark:border-yellow-900 dark:bg-yellow-950': variant === 'warning',
      'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950': variant === 'danger',
      'border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950': variant === 'success',
    }"
  >
    <div class="flex-shrink-0 mt-0.5">
      <Info v-if="variant === 'info'" class="h-5 w-5 text-blue-600 dark:text-blue-400" />
      <AlertTriangle v-else-if="variant === 'warning'" class="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
      <AlertCircle v-else-if="variant === 'danger'" class="h-5 w-5 text-red-600 dark:text-red-400" />
      <CheckCircle2 v-else-if="variant === 'success'" class="h-5 w-5 text-green-600 dark:text-green-400" />
    </div>
    <div class="flex-1 text-sm">
      <div v-if="title" class="font-semibold mb-1">{{ title }}</div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { Info, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-vue-next';

interface Props {
  variant?: 'info' | 'warning' | 'danger' | 'success';
  title?: string;
}

withDefaults(defineProps<Props>(), {
  variant: 'info',
});
</script>

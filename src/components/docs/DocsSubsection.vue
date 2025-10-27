<template>
  <div :id="id" class="scroll-mt-24 mt-10">
    <h3 class="font-heading scroll-m-20 text-xl font-semibold tracking-tight">
      {{ title }}
    </h3>
    <div v-if="description" class="mt-2 text-sm text-muted-foreground leading-relaxed">
      {{ description }}
    </div>
    <div class="mt-6">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  title: string;
  description?: string;
}

defineProps<Props>();
</script>

<template>
  <section :id="id" class="scroll-mt-24 mb-16">
    <h2 class="font-heading scroll-m-20 border-b pb-3 text-2xl font-semibold tracking-tight first:mt-0">
      {{ title }}
    </h2>
    <div v-if="description" class="mt-3 text-muted-foreground leading-relaxed">
      {{ description }}
    </div>
    <div class="mt-8">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
interface Props {
  id: string;
  title: string;
  description?: string;
}

defineProps<Props>();
</script>

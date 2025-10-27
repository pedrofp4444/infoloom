<template>
  <div class="space-y-6 mt-6">
    <div
      v-for="(step, index) in steps"
      :key="index"
      class="relative pl-8 pb-6 last:pb-0"
    >
      <div
        class="absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border-2 border-primary bg-background text-xs font-semibold"
      >
        {{ index + 1 }}
      </div>
      <div v-if="index < steps.length - 1" class="absolute left-3 top-6 h-full w-px bg-border" />
      <div class="space-y-2">
        <h4 class="font-semibold">{{ step.title }}</h4>
        <div class="text-sm text-muted-foreground">
          {{ step.description }}
        </div>
        <div v-if="step.code" class="mt-3">
          <CodeBlock :code="step.code" :language="step.language" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CodeBlock from './CodeBlock.vue';

interface Step {
  title: string;
  description: string;
  code?: string;
  language?: string;
}

interface Props {
  steps: Step[];
}

defineProps<Props>();
</script>

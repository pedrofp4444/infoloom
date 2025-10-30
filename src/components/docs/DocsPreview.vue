<template>
  <div class="my-6 rounded-lg border bg-background">
    <div class="flex items-center justify-between border-b px-4 py-3">
      <div class="flex items-center gap-2">
        <div class="flex gap-1.5">
          <div class="h-3 w-3 rounded-full bg-red-500" />
          <div class="h-3 w-3 rounded-full bg-yellow-500" />
          <div class="h-3 w-3 rounded-full bg-green-500" />
        </div>
        <span v-if="title" class="ml-2 text-sm font-medium">{{ title }}</span>
      </div>
      <button
        v-if="showCode"
        @click="isCodeVisible = !isCodeVisible"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground h-8 px-3"
      >
        <Code class="h-4 w-4 mr-2" />
        {{ isCodeVisible ? 'Preview' : 'Code' }}
      </button>
    </div>
    <div class="p-6">
      <div v-if="!isCodeVisible" class="flex items-center justify-center min-h-[200px]">
        <slot />
      </div>
      <div v-else>
        <CodeBlock :code="code" :language="language" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Code } from 'lucide-vue-next';
import CodeBlock from './CodeBlock.vue';

interface Props {
  title?: string;
  code?: string;
  language?: string;
  showCode?: boolean;
}

withDefaults(defineProps<Props>(), {
  language: 'vue',
  showCode: true,
  code: '',
});

const isCodeVisible = ref(false);
</script>

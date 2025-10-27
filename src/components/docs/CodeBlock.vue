<template>
  <div class="relative group">
    <div class="absolute right-2 top-2 z-10">
      <button
        @click="copyCode"
        class="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-8 w-8 opacity-0 group-hover:opacity-100"
        :class="copied ? 'text-green-500' : ''"
      >
        <Check v-if="copied" class="h-4 w-4" />
        <Copy v-else class="h-4 w-4" />
      </button>
    </div>
    <pre
      class="overflow-x-auto rounded-lg border bg-muted p-4 font-mono text-sm"
      :class="className"
    ><code>{{ code }}</code></pre>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Copy, Check } from 'lucide-vue-next';

interface Props {
  code: string;
  language?: string;
  className?: string;
}

const props = withDefaults(defineProps<Props>(), {
  language: 'typescript',
  className: '',
});

const copied = ref(false);

const copyCode = async () => {
  await navigator.clipboard.writeText(props.code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
};
</script>

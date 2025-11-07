<template>
  <button
    @click="toggleTheme"
    class="rounded-lg cursor-pointer flex"
    aria-label="Toggle theme"
  >
    <component
      :is="isDark ? Sun : Moon"
      class="h-4 w-4 stroke-current"
    />
  </button>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Sun, Moon } from 'lucide-vue-next';

const isDark = ref(false);

onMounted(() => {
  const storedTheme = localStorage.getItem('theme');
  if (storedTheme) {
    isDark.value = storedTheme === 'dark';
    document.documentElement.classList.toggle('dark', isDark.value);
  } else {
    isDark.value = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.toggle('dark', isDark.value);
  }
});

const toggleTheme = () => {
  isDark.value = !isDark.value;
  document.documentElement.classList.toggle('dark', isDark.value);
  localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

defineExpose({ toggleTheme });
</script>
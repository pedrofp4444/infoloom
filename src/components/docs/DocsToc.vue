<template>
  <nav class="space-y-2">
    <p class="font-medium mb-4 text-sm">On This Page</p>
    <ul class="space-y-2.5 text-sm border-l">
      <li v-for="item in items" :key="item.id">
        <a
          :href="`#${item.id}`"
          @click.prevent="scrollToSection(item.id)"
          class="inline-block text-muted-foreground hover:text-foreground transition-colors border-l-2 -ml-px px-3 py-1"
          :class="{
            'font-medium text-foreground border-foreground': activeId === item.id,
            'border-transparent': activeId !== item.id,
            'pl-6': item.level === 3,
          }"
        >
          {{ item.title }}
        </a>
      </li>
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

interface TocItem {
  id: string;
  title: string;
  level: number;
}

interface Props {
  items: TocItem[];
}

defineProps<Props>();

const activeId = ref<string>('');

const scrollToSection = (id: string) => {
  const element = document.getElementById(id);
  if (element) {
    const offset = 80; // Account for fixed header
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }
};

const updateActiveId = () => {
  const headings = document.querySelectorAll('h2[id], h3[id]');
  const scrollPosition = window.scrollY + 120;

  for (let i = headings.length - 1; i >= 0; i--) {
    const heading = headings[i] as HTMLElement;
    if (heading.offsetTop <= scrollPosition) {
      activeId.value = heading.id;
      return;
    }
  }

  // If no heading is active, set the first one
  if (headings.length > 0) {
    activeId.value = (headings[0] as HTMLElement).id;
  }
};

onMounted(() => {
  window.addEventListener('scroll', updateActiveId, { passive: true });
  updateActiveId();
});

onUnmounted(() => {
  window.removeEventListener('scroll', updateActiveId);
});
</script>

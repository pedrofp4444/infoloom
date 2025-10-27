<template>
  <nav class="w-full">
    <div class="space-y-1">
      <div v-for="section in navigation" :key="section.title" class="pb-4">
        <h4 class="mb-1 rounded-md px-2 py-1 text-sm font-semibold">
          {{ section.title }}
        </h4>
        <div class="space-y-1">
          <a
            v-for="item in section.items"
            :key="item.href"
            :href="item.href"
            class="group flex w-full items-center rounded-md border border-transparent px-2 py-1 text-sm hover:bg-accent hover:text-accent-foreground"
            :class="{
              'bg-accent font-medium text-accent-foreground': isActive(item.href),
              'text-muted-foreground': !isActive(item.href),
            }"
          >
            {{ item.title }}
            <span
              v-if="item.badge"
              class="ml-auto rounded-md bg-primary px-1.5 py-0.5 text-xs text-primary-foreground"
            >
              {{ item.badge }}
            </span>
          </a>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
interface NavItem {
  title: string;
  href: string;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface Props {
  navigation: NavSection[];
  currentPath?: string;
}

const props = defineProps<Props>();

const isActive = (href: string) => {
  if (typeof window === 'undefined') return false;
  return window.location.pathname === href;
};
</script>

<script setup lang="ts">
import { ref } from 'vue'
import SidebarProvider from "./ui/sidebar/SidebarProvider.vue";
import SidebarTrigger from "./ui/sidebar/SidebarTrigger.vue";
import ThemeToggle from "./ThemeToggle.vue";

import {
  BarChart2,
  Book,
  Calendar,
  FileText,
  FolderClosed,
  GitPullRequestCreateArrow,
  MessageCircle,
  Star,
  Users
} from "lucide-vue-next"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  {
    title: "Unidades Curriculares",
    url: "/ucs",
    icon: Book,
  },
  {
    title: "Calendário",
    url: "/calendar",
    icon: Calendar,
  },
  {
    title: "Chatbot",
    url: "/chat",
    icon: MessageCircle,
  },
  {
    title: "Formulários",
    url: "/formulario",
    icon: FileText,
  },
  {
    title: "Relatórios",
    url: "/reports",
    icon: BarChart2,
  },
  {
    title: "Favoritas",
    url: "/favorites",
    icon: Star,
  },
  {
    title: "Documentação",
    url: "/docs",
    icon: FolderClosed,
  },
  {
    title: "Contribuidores",
    url: "/contributors",
    icon: GitPullRequestCreateArrow,
  },
  {
    title: "Contactos",
    url: "/contacts",
    icon: Users,
  }
];

const themeToggleRef = ref<InstanceType<typeof ThemeToggle> | null>(null)

const toggleTheme = () => {
  themeToggleRef.value?.toggleTheme()
}
</script>

<template>
  <SidebarProvider :defaultOpen="false">
    <SidebarTrigger />
    <Sidebar side="right">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Infoloom</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in items" :key="item.title">
                <SidebarMenuButton asChild>
                  <a :href="item.url">
                    <component :is="item.icon" />
                    <span>{{item.title}}</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton as-child @click="toggleTheme">
                  <div class="cursor-pointer">
                    <ThemeToggle ref="themeToggleRef" />
                    <span>Mudar Tema</span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </SidebarProvider>
</template>
<script setup lang="ts">
import SidebarProvider from "./ui/sidebar/SidebarProvider.vue";
import SidebarTrigger from "./ui/sidebar/SidebarTrigger.vue";

import {
  Book,
  Calendar,
  FileText,
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
    title: "Formulários",
    url: "/formulario",
    icon: FileText,
  },
  {
    title: "Favoritas",
    url: "/favorites",
    icon: Star,
  },
  {
    title: "Contactos",
    url: "/contacts",
    icon: Users,
  }
];
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
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  </SidebarProvider>
</template>

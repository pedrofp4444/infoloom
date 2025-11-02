<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Github, Users, GitCommit, ExternalLink } from "lucide-vue-next";

interface Contributor {
  login: string;
  id: number;
  avatar_url: string;
  html_url: string;
  contributions: number;
  type: string;
}

const contributors = ref<Contributor[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);

onMounted(async () => {
  try {
    const res = await fetch(
      "https://api.github.com/repos/pedrofp4444/infoloom/contributors"
    );
    if (!res.ok) throw new Error("Falha ao carregar contribuidores");

    contributors.value = await res.json();
  } catch (err) {
    error.value = err instanceof Error ? err.message : "Erro desconhecido";
  } finally {
    loading.value = false;
  }
});

const totalContributions = computed(() =>
  contributors.value.reduce((sum, c) => sum + c.contributions, 0)
);
</script>

<template>
  <div class="min-h-screen bg-gradient-to-b from-background to-muted/20">

    <div v-if="loading" class="flex items-center justify-center min-h-[50vh]">
      <div class="text-center space-y-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
        <p class="text-muted-foreground">A carregar contribuidores...</p>
      </div>
    </div>

    <div v-else-if="error" class="flex items-center justify-center min-h-[50vh]">
      <Card class="max-w-md">
        <CardContent class="pt-6">
          <p class="text-destructive text-center">{{ error }}</p>
        </CardContent>
      </Card>
    </div>

    <div v-else class="container mx-auto px-4 max-w-7xl">

    <div class="flex flex-wrap justify-center gap-6 text-center mb-10">
        <div class="flex items-center gap-2">
          <Users class="w-5 h-5 text-muted-foreground" />
          <span class="text-2xl font-bold">{{ contributors.length }}</span>
          <span class="text-muted-foreground">
            {{ contributors.length === 1 ? "Contribuidor" : "Contribuidores" }}
          </span>
        </div>
        <div class="flex items-center gap-2">
          <GitCommit class="w-5 h-5 text-muted-foreground" />
          <span class="text-2xl font-bold">{{ totalContributions }}</span>
          <span class="text-muted-foreground">
            {{ totalContributions === 1 ? "Contribuição" : "Contribuições" }}
          </span>
        </div>
      </div>

      <div class="text-center mb-12">
        <Button variant="outline" class="bg-transparent dark:bg-transparent" as="a"
          href="https://github.com/pedrofp4444/infoloom"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github class="w-4 h-4 mr-2" />
          Ver no GitHub
          <ExternalLink class="w-3 h-3 ml-2" />
        </Button>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <Card
          v-for="(c, index) in contributors"
          :key="c.id"
          class="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden opacity-0 animate-fadeInUp"
          :style="{ animationDelay: `${index * 50}ms` }"
        >
          <CardContent class="p-6">
            <div class="flex flex-col items-center text-center space-y-4">
              <div class="relative">
                <Avatar class="w-24 h-24 border-4 border-background shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <AvatarImage :src="c.avatar_url" :alt="c.login" />
                  <AvatarFallback>{{ c.login.slice(0, 2).toUpperCase() }}</AvatarFallback>
                </Avatar>
              </div>

              <div class="space-y-1 w-full">
                <h3 class="font-semibold text-lg truncate">{{ c.login }}</h3>
                <Badge v-if="c.type" variant="secondary" class="text-xs">{{ c.type }}</Badge>
              </div>

              <div class="flex items-center gap-2 text-muted-foreground">
                <GitCommit class="w-4 h-4" />
                <span class="text-sm">
                  <span class="font-semibold text-foreground">{{ c.contributions }}</span>
                  {{ c.contributions === 1 ? " contribuição" : " contribuições" }}
                </span>
              </div>

              <Button
                variant="outline"
                size="sm"
                as="a"
                class="w-full bg-transparent group-hover:bg-primary group-hover:text-primary-foreground  transition-colors dark:bg-transparent dark:group-hover:bg-primary dark:group-hover:text-primary-foreground dark:hover:text-foreground"
                :href="c.html_url"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github class="w-4 h-4 mr-2" />
                Ver Perfil
                <ExternalLink class="w-3 h-3 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div class="mt-16 text-center space-y-4">
        <div class="inline-block p-8 rounded-lg bg-muted/50 backdrop-blur">
          <h2 class="text-2xl font-bold mb-2">Queres contribuir?</h2>
          <p class="text-muted-foreground mb-4">
            Ajuda-nos a melhorar o Infoloom! Seja através de código, documentação ou sugestões, todas as contribuições são bem-vindas.
          </p>
          <Button as="a" size="lg"
            href="https://github.com/pedrofp4444/infoloom?tab=contributing-ov-file"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github class="w-5 h-5 mr-2" />
            Contribuir no GitHub
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fadeInUp {
  animation: fadeInUp 0.5s ease-out forwards;
}
</style>

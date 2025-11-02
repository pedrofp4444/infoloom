<script setup lang="ts">
import {
  Calendar,
  Users,
  BookOpen,
  ExternalLink,
  FileText,
  Eye,
  Star,
} from "lucide-vue-next";
import type { UC } from "../types/uc";
import { getPerfilColor } from "@/lib/utils";
import { ensureActivePinia } from "@/lib/pinia";
import { useFavoritesStore } from "@/stores/useFavoritesStore";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { computed } from "vue";

ensureActivePinia();
const props = defineProps<{ uc: UC }>();

const favoritesStore = useFavoritesStore();
const isFavorite = computed(() => favoritesStore.isFavorite(props.uc.slug));
const toggleFavorite = () => favoritesStore.toggleFavorite(props.uc.slug);
</script>

<template>
  <Card class="h-full flex flex-col hover:shadow-lg transition-shadow duration-200">
    <CardHeader class="min-h-[160px] flex flex-col justify-between">
      <div class="flex items-start justify-between gap-2">
        <a :href="`/uc/${uc.slug}`" class="flex-1">
          <CardTitle
            class="text-lg font-bold text-balance hover:text-primary transition-colors cursor-pointer line-clamp-2 h-[3.5rem]">
            {{ uc.nome }}
          </CardTitle>
        </a>
        <Badge :class="getPerfilColor(uc.perfil)" variant="secondary"
          class="whitespace-normal break-words max-w-[150px] text-center">
          {{ uc.perfil }}
        </Badge>
      </div>

      <div class="mt-3 w-full flex flex-col space-y-2">
        <a :href="`/uc/${uc.slug}`" class="w-full">
          <Button variant="outline" size="sm" class="w-full min-h-[36px] bg-transparent dark:bg-transparent justify-center">
            <Eye class="h-3 w-3 mr-1" />
            Ver página
          </Button>
        </a>

        <Button variant="outline" size="sm" class="w-full min-h-[36px] bg-transparent dark:bg-transparent justify-center"
          @click="toggleFavorite">
          <Star :class="[
            'h-4 w-4 mr-1 transition-colors',
            isFavorite ? 'text-yellow-400 fill-yellow-400' : 'text-gray-400'
          ]" />
          {{ isFavorite ? 'Remover favorito' : 'Marcar favorito' }}
        </Button>
      </div>
    </CardHeader>

    <CardContent class="flex-1 flex flex-col">
      <Accordion type="single" collapsible class="w-full">
        <AccordionItem value="avaliacoes">
          <AccordionTrigger class="text-left">
            <div class="flex items-center gap-2">
              <Calendar class="h-4 w-4" />
              Avaliações ({{ uc.avaliacoes.length }})
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div class="space-y-3">
              <div v-if="!uc.avaliacoes || uc.avaliacoes.length === 0"
                class="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                Ainda sem informação.
              </div>
              <div v-else v-for="(avaliacao, index) in uc.avaliacoes" :key="index"
                class="flex justify-between items-center p-3 bg-muted rounded-lg">
                <span class="font-medium">{{ avaliacao.descricao }}</span>
                <span class="text-sm text-muted-foreground">
                  {{ new Date(avaliacao.data).toLocaleDateString("pt-PT") }}
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="criterios">
          <AccordionTrigger class="text-left">
            <div class="flex items-center gap-2">
              <FileText class="h-4 w-4" />
              Critérios de Avaliação
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p class="text-sm text-pretty bg-muted p-3 rounded-lg">
              {{ uc.criterios ? uc.criterios : 'Ainda sem informação.' }}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="notas">
          <AccordionTrigger class="text-left">
            <div class="flex items-center gap-2">
              <BookOpen class="h-4 w-4" />
              Notas
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <p class="text-sm text-pretty bg-muted p-3 rounded-lg">
              {{ uc.notas ? uc.notas : 'Ainda sem informação.' }}
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="recursos">
          <AccordionTrigger class="text-left">
            <div class="flex items-center gap-2">
              <ExternalLink class="h-4 w-4" />
              Recursos ({{ uc.recursos.length }})
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div class="space-y-2">
              <div v-if="!uc.recursos || uc.recursos.length === 0"
                class="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                Ainda sem informação.
              </div>
              <a v-else v-for="(recurso, index) in uc.recursos" :key="index" :href="recurso" target="_blank"
                rel="noopener noreferrer"
                class="flex items-center gap-2 text-sm text-primary hover:underline p-2 bg-muted rounded-lg">
                <ExternalLink class="h-3 w-3" />
                {{ recurso }}
              </a>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="docentes">
          <AccordionTrigger class="text-left">
            <div class="flex items-center gap-2">
              <Users class="h-4 w-4" />
              Docentes ({{ uc.docentes.length }})
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <div class="space-y-2">
              <div v-if="!uc.docentes || uc.docentes.length === 0"
                class="p-3 bg-muted rounded-lg text-sm text-muted-foreground">
                Ainda sem informação.
              </div>
              <div v-else v-for="(docente, index) in uc.docentes" :key="index" class="text-sm p-2 bg-muted rounded-lg">
                {{ docente }}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </CardContent>
  </Card>
</template>

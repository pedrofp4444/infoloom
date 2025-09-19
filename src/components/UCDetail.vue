<script setup lang="ts">
import type { UC } from "../types/uc";
import { getPerfilColor } from "@/lib/utils";

defineProps<{ uc: UC }>();
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-background to-muted/20 py-8">
    <div class="container mx-auto px-4 max-w-4xl space-y-8">
      <div>
        <a href="/" class="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline mb-4">
          ← Voltar às UCs
        </a>
        <div class="flex items-start justify-between gap-4">
          <div>
            <h1 class="text-3xl font-bold mb-1">{{ uc.nome }}</h1>
            <p class="text-muted-foreground text-lg">Mestrado em Engenharia Informática</p>
          </div>
          <span
            class="px-3 py-1 rounded-full text-sm font-medium text-center flex items-center justify-center text-balance"
            :class="getPerfilColor(uc.perfil)"
          >
            {{ uc.perfil }}
          </span>
        </div>
      </div>

      <div class="space-y-4">
        <h2 class="text-xl font-semibold mb-2">Avaliações</h2>
        <div v-if="uc.avaliacoes?.length" class="grid gap-4">
          <div v-for="(avaliacao, i) in uc.avaliacoes" :key="i" class="flex justify-between items-center p-4 bg-muted rounded-lg">
            <div>
              <h4 class="font-medium">{{ avaliacao.descricao }}</h4>
            </div>
            <div class="text-right text-sm text-muted-foreground">
              {{ new Date(avaliacao.data).toLocaleDateString('pt-PT', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) }}
            </div>
          </div>
        </div>
        <p v-else class="text-sm text-muted-foreground">Ainda sem informação.</p>
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-semibold mb-1">Critérios de Avaliação</h2>
        <p class="text-muted-foreground leading-relaxed">
          {{ uc.criterios ? uc.criterios : 'Ainda sem informação.' }}
        </p>
      </div>

      <div class="space-y-2">
        <h2 class="text-xl font-semibold mb-1">Notas Importantes</h2>
        <p class="text-muted-foreground leading-relaxed">
          {{ uc.notas ? uc.notas : 'Ainda sem informação.' }}
        </p>
      </div>

      <div class="grid md:grid-cols-2 gap-6">
        <div>
          <h2 class="text-lg font-semibold mb-2">Recursos</h2>
          <div v-if="uc.recursos?.length" class="space-y-2">
            <a v-for="(recurso, i) in uc.recursos" :key="i"
               :href="recurso"
               target="_blank"
               rel="noopener noreferrer"
               class="block p-3 bg-muted rounded-lg hover:bg-muted/80 transition-colors truncate text-primary text-sm">
              {{ recurso }}
            </a>
          </div>
          <p v-else class="text-sm text-muted-foreground">Ainda sem informação.</p>
        </div>

        <div>
          <h2 class="text-lg font-semibold mb-2">Docentes</h2>
          <div v-if="uc.docentes?.length" class="space-y-2">
            <div v-for="(docente, i) in uc.docentes" :key="i" class="p-3 bg-muted rounded-lg text-sm">
              {{ docente }}
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground">Ainda sem informação.</p>
        </div>
      </div>
    </div>
  </div>
</template>

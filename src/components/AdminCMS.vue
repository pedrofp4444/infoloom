<script setup>
import { ref } from 'vue';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Trash2, Plus, Users, Link, Calendar, FileText, Tag, Info } from 'lucide-vue-next';

const props = defineProps(['initialData']);

// Estado
const isAuthenticated = ref(false);
const adminPin = ref("");
const ucs = ref(JSON.parse(JSON.stringify(props.initialData)));
const isSaving = ref(false);

const EXPECTED_PIN = import.meta.env.ADMIN_PIN;

const checkPin = () => {
  if (adminPin.value === EXPECTED_PIN) {
    isAuthenticated.value = true;
  } else {
    alert("PIN incorreto.");
  }
};

// Funções de Edição
const addDocente = (idx) => ucs.value[idx].docentes.push("");
const removeDocente = (idx, dIdx) => ucs.value[idx].docentes.splice(dIdx, 1);

const addRecurso = (idx) => ucs.value[idx].recursos.push({ nome: "", url: "" });
const removeRecurso = (idx, rIdx) => ucs.value[idx].recursos.splice(rIdx, 1);

const addAvaliacao = (idx) => ucs.value[idx].avaliacoes.push({ data: "", descricao: "" });
const removeAvaliacao = (idx, aIdx) => ucs.value[idx].avaliacoes.splice(aIdx, 1);

const save = async () => {
  isSaving.value = true;
  try {
    const res = await fetch('/api/admin/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: adminPin.value, content: ucs.value })
    });
    const data = await res.json();
    alert(data.message);
    if (res.ok) window.location.reload();
  } catch (e) {
    alert('Erro de rede.');
  } finally {
    isSaving.value = false;
  }
};
</script>

<template>
  <div class="max-w-5xl mx-auto p-4">
    <div v-if="!isAuthenticated" class="flex items-center justify-center min-h-[60vh]">
      <Card class="w-full max-w-sm border-2">
        <CardHeader><CardTitle class="text-center">Admin Access</CardTitle></CardHeader>
        <CardContent class="space-y-4">
          <Input
            v-model="adminPin"
            type="password"
            placeholder="Introduza o PIN"
            class="text-center text-lg"
            @keyup.enter="checkPin"
            />
          <Button @click="checkPin" class="w-full">Entrar</Button>
        </CardContent>
      </Card>
    </div>

    <div v-else class="space-y-6">
      <div class="flex justify-between items-center sticky top-0 z-50 bg-background/95 backdrop-blur py-4 border-b">
        <h1 class="text-xl font-bold italic">INFOLOOM CMS</h1>
        <Button @click="save" :disabled="isSaving">
          {{ isSaving ? 'A guardar...' : 'Publicar Alterações' }}
        </Button>
      </div>

      <Accordion type="single" collapsible class="space-y-4">
        <AccordionItem v-for="(uc, idx) in ucs" :key="uc.slug" :value="uc.slug" class="border rounded-xl bg-card px-4">
          <AccordionTrigger class="hover:no-underline">
            <div class="flex gap-4 items-center">
              <span class="text-[10px] font-mono bg-primary/10 text-primary px-2 py-1 rounded">{{ uc.sigla }}</span>
              <span class="font-bold">{{ uc.nome }}</span>
            </div>
          </AccordionTrigger>

          <AccordionContent class="space-y-6 pt-4 pb-4 border-t">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
              <div class="space-y-2 md:col-span-2">
                <Label class="flex items-center gap-2 font-bold"><Info class="w-4 h-4" /> Nome da UC</Label>
                <Input v-model="uc.nome" placeholder="Ex: Engenharia de Software" />
              </div>
              <div class="space-y-2">
                <Label class="flex items-center gap-2 font-bold"><Tag class="w-4 h-4" /> Sigla</Label>
                <Input v-model="uc.sigla" placeholder="Ex: ES" />
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <Label class="flex items-center gap-2 font-bold"><Users class="w-4 h-4" /> Docentes</Label>
                <Button size="sm" variant="outline" @click="addDocente(idx)">+ Adicionar</Button>
              </div>
              <div v-for="(_, dIdx) in uc.docentes" :key="dIdx" class="flex gap-2">
                <Input v-model="uc.docentes[dIdx]" placeholder="Nome (email)" />
                <Button size="icon" variant="ghost" @click="removeDocente(idx, dIdx)"><Trash2 class="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="flex items-center gap-2 font-bold"><FileText class="w-4 h-4" /> Critérios de Avaliação</Label>
              <Textarea v-model="uc.criterios" placeholder="Ex: 50% Exame + 50% Projeto..." rows="3" />
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <Label class="flex items-center gap-2 font-bold"><Calendar class="w-4 h-4" /> Datas de Avaliação</Label>
                <Button size="sm" variant="outline" @click="addAvaliacao(idx)">+ Adicionar</Button>
              </div>
              <div v-for="(av, aIdx) in uc.avaliacoes" :key="aIdx" class="grid grid-cols-[auto_1fr_auto] gap-2">
                <Input v-model="av.data" type="date" class="w-40" />
                <Input v-model="av.descricao" placeholder="Descrição (Ex: Teste 1)" />
                <Button size="icon" variant="ghost" @click="removeAvaliacao(idx, aIdx)"><Trash2 class="w-4 h-4 text-destructive" /></Button>
              </div>
            </div>

            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <Label class="flex items-center gap-2 font-bold"><Link class="w-4 h-4" /> Recursos</Label>
                <Button size="sm" variant="outline" @click="addRecurso(idx)">+ Adicionar</Button>
              </div>
              <div v-for="(rec, rIdx) in uc.recursos" :key="rIdx" class="grid grid-cols-2 gap-2 border p-2 rounded">
                <Input v-model="rec.nome" placeholder="Nome do recurso" />
                <div class="flex gap-2">
                  <Input v-model="rec.url" placeholder="URL" />
                  <Button size="icon" variant="ghost" @click="removeRecurso(idx, rIdx)"><Trash2 class="w-4 h-4 text-destructive" /></Button>
                </div>
              </div>
            </div>

            <div class="space-y-2">
              <Label class="font-bold">Notas Adicionais</Label>
              <Textarea v-model="uc.notas" placeholder="Observações internas ou extras..." />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  </div>
</template>
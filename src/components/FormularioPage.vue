<script setup lang="ts">
import { ref, onMounted } from "vue";
import type { FormSchema, FormResponse } from "../types/form-types";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, Check } from "lucide-vue-next";
import FormQuestion from "./FormQuestion.vue";

const props = defineProps<{ slug: string }>();

const formSchema = ref<FormSchema | null>(null);
const currentSection = ref(0);
const answers = ref<Record<string, string | string[] | number>>({});
const errors = ref<Record<string, string>>({});
const isSubmitted = ref(false);
const isLoading = ref(true);

onMounted(async () => {
  try {
    const res = await fetch(`/forms/${props.slug}.json`);
    if (!res.ok) throw new Error("Formulário não encontrado");
    formSchema.value = await res.json();
  } catch (err) {
    console.error("Erro ao carregar formulário:", err);
  } finally {
    isLoading.value = false;
  }
});

function validateSection() {
  if (!formSchema.value) return false;
  const section = formSchema.value.sections[currentSection.value];
  const newErrors: Record<string, string> = {};

  section.questions.forEach((question) => {
    if (question.required) {
      const answer = answers.value[question.id];
      if (!answer || (Array.isArray(answer) && answer.length === 0)) {
        newErrors[question.id] = "Esta pergunta é obrigatória";
      }
    }
  });

  errors.value = newErrors;
  return Object.keys(newErrors).length === 0;
}

function handleNext() {
  if (validateSection() && formSchema.value && currentSection.value < formSchema.value.sections.length - 1) {
    currentSection.value++;
    errors.value = {};
  }
}

function handlePrevious() {
  if (currentSection.value > 0) currentSection.value--;
}

async function handleSubmit() {
  if (!validateSection() || !formSchema.value) return;

  const response: FormResponse = {
    formId: formSchema.value.id,
    submittedAt: new Date().toISOString(),
    sections: formSchema.value.sections.map((section) => ({
      sectionId: section.id,
      answers: section.questions
        .filter((q) => answers.value[q.id] !== undefined)
        .map((q) => ({
          questionId: q.id,
          value: answers.value[q.id],
        })),
    })),
  };

  saveToLocalStorage(response);
  await saveToDatabase(response);
  isSubmitted.value = true;
}

function saveToLocalStorage(response: FormResponse) {
  const responses = JSON.parse(localStorage.getItem("form-responses") || "[]");
  responses.push(response);
  localStorage.setItem("form-responses", JSON.stringify(responses));
  console.log("[vue] Response stored:", response);
}

async function saveToDatabase(response: FormResponse) {
  console.log("[vue] saveToDatabase chamada (não implementada):", response);
}
</script>

<template>
  <div v-if="isLoading" class="min-h-screen flex items-center justify-center">
    <div class="text-center space-y-4">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
      <p class="text-muted-foreground">A carregar formulário...</p>
    </div>
  </div>

  <div v-else-if="!formSchema" class="min-h-screen flex items-center justify-center p-4">
    <Card class="max-w-md w-full">
      <CardHeader>
        <CardTitle>Formulário não encontrado</CardTitle>
        <CardDescription>O formulário que procura não existe.</CardDescription>
      </CardHeader>
    </Card>
  </div>

  <div v-else-if="isSubmitted" class="min-h-screen flex items-center justify-center p-4">
    <Card class="max-w-md w-full text-center">
      <CardHeader>
        <div class="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <Check class="w-6 h-6 text-green-600" />
        </div>
        <CardTitle>Resposta enviada com sucesso!</CardTitle>
        <CardDescription>Obrigado por responder. As suas respostas foram guardadas.</CardDescription>
      </CardHeader>
    </Card>
  </div>

  <div v-else class="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle class="text-2xl">{{ formSchema.title }}</CardTitle>
        <CardDescription v-if="formSchema.description" class="text-base">{{ formSchema.description }}</CardDescription>
      </CardHeader>
    </Card>

    <div class="space-y-2">
      <div class="flex justify-between text-sm text-muted-foreground">
        <span>Secção {{ currentSection + 1 }} de {{ formSchema.sections.length }}</span>
        <span>{{ Math.round(((currentSection + 1) / formSchema.sections.length) * 100) }}%</span>
      </div>
      <Progress :model-value="((currentSection + 1) / formSchema.sections.length) * 100" class="h-2" />
    </div>

    <Card>
      <CardHeader>
        <CardTitle>{{ formSchema.sections[currentSection].title }}</CardTitle>
        <CardDescription v-if="formSchema.sections[currentSection].description">
          {{ formSchema.sections[currentSection].description }}
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <FormQuestion
          v-for="question in formSchema.sections[currentSection].questions"
          :key="question.id"
          :question="question"
          :value="answers[question.id]"
          :error="errors[question.id]"
          @update:value="(v) => (answers[question.id] = v === null ? '' : v)"
        />
      </CardContent>
    </Card>

    <div class="flex justify-between gap-4">
      <Button variant="outline" @click="handlePrevious" :disabled="currentSection === 0" class="flex-1 sm:flex-none bg-transparent">
        <ChevronLeft class="w-4 h-4 mr-2" /> Anterior
      </Button>
      <Button
        v-if="currentSection < formSchema.sections.length - 1"
        @click="handleNext"
        class="flex-1 sm:flex-none"
      >
        Próxima <ChevronRight class="w-4 h-4 ml-2" />
      </Button>
      <Button
        v-else
        @click="handleSubmit"
        class="flex-1 sm:flex-none"
      >
        Enviar <Check class="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
</template>

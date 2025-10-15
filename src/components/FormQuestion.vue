<script setup lang="ts">
import { computed } from "vue";
import type { FormQuestion as FormQuestionType, FormOption } from "../types/form-types";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const props = defineProps<{
  question: FormQuestionType;
  value?: string | string[] | number;
  error?: string;
}>();
const emit = defineEmits<{
  (e: "update:value", payload: string | string[] | number | null): void;
}>();

const valueString = computed(() => String(props.value ?? ""));

function onUpdateValue(val: unknown) {
  if (val === null || val === undefined) {
    emit("update:value", null);
    return;
  }

  if (Array.isArray(val)) {
    emit("update:value", val as string[]);
    return;
  }

  if (typeof val === "number") {
    emit("update:value", val);
    return;
  }

  // fallback to string
  emit("update:value", String(val));
}

function onUpdateValueAsNumber(val: unknown) {
  const n = Number(val as any);
  onUpdateValue(n);
}

function optionKey(opt: FormOption) {
  return opt.id ?? `${opt.value}-${opt.label}`;
}
</script>

<template>
  <div class="space-y-3">
    <Label class="text-base">
      {{ question.question }}
      <span v-if="question.required" class="text-red-500 ml-1">*</span>
    </Label>

    <!-- text -->
    <Input
      v-if="question.type === 'text'"
      type="text"
      :model-value="valueString"
      @update:modelValue="onUpdateValue"
      placeholder="Digita a tua resposta"
      :class="{ 'border-red-500': error }"
    />

    <!-- textarea -->
    <Textarea
      v-else-if="question.type === 'textarea'"
      rows="4"
      :model-value="valueString"
      @update:modelValue="onUpdateValue"
      placeholder="Digita a tua resposta"
      :class="{ 'border-red-500': error }"
    />

    <!-- multiple choice -->
    <RadioGroup
      v-else-if="question.type === 'multiple-choice'"
  :model-value="String(valueString)"
  @update:modelValue="onUpdateValue"
      class="space-y-3"
    >
        <template v-for="opt in question.options" :key="optionKey(opt)">
          <div class="flex items-center space-x-2">
            <RadioGroupItem :id="opt.id" :value="opt.value" />
            <Label :for="opt.id" class="font-normal cursor-pointer">{{ opt.label }}</Label>
          </div>
        </template>
    </RadioGroup>

    <!-- dropdown -->
    <Select
      v-else-if="question.type === 'dropdown'"
  :model-value="valueString"
  @update:modelValue="onUpdateValue"
    >
      <SelectTrigger :class="{ 'border-red-500': error }">
        <SelectValue placeholder="Selecione uma opção" />
      </SelectTrigger>
      <SelectContent>
          <template v-for="opt in question.options" :key="optionKey(opt)">
            <SelectItem :value="opt.value">{{ opt.label }}</SelectItem>
          </template>
      </SelectContent>
    </Select>

    <!-- scale -->
    <div v-else-if="question.type === 'scale'" class="space-y-4">
      <RadioGroup
  :model-value="String(valueString)"
  @update:modelValue="onUpdateValueAsNumber"
        class="flex justify-between flex-wrap gap-3"
      >
          <template v-for="num in ( (question.scaleMax || 5) - (question.scaleMin || 1) + 1 )" :key="num">
            <div class="flex items-center space-x-2">
              <RadioGroupItem :id="`scale-${question.id}-${num + (question.scaleMin || 1) - 1}`" :value="String((question.scaleMin || 1) + (num - 1))" />
              <Label :for="`scale-${question.id}-${num + (question.scaleMin || 1) - 1}`" class="font-normal cursor-pointer">{{ (question.scaleMin || 1) + (num - 1) }}</Label>
            </div>
          </template>
      </RadioGroup>
      <div class="flex justify-between text-sm text-muted-foreground">
        <span>{{ question.scaleMinLabel }}</span>
        <span>{{ question.scaleMaxLabel }}</span>
      </div>
    </div>

    <!-- date -->
    <Input
      v-else-if="question.type === 'date'"
      type="date"
      :model-value="valueString"
      @update:modelValue="onUpdateValue"
      :class="{ 'border-red-500': error }"
    />

    <p v-if="error" class="text-sm text-red-500">{{ error }}</p>
  </div>
</template>

export type QuestionType = "text" | "textarea" | "multiple-choice" | "dropdown" | "scale" | "date"

export interface FormOption {
  id: string
  label: string
  value: string
}

export interface FormQuestion {
  id: string
  type: QuestionType
  question: string
  required: boolean
  options?: FormOption[] // Para multiple-choice, dropdown
  scaleMin?: number // Para scale
  scaleMax?: number // Para scale
  scaleMinLabel?: string // Para scale
  scaleMaxLabel?: string // Para scale
}

export interface FormSection {
  id: string
  title: string
  description?: string
  questions: FormQuestion[]
}

export interface FormSchema {
  id: string
  title: string
  description?: string
  sections: FormSection[]
}

export interface FormAnswer {
  questionId: string
  value: string | string[] | number
}

export interface FormResponse {
  formId: string
  submittedAt: string
  sections: {
    sectionId: string
    answers: FormAnswer[]
  }[]
}

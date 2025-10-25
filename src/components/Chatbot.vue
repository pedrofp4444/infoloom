<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

declare global {
  interface Window {
    apifree?: {
      chat: (prompt: string) => Promise<string>
    }
  }
}

// --- Estados ---
const messages = ref<{ role: string; content: string; timestamp: Date }[]>([
  {
    role: "assistant",
    content: "👋 Olá! Sobre que unidade curricular queres falar? Podes indicar o nome ou a sigla (ex: ASCN, CPar...).",
    timestamp: new Date()
  },
])
const userInput = ref("")
const loading = ref(false)
const fase = ref<"selecionar" | "chat">("selecionar")
const ucSelecionada = ref<any | null>(null)
const messagesContainer = ref<HTMLElement | null>(null)
const isTyping = ref(false)
let conversationHistory: string[] = []
let ucsData: any[] = []

// --- Computed ---
const hasMessages = computed(() => messages.value.length > 1)

// --- Carregar JSON de UCs ---
onMounted(async () => {
  const res = await fetch("/data/ucs.json")
  ucsData = await res.json()
})

// --- Auto-scroll ---
async function scrollToBottom() {
  await nextTick()
  if (messagesContainer.value) {
    messagesContainer.value.scrollTo({
      top: messagesContainer.value.scrollHeight,
      behavior: "smooth"
    })
  }
}

// --- Normalização de texto ---
function normalize(str: string) {
  return str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
}

// --- Pesquisa local de UC ---
function encontrarUC(input: string) {
  const query = normalize(input)
  const resultados = ucsData.filter(
    (uc) =>
      normalize(uc.sigla).includes(query) || normalize(uc.nome).includes(query)
  )
  if (resultados.length === 1) return resultados[0]
  if (resultados.length > 1) return resultados.slice(0, 3)
  const parecidas = ucsData
    .filter(
      (uc) =>
        query.length > 2 &&
        (normalize(uc.sigla).startsWith(query) ||
          normalize(uc.nome).includes(query.slice(0, 3)))
    )
    .slice(0, 3)
  return parecidas.length ? parecidas : null
}

// --- Consolidação de avaliações ---
function consolidarAvaliacoes(avaliacoes: {data: string; descricao: string}[]) {
  if (!avaliacoes?.length) return []

  const ordenadas = [...avaliacoes].sort((a, b) => a.data.localeCompare(b.data))
  const consolidadas: {descricao: string; periodo: string}[] = []

  let atual = ordenadas[0]
  let inicio = atual.data
  let fim = atual.data

  for (let i = 1; i < ordenadas.length; i++) {
    const aval = ordenadas[i]
    if (aval.descricao === atual.descricao) {
      fim = aval.data
    } else {
      consolidadas.push({
        descricao: atual.descricao,
        periodo: inicio === fim ? inicio : `${inicio} até ${fim}`,
      })
      atual = aval
      inicio = aval.data
      fim = aval.data
    }
  }
  consolidadas.push({
    descricao: atual.descricao,
    periodo: inicio === fim ? inicio : `${inicio} até ${fim}`,
  })

  return consolidadas
}

async function sendMessage() {
  if (!userInput.value.trim() || loading.value) return

  const userMsg = userInput.value.trim()
  messages.value.push({
    role: "user",
    content: userMsg,
    timestamp: new Date()
  })
  userInput.value = ""
  scrollToBottom()

  // --- Comando para mudar UC ---
  if (/mudar de uc|nova uc/i.test(userMsg)) {
    isTyping.value = true
    await new Promise(r => setTimeout(r, 800))
    fase.value = "selecionar"
    ucSelecionada.value = null
    conversationHistory = []
    messages.value.push({
      role: "assistant",
      content: "🔄 Vamos selecionar uma nova UC. Indica o nome ou sigla.",
      timestamp: new Date()
    })
    isTyping.value = false
    scrollToBottom()
    return
  }

  // --- Fase 1: seleção UC ---
  if (fase.value === "selecionar") {
    isTyping.value = true
    await new Promise(r => setTimeout(r, 600))

    const resultado = encontrarUC(userMsg)

    if (!resultado) {
      messages.value.push({
        role: "assistant",
        content: "❌ Não encontrei nenhuma UC com esse nome ou sigla. Tenta novamente com o nome completo ou sigla.",
        timestamp: new Date()
      })
      isTyping.value = false
      scrollToBottom()
      return
    }

    if (Array.isArray(resultado)) {
      const lista = resultado.map((r) => `• ${r.sigla} — ${r.nome}`).join("\n")
      messages.value.push({
        role: "assistant",
        content: `Encontrei várias possíveis correspondências:\n\n${lista}\n\nQual delas pretendes?`,
        timestamp: new Date()
      })
      isTyping.value = false
      scrollToBottom()
      return
    }

    // UC única identificada
    ucSelecionada.value = resultado
    fase.value = "chat"
    messages.value.push({
      role: "assistant",
      content: `✅ Perfeito! Vamos falar sobre ${resultado.nome} (${resultado.sigla}). Podes perguntar sobre avaliações, critérios ou docentes.`,
      timestamp: new Date()
    })
    isTyping.value = false
    scrollToBottom()
    return
  }

  // --- Fase 2: chat com LLM ---
  if (fase.value === "chat" && ucSelecionada.value) {
    loading.value = true
    isTyping.value = true

    const ucLeve = {
      perfil: ucSelecionada.value.perfil,
      criterios: ucSelecionada.value.criterios,
      docentes: ucSelecionada.value.docentes,
      avaliacoes: consolidarAvaliacoes(ucSelecionada.value.avaliacoes),
    }

    const contextoUC = JSON.stringify(ucLeve, null, 2)

    const systemPrompt = `És um assistente que responde APENAS com base neste JSON de uma unidade curricular:
${contextoUC}

Se te fizerem perguntas fora deste contexto, responde:
"Desculpa, só posso responder sobre esta unidade curricular."

Observações:
- As avaliações foram consolidadas em períodos quando existem entradas repetidas.
- Mantém respostas concisas, claras e direcionadas para estudantes.
- Não inventes informações que não estejam no JSON.
`

    const contextPrompt = `${systemPrompt}

Histórico da conversa:
${conversationHistory.slice(-10).join("\n")}

Mensagem atual: ${userMsg}`

    try {
      while (typeof window.apifree === "undefined") {
        await new Promise((r) => setTimeout(r, 200))
      }

      const reply = await window.apifree.chat(contextPrompt)
      messages.value.push({
        role: "assistant",
        content: reply,
        timestamp: new Date()
      })
      conversationHistory.push(`User: ${userMsg}`)
      conversationHistory.push(`Assistant: ${reply}`)
    } catch (err) {
      console.error("Erro no chatbot:", err)
      messages.value.push({
        role: "assistant",
        content: "⚠️ O servidor está sobrecarregado. Tenta novamente dentro de alguns segundos.",
        timestamp: new Date()
      })
    } finally {
      loading.value = false
      isTyping.value = false
      scrollToBottom()
    }
  }
}

function formatTime(date: Date) {
  return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="flex flex-col h-screen max-h-screen bg-background">
    <!-- Header -->
    <div class="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div class="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span class="text-xl">🎓</span>
          </div>
          <div>
            <h1 class="font-semibold text-lg leading-tight">Assistente de UCs</h1>
            <p class="text-xs text-muted-foreground">
              {{ ucSelecionada ? `${ucSelecionada.sigla} — ${ucSelecionada.nome}` : 'Seleciona uma unidade curricular' }}
            </p>
          </div>
        </div>
        <Badge v-if="ucSelecionada" variant="secondary" class="hidden sm:flex">
          {{ fase === 'chat' ? 'Em conversa' : 'A selecionar' }}
        </Badge>
      </div>
    </div>

    <!-- Messages Container -->
    <div
      ref="messagesContainer"
      class="flex-1 overflow-y-auto px-4 py-6"
    >
      <div class="max-w-4xl mx-auto space-y-6">
        <!-- Empty State -->
        <div v-if="!hasMessages" class="flex flex-col items-center justify-center py-12 text-center">
          <div class="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <span class="text-4xl">💬</span>
          </div>
          <h2 class="text-xl font-semibold mb-2">Bem-vindo ao Assistente de UCs</h2>
          <p class="text-muted-foreground max-w-md">
            Estou aqui para te ajudar com informações sobre as unidades curriculares. Lembra-te que o serviço tem limitações, usa-o com consciência. Começa por indicar a UC que te interessa!
          </p>
        </div>

        <!-- Messages -->
        <div
          v-for="(msg, i) in messages"
          :key="i"
          class="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-500"
          :class="msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'"
        >
          <!-- Avatar -->
          <div
            class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1"
            :class="msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'"
          >
            <span class="text-sm">{{ msg.role === 'user' ? '👤' : '🤖' }}</span>
          </div>

          <!-- Message Bubble -->
          <div
            class="flex flex-col gap-1 max-w-[85%] sm:max-w-[75%]"
            :class="msg.role === 'user' ? 'items-end' : 'items-start'"
          >
            <Card
              class="px-4 py-3 shadow-sm"
              :class="msg.role === 'user'
                ? 'bg-primary text-primary-foreground'
                : 'bg-card border'"
            >
              <p class="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {{ msg.content }}
              </p>
            </Card>
            <span class="text-xs text-muted-foreground px-1">
              {{ formatTime(msg.timestamp) }}
            </span>
          </div>
        </div>

        <!-- Typing Indicator -->
        <div v-if="isTyping" class="flex gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div class="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-1">
            <span class="text-sm">🤖</span>
          </div>
          <Card class="px-4 py-3 bg-card border shadow-sm">
            <div class="flex gap-1">
              <div class="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style="animation-delay: 0ms"></div>
              <div class="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style="animation-delay: 150ms"></div>
              <div class="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style="animation-delay: 300ms"></div>
            </div>
          </Card>
        </div>
      </div>
    </div>

    <!-- Input Area -->
    <div class="border-t bg-card/50 backdrop-blur-sm sticky bottom-0">
      <div class="max-w-4xl mx-auto px-4 py-4">
        <form @submit.prevent="sendMessage" class="flex gap-2">
          <Input
            v-model="userInput"
            placeholder="Escreve a tua mensagem..."
            class="flex-1 h-11"
            :disabled="loading"
          />
          <Button
            type="submit"
            :disabled="loading || !userInput.trim()"
            class="h-11 px-6"
          >
            <span v-if="!loading">Enviar</span>
            <span v-else class="flex items-center gap-2">
              <span class="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
              A enviar
            </span>
          </Button>
        </form>
        <p class="text-xs text-muted-foreground text-center mt-2">
          {{ ucSelecionada ? 'Podes escrever "mudar de UC" para selecionar outra unidade' : 'Indica o nome ou sigla da UC' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-4px);
  }
}

.animate-bounce {
  animation: bounce 1s infinite;
}
</style>
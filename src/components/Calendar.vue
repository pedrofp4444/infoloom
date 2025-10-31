<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, List, Filter, BarChart3, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import disciplinasData from '../../public/data/ucs.json'
import { useFavoritesStore } from '@/stores/useFavoritesStore'

type Disciplina = {
  slug: string
  nome: string
  avaliacoes: Array<{
    data: string
    descricao: string
  }>
}

const disciplinasComAvaliacoes = disciplinasData.filter(
  (d: any) => d.avaliacoes && d.avaliacoes.length > 0
) as Disciplina[]

type Avaliacao = {
  data: string
  descricao: string
  disciplina?: string
  slug?: string
}

const disciplinasSelecionadas = ref<Record<string, boolean>>(
  Object.fromEntries(disciplinasComAvaliacoes.map(d => [d.slug, true]))
)

let favoritesStore: any = null

const favoritasOnly = ref(false)
const _ignoreFavoritasWatcher = ref(false)

const getFavsArray = () => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('favorites')
      if (stored) {
        try {
          const arr = JSON.parse(stored)
          if (Array.isArray(arr)) return arr
        } catch (e) {
          // fallback for store below
        }
      }
    }

    if (!favoritesStore && typeof window !== 'undefined') favoritesStore = useFavoritesStore()
    if (!favoritesStore) return []
    // favorites is a Set stored in the Pinia store (or a ref holding a Set)
    const fv = favoritesStore.favorites?.value ?? favoritesStore.favorites ?? []
    return Array.from(fv)
  } catch (e) {
    // if Pinia not ready yet - do nothing, fallback keeps all selected
    return []
  }
}

const applyFavoritasSelection = (enable: boolean) => {
  const favsArray = getFavsArray()
  if (enable) {
    if (favsArray.length === 0) return

    disciplinasSelecionadas.value = Object.fromEntries(
      disciplinasComAvaliacoes.map(d => [d.slug, favsArray.includes(d.slug)])
    )
  } else {
    disciplinasSelecionadas.value = Object.fromEntries(
      disciplinasComAvaliacoes.map(d => [d.slug, true])
    )
  }
}

onMounted(() => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('favorites')
      if (stored) {
        try {
          const arr = JSON.parse(stored)
          if (Array.isArray(arr) && arr.length > 0) {
            favoritasOnly.value = true
            disciplinasSelecionadas.value = Object.fromEntries(
              disciplinasComAvaliacoes.map(d => [d.slug, arr.includes(d.slug)])
            )
          }
        } catch (e) {
          // ignore and fallback to store below
        }
      }
    }

    favoritesStore = useFavoritesStore()
    watch(
      () => Array.from(favoritesStore.favorites?.value ?? favoritesStore.favorites ?? []),
      () => {
        if (favoritasOnly.value) applyFavoritasSelection(true)
      },
      { deep: true }
    )
  } catch (e) {
    // if Pinia not ready yet - do nothing, fallback keeps all selected
  }
})

watch(favoritasOnly, (val) => {
  if (_ignoreFavoritasWatcher.value) return
  applyFavoritasSelection(val)
})

const viewMode = ref<'calendar' | 'list' | 'heatmap'>('calendar')
const currentDate = ref(new Date())
const filterOpen = ref(false)
const selectedDate = ref<Date | null>(null)
const dialogOpen = ref(false)

const avaliacoes = computed(() => {
  const todas: Avaliacao[] = []
  disciplinasComAvaliacoes.forEach((disciplina) => {
    if (disciplinasSelecionadas.value[disciplina.slug]) {
      disciplina.avaliacoes.forEach((avaliacao: any) => {
        todas.push({
          ...avaliacao,
          disciplina: disciplina.nome,
          slug: disciplina.slug,
        })
      })
    }
  })
  return todas.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
})

const disciplinasFiltradas = computed(() => {
  return disciplinasComAvaliacoes.filter((d) =>
    disciplinasSelecionadas.value[d.slug]
  )
})

const totalSelecionadas = computed(() => {
  return Object.values(disciplinasSelecionadas.value).filter(v => v).length
})

const estatisticasMes = computed(() => {
  const mesAtual = currentDate.value.getMonth()
  const anoAtual = currentDate.value.getFullYear()
  const avaliacoesDoMes = avaliacoes.value.filter((a) => {
    const dataAvaliacao = new Date(a.data + 'T00:00:00')
    return dataAvaliacao.getMonth() === mesAtual && dataAvaliacao.getFullYear() === anoAtual
  })

  const porDisciplina = new Map<string, number>()
  avaliacoesDoMes.forEach((a) => {
    const slug = a.slug || ''
    porDisciplina.set(slug, (porDisciplina.get(slug) || 0) + 1)
  })

  return {
    total: avaliacoesDoMes.length,
    porDisciplina,
  }
})

const todasSelecionadas = computed<boolean>({
  get() {
    return totalSelecionadas.value === disciplinasComAvaliacoes.length
  },
  set(newValue: boolean) {
    disciplinasSelecionadas.value = Object.fromEntries(
      disciplinasComAvaliacoes.map(d => [d.slug, newValue])
    )
    if (!newValue) {
      _ignoreFavoritasWatcher.value = true
      favoritasOnly.value = false
      nextTick(() => {
        _ignoreFavoritasWatcher.value = false
      })
    }
    if (newValue) {
      _ignoreFavoritasWatcher.value = true
      favoritasOnly.value = true
      nextTick(() => {
        _ignoreFavoritasWatcher.value = false
      })
    }
  }
})

const algumasSelecionadas = computed(() => {
  return totalSelecionadas.value > 0 && totalSelecionadas.value < disciplinasComAvaliacoes.length
})

const getCorDisciplina = (slug: string) => {
  const cores = ['bg-chart-1', 'bg-chart-2', 'bg-chart-3', 'bg-chart-4', 'bg-chart-5']
  const index = disciplinasComAvaliacoes.findIndex((d) => d.slug === slug)
  return cores[index % cores.length]
}

const formatarData = (dataStr: string) => {
  const data = new Date(dataStr + 'T00:00:00')
  return data.toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const formatarDataRelativa = (dataStr: string): string => {
  const hojeRaw = new Date()
  const hoje = new Date(hojeRaw.getFullYear(), hojeRaw.getMonth(), hojeRaw.getDate())
  const data = new Date(dataStr + 'T00:00:00')

  const deltaMs = data.getTime() - hoje.getTime()
  const deltaDias = deltaMs / (1000 * 60 * 60 * 24)

  if (deltaDias == -1) return 'ontem'
  if (deltaDias == 0) return 'hoje'
  if (deltaDias == 1) return 'amanhã'

  const absDias = Math.abs(deltaDias)
  let unidade = ''
  let valor = 0

  if (absDias < 7) {
    unidade = 'dia'
    valor = Math.round(absDias)
  } else if (absDias < 30) {
    unidade = 'semana'
    valor = Math.round(absDias / 7)
  } else if (absDias < 365) {
    unidade = 'mês'
    valor = Math.round(absDias / 30)
  } else {
    unidade = 'ano'
    valor = Math.round(absDias / 365)
  }

  if (unidade === 'mês' && valor > 1) unidade = 'meses'
  else if (valor > 1) unidade += 's'

  return deltaDias < 0 ? `há ${valor} ${unidade}` : `daqui a ${valor} ${unidade}`
}

const agruparPorMes = (lista: Avaliacao[]) => {
  const grupos: Record<string, Avaliacao[]> = {}
  lista.forEach((avaliacao) => {
    const data = new Date(avaliacao.data + 'T00:00:00')
    const mesAno = data.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' })
    if (!grupos[mesAno]) grupos[mesAno] = []
    grupos[mesAno].push(avaliacao)
  })
  return grupos
}

const avaliacoesPorMes = computed(() => agruparPorMes(avaliacoes.value))

const getDaysInMonth = (date: Date) => {
  const y = date.getFullYear()
  const m = date.getMonth()
  return new Date(y, m + 1, 0).getDate()
}

const getFirstDayOfMonth = (date: Date) => {
  const y = date.getFullYear()
  const m = date.getMonth()
  const firstDay = new Date(y, m, 1).getDay()
  return firstDay === 0 ? 6 : firstDay - 1
}

const getAvaliacoesForDate = (date: Date) => {
  const dateStr = date.toISOString().split('T')[0]
  return avaliacoes.value.filter((a) => a.data === dateStr)
}

const handleDayClick = (date: Date) => {
  const avals = getAvaliacoesForDate(date)
  if (avals.length > 0) {
    selectedDate.value = date
    dialogOpen.value = true
  }
}

const previousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const nextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const goToToday = () => {
  currentDate.value = new Date()
}

const calendarDays = computed(() => {
  const daysInMonth = getDaysInMonth(currentDate.value)
  const firstDay = getFirstDayOfMonth(currentDate.value)
  const days: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(new Date(currentDate.value.getFullYear(), currentDate.value.getMonth(), d))
  }
  return days
})

const semesterHeatmapData = computed(() => {
  const hoje = new Date()
  const anoBase = hoje.getMonth() >= 8 ? hoje.getFullYear() : hoje.getFullYear() - 1
  const startDate = new Date(anoBase, 8, 1)
  const endDate = new Date(anoBase + 1, 1, 28)

  const weeks: Array<{ startDate: Date; endDate: Date; days: (Date | null)[] }> = []

  const currentWeekStart = new Date(startDate)
  const dayOfWeek = currentWeekStart.getDay()
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  currentWeekStart.setDate(currentWeekStart.getDate() + daysToMonday)

  while (currentWeekStart <= endDate) {
    const weekDays: (Date | null)[] = []
    const weekStart = new Date(currentWeekStart)
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart)
      day.setDate(day.getDate() + i)
      if (day >= startDate && day <= endDate) weekDays.push(day)
      else weekDays.push(null)
    }
    const weekEnd = new Date(currentWeekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    weeks.push({ startDate: weekStart, endDate: weekEnd, days: weekDays })
    currentWeekStart.setDate(currentWeekStart.getDate() + 7)
  }

  const maxAvaliacoes = Math.max(
    ...weeks.flatMap((week) => week.days.map((date) => (date ? getAvaliacoesForDate(date).length : 0))),
    1,
  )

  return { weeks, maxAvaliacoes }
})

const getHeatmapIntensity = (count: number, max: number) => {
  if (count === 0) return 'bg-muted'
  const intensity = count / max
  if (intensity <= 0.25) return 'bg-chart-1/30'
  if (intensity <= 0.5) return 'bg-chart-1/50'
  if (intensity <= 0.75) return 'bg-chart-1/70'
  return 'bg-chart-1'
}

const isToday = (date: Date | null) => {
  if (!date) return false
  const hoje = new Date()
  return (
    date.getDate() === hoje.getDate() &&
    date.getMonth() === hoje.getMonth() &&
    date.getFullYear() === hoje.getFullYear()
  )
}

const formatWeekRange = (startDate: Date, endDate: Date) => {
  const start = startDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
  const end = endDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short' })
  return `${start} - ${end}`
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      <div class="flex items-center gap-2 flex-wrap">
        <Button :variant="viewMode === 'calendar' ? 'default' : 'outline'" size="sm" @click="viewMode = 'calendar'" class="flex-1 sm:flex-none">
          <Calendar class="h-4 w-4 sm:mr-2" />
          <span class="hidden sm:inline">Calendário</span>
        </Button>

        <Button :variant="viewMode === 'list' ? 'default' : 'outline'" size="sm" @click="viewMode = 'list'" class="flex-1 sm:flex-none">
          <List class="h-4 w-4 sm:mr-2" />
          <span class="hidden sm:inline">Lista</span>
        </Button>

        <Button :variant="viewMode === 'heatmap' ? 'default' : 'outline'" size="sm" @click="viewMode = 'heatmap'" class="flex-1 sm:flex-none">
          <BarChart3 class="h-4 w-4 sm:mr-2" />
          <span class="hidden sm:inline">Heatmap</span>
        </Button>

        <Button v-if="viewMode === 'calendar'" variant="outline" size="sm" @click="goToToday" class="flex-1 sm:flex-none bg-transparent">Hoje</Button>
      </div>

      <Sheet v-model:open="filterOpen">
        <SheetTrigger as-child>
            <Button variant="outline" size="sm" class="lg:hidden bg-transparent">
            <Filter class="h-4 w-4 mr-2" />
            Filtros ({{ totalSelecionadas }})
            </Button>
        </SheetTrigger>

        <SheetContent side="left" class="w-[300px] sm:w-[400px] p-4">
          <SheetHeader>
            <SheetTitle>Filtrar Disciplinas</SheetTitle>
          </SheetHeader>
          <div class="mt-6">
            <div class="space-y-4">
              <div class="flex items-center space-x-2 pb-3 border-b">
                <Checkbox
                  id="todas"
                  v-model="todasSelecionadas"
                  :indeterminate="algumasSelecionadas"
                />
                <label for="todas" class="text-sm font-medium leading-none cursor-pointer">
                  Todas as disciplinas
                </label>
              </div>

              <div class="flex items-center space-x-2 py-3 border-b">
                <Checkbox
                  id="favoritas"
                  v-model="favoritasOnly"
                />
                <label for="favoritas" class="text-sm font-medium leading-none cursor-pointer">
                  Disciplinas favoritas
                </label>
              </div>

              <ScrollArea class="h-[400px] pr-4">
                <div class="space-y-3">
                  <div
                    v-for="disciplina in disciplinasComAvaliacoes"
                    :key="disciplina.slug"
                    class="flex items-start space-x-2"
                  >
                    <Checkbox
                      :id="disciplina.slug"
                      v-model="disciplinasSelecionadas[disciplina.slug]"
                    />
                    <label
                      :for="disciplina.slug"
                      class="text-sm leading-tight cursor-pointer flex-1"
                    >
                      <div class="flex items-center gap-2">
                        <div :class="`w-3 h-3 rounded-full ${getCorDisciplina(disciplina.slug)}`" />
                        <span>{{ disciplina.nome }}</span>
                      </div>
                      <span class="text-xs text-muted-foreground block mt-1">
                        {{ disciplina.avaliacoes.length }}
                        {{ disciplina.avaliacoes.length === 1 ? 'avaliação' : 'avaliações' }}
                        <span v-if="(estatisticasMes.porDisciplina.get(disciplina.slug) || 0) > 0">
                          • {{ estatisticasMes.porDisciplina.get(disciplina.slug) }} este mês
                        </span>
                      </span>
                    </label>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>

    <div class="grid gap-6 lg:grid-cols-[300px_1fr] xl:grid-cols-[340px_1fr]">
      <Card class="hidden lg:block w-full max-w-xs xl:max-w-sm">
        <CardHeader class="pb-3">
          <CardTitle class="text-lg">Filtrar Disciplinas</CardTitle>
        </CardHeader>
        <CardContent class="p-0">
          <div class="p-6 pb-0 space-y-4 h-full flex flex-col">
            <div class="flex items-center space-x-2 pb-3 border-b">
              <Checkbox
                id="todas-lg"
                v-model="todasSelecionadas"
                :indeterminate="algumasSelecionadas"
              />
              <label for="todas-lg" class="text-sm font-medium leading-none cursor-pointer">
                Todas as disciplinas
              </label>
            </div>

            <div class="flex items-center space-x-2 py-3 border-b">
              <Checkbox
                id="favoritas-lg"
                v-model="favoritasOnly"
              />
              <label for="favoritas-lg" class="text-sm font-medium leading-none cursor-pointer">
                Disciplinas favoritas
              </label>
            </div>

            <ScrollArea class="flex-1 pr-4 -mx-6 px-6">
              <div class="space-y-3 pb-6">
                <div
                  v-for="disciplina in disciplinasComAvaliacoes"
                  :key="disciplina.slug"
                  class="flex items-start space-x-2"
                >
                  <Checkbox
                    :id="`lg-${disciplina.slug}`"
                    v-model="disciplinasSelecionadas[disciplina.slug]"
                  />
                  <label
                    :for="`lg-${disciplina.slug}`"
                    class="text-sm leading-tight cursor-pointer flex-1"
                  >
                    <div class="flex items-center gap-2">
                      <div :class="`w-3 h-3 rounded-full ${getCorDisciplina(disciplina.slug)}`" />
                      <span>{{ disciplina.nome }}</span>
                    </div>
                    <span class="text-xs text-muted-foreground block mt-1">
                      {{ disciplina.avaliacoes.length }}
                      {{ disciplina.avaliacoes.length === 1 ? 'avaliação' : 'avaliações' }}
                      <span v-if="(estatisticasMes.porDisciplina.get(disciplina.slug) || 0) > 0">
                        • {{ estatisticasMes.porDisciplina.get(disciplina.slug) }} este mês
                      </span>
                    </span>
                  </label>
                </div>
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>

      <div class="space-y-4">
        <Card v-if="viewMode === 'calendar'">
          <CardHeader>
            <div class="flex items-center justify-between">
              <Button variant="ghost" size="icon" @click="previousMonth">
                <ChevronLeft class="h-4 w-4" />
              </Button>

              <div class="flex flex-col items-center">
                <CardTitle class="text-sm sm:text-lg capitalize">
                  {{ currentDate.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' }) }}
                </CardTitle>
                <p v-if="estatisticasMes.total > 0" class="text-xs text-muted-foreground mt-1">
                  {{ estatisticasMes.total }} {{ estatisticasMes.total === 1 ? 'avaliação' : 'avaliações' }}
                </p>
              </div>

              <Button variant="ghost" size="icon" @click="nextMonth">
                <ChevronRight class="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent>
            <div class="space-y-4">
              <div class="grid grid-cols-7 gap-1 sm:gap-2">
                <div v-for="day in ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']" :key="day"
                     class="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2">
                  {{ day }}
                </div>
              </div>

              <div class="grid grid-cols-7 gap-1 sm:gap-2">
                <div v-for="(date, index) in calendarDays" :key="index">
                  <template v-if="!date">
                    <div class="aspect-square" />
                  </template>

                  <template v-else>
                    <div
                      @click="handleDayClick(date)"
                      :class="[
                        'aspect-square border rounded-lg p-1 sm:p-2',
                        isToday(date) ? 'border-primary border-2 bg-primary/5' : 'border-border',
                        getAvaliacoesForDate(date).length > 0 ? 'bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors' : ''
                      ]"
                    >
                      <div class="flex flex-col h-full">
                        <span :class="['text-xs sm:text-sm font-medium', isToday(date) ? 'text-primary font-bold' : 'text-foreground']">
                          {{ date.getDate() }}
                        </span>

                        <div v-if="getAvaliacoesForDate(date).length > 0"
                             class="flex-1 mt-0.5 sm:mt-1 space-y-0.5 sm:space-y-1 overflow-hidden">
                          <div class="sm:hidden flex gap-0.5 flex-wrap items-center">
                            <div v-for="(avaliacao, idx) in getAvaliacoesForDate(date).slice(0,3)" :key="idx"
                                 :class="`w-1.5 h-1.5 rounded-full ${getCorDisciplina(avaliacao.slug ?? '')}`"
                                 :title="`${avaliacao.disciplina} - ${avaliacao.descricao}`" />
                            <span v-if="getAvaliacoesForDate(date).length > 1"
                                  class="text-[10px] font-medium text-muted-foreground ml-0.5">
                              {{ getAvaliacoesForDate(date).length }}
                            </span>
                          </div>

                          <div class="hidden sm:block space-y-1">
                            <div v-for="(avaliacao, idx) in getAvaliacoesForDate(date).slice(0,3)" :key="idx"
                                 :class="`text-xs px-1 py-0.5 rounded truncate ${getCorDisciplina(avaliacao.slug ?? '')} text-white`"
                                 :title="`${avaliacao.disciplina} - ${avaliacao.descricao}`">
                              {{ avaliacao.descricao }}
                            </div>
                            <div v-if="getAvaliacoesForDate(date).length > 3"
                                 class="text-xs text-muted-foreground px-1">
                              +{{ getAvaliacoesForDate(date).length - 3 }}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </template>
                </div>
              </div>

              <div class="pt-4 border-t">
                <h4 class="text-sm font-medium mb-3">Legenda</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  <div v-for="d in disciplinasFiltradas" :key="d.slug" class="flex items-center gap-2">
                    <div :class="`w-3 h-3 rounded ${getCorDisciplina(d.slug)}`" />
                    <span class="text-xs truncate" :title="d.nome">{{ d.nome }}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card v-if="viewMode === 'heatmap'">
          <CardHeader>
            <CardTitle class="text-base sm:text-lg">Heatmap Semestral - Setembro a Fevereiro</CardTitle>
            <p class="text-xs sm:text-sm text-muted-foreground mt-1">Visão geral da carga de avaliações por semana</p>
          </CardHeader>
          <CardContent>
            <ScrollArea class="h-[600px]">
              <div class="space-y-4">
                <div class="grid grid-cols-[120px_repeat(7,1fr)] gap-1 sm:gap-2 pb-2 border-b sticky top-0 bg-card z-10">
                  <div class="text-xs sm:text-sm font-medium text-muted-foreground py-2">Semana</div>
                  <div v-for="day in ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']" :key="day"
                       class="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2">
                    {{ day }}
                  </div>
                </div>

                <div v-for="(week, weekIndex) in semesterHeatmapData.weeks" :key="weekIndex"
                     class="grid grid-cols-[120px_repeat(7,1fr)] gap-1 sm:gap-2">
                  <div class="flex items-center text-xs sm:text-sm text-muted-foreground py-2 pr-2">
                    {{ formatWeekRange(week.startDate, week.endDate) }}
                  </div>

                  <div v-for="(date, dayIndex) in week.days" :key="dayIndex">
                    <template v-if="!date">
                      <div class="aspect-square" />
                    </template>
                    <template v-else>
                      <div @click="handleDayClick(date)"
                           :title="getAvaliacoesForDate(date).length > 0
                                  ? `${date.getDate()} ${date.toLocaleDateString('pt-PT',{month:'short'})} - ${getAvaliacoesForDate(date).length} ${getAvaliacoesForDate(date).length===1?'avaliação':'avaliações'}`
                                  : `${date.getDate()} ${date.toLocaleDateString('pt-PT',{month:'short'})}`"
                           :class="[
                             'aspect-square rounded-md flex flex-col items-center justify-center transition-all',
                             getHeatmapIntensity(getAvaliacoesForDate(date).length, semesterHeatmapData.maxAvaliacoes),
                             isToday(date) ? 'ring-2 ring-primary ring-offset-1' : '',
                             getAvaliacoesForDate(date).length > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-md' : ''
                           ]">
                        <span :class="['text-[10px] sm:text-xs font-medium',
                                       getAvaliacoesForDate(date).length > 0 ? 'text-foreground' : 'text-muted-foreground',
                                       isToday(date) ? 'font-bold' : '']">
                          {{ date.getDate() }}
                        </span>
                        <span v-if="getAvaliacoesForDate(date).length > 0"
                              class="text-[10px] sm:text-xs font-bold text-foreground">
                          {{ getAvaliacoesForDate(date).length }}
                        </span>
                      </div>
                    </template>
                  </div>
                </div>
              </div>
            </ScrollArea>

            <div class="pt-4 border-t space-y-3 mt-4">
              <div>
                <h4 class="text-sm font-medium mb-2">Intensidade</h4>
                <div class="flex items-center gap-2">
                  <span class="text-xs text-muted-foreground">Menos</span>
                  <div class="flex gap-1">
                    <div class="w-6 h-6 rounded bg-muted" />
                    <div class="w-6 h-6 rounded bg-chart-1/30" />
                    <div class="w-6 h-6 rounded bg-chart-1/50" />
                    <div class="w-6 h-6 rounded bg-chart-1/70" />
                    <div class="w-6 h-6 rounded bg-chart-1" />
                  </div>
                  <span class="text-xs text-muted-foreground">Mais</span>
                </div>
              </div>

              <div>
                <h4 class="text-sm font-medium mb-2">Disciplinas</h4>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div v-for="d in disciplinasFiltradas" :key="d.slug" class="flex items-center gap-2">
                    <div :class="`w-3 h-3 rounded ${getCorDisciplina(d.slug)}`" />
                    <span class="text-xs truncate" :title="d.nome">{{ d.nome }}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card v-if="viewMode === 'list'">
          <CardHeader>
            <CardTitle class="text-base sm:text-lg">
              Próximas Avaliações ({{ avaliacoes.length }})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div v-if="avaliacoes.length === 0" class="text-center py-12 text-muted-foreground">
              <p>Nenhuma avaliação selecionada</p>
              <p class="text-sm mt-2">Seleciona disciplinas para ver as avaliações</p>
            </div>

            <ScrollArea v-else class="h-[600px] pr-4">
              <div class="space-y-8">
                <div v-for="([mes, avals], idx) in Object.entries(avaliacoesPorMes)" :key="idx">
                  <h3 class="text-base sm:text-lg font-semibold mb-4 capitalize sticky top-0 bg-card py-2">
                    {{ mes }}
                  </h3>
                  <div class="space-y-3">
                    <div v-for="(avaliacao, i) in avals"
                         :key="`${avaliacao.slug ?? ''}-${avaliacao.data}-${i}`"
                         class="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors overflow-hidden">
                      <div class="flex flex-col items-center justify-center min-w-[50px] sm:min-w-[60px] p-2 rounded-md bg-muted shrink-0">
                        <span class="text-xl sm:text-2xl font-bold">
                          {{ new Date(avaliacao.data + 'T00:00:00').getDate() }}
                        </span>
                        <span class="text-xs text-muted-foreground uppercase">
                          {{ new Date(avaliacao.data + 'T00:00:00').toLocaleDateString('pt-PT', { month: 'short' }) }}
                        </span>
                      </div>

                      <div class="flex-1 min-w-0 overflow-hidden">
                        <div class="flex items-center gap-2 mb-1">
                          <div :class="`w-2 h-2 rounded-full shrink-0 ${getCorDisciplina(avaliacao.slug ?? '')}`" />
                          <h4 class="font-medium text-sm break-words">{{ avaliacao.disciplina }}</h4>
                        </div>
                        <p class="text-sm text-muted-foreground break-words">{{ avaliacao.descricao }}</p>
                        <p class="text-xs text-muted-foreground mt-1">
                          {{ formatarData(avaliacao.data) }} - {{ formatarDataRelativa(avaliacao.data) }}
                        </p>
                      </div>

                      <Badge variant="secondary" class="shrink-0 hidden sm:inline-flex">
                        {{ avaliacao.descricao }}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>

    <Dialog v-model:open="dialogOpen">
      <DialogContent class="max-w-md sm:mx-auto">
        <DialogHeader>
          <DialogTitle>
            <span v-if="selectedDate" class="capitalize">
              {{ selectedDate.toLocaleDateString('pt-PT', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) }}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div class="space-y-3 max-h-[60vh] overflow-y-auto">
          <div v-if="selectedDate" class="space-y-4">
            <div v-for="(avaliacao, idx) in getAvaliacoesForDate(selectedDate)" :key="idx"
                 class="p-4 rounded-lg border bg-card space-y-2">
              <div class="flex items-center gap-2">
                <div :class="`w-3 h-3 rounded-full ${getCorDisciplina(avaliacao.slug ?? '')}`" />
                <h4 class="font-semibold">{{ avaliacao.disciplina }}</h4>
              </div>
              <div class="space-y-1">
                <p class="text-sm font-medium">{{ avaliacao.descricao }}</p>
                <p class="text-xs text-muted-foreground">{{ formatarData(avaliacao.data) }}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  </div>
</template>
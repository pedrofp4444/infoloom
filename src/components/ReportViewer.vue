<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { ArrowLeft, Calendar, Menu, ChevronRight, X, AlertTriangle } from 'lucide-vue-next'
import { cn } from '@/lib/utils'
import { marked } from 'marked'
import { gfmHeadingId } from 'marked-gfm-heading-id'

interface ReportMetadata {
    title: string
    date: string
    description: string
    author: {
        name: string
        avatar: string
    }
    warning?: string
}

interface TOCItem {
    id: string
    text: string
    level: number
}

interface Props {
    slug: string
    initialMetadata?: ReportMetadata
}

const emptyMetadata: ReportMetadata = {
    title: '',
    date: '',
    description: '',
    author: { name: '', avatar: '' },
    warning: ''
}

const props = defineProps<Props>()

const metadata = ref<ReportMetadata>(props.initialMetadata || emptyMetadata)
const isHydrating = ref(!props.initialMetadata)
const content = ref<string>('')
const toc = ref<TOCItem[]>([])
const activeSection = ref<string>('')
const showWarning = ref(true)
const renderedHtml = ref<string>('')
const loading = ref(true)
const error = ref<string>('')

// Se não temos metadata nas props, carregar do reportsData
if (!metadata.value && typeof window !== 'undefined') {
    import('@/lib/reports-data').then(({ reportsData }) => {
        const reportMeta = reportsData.find((r) => r.slug === props.slug)
        if (reportMeta) {
            metadata.value = reportMeta
            console.log('Metadata carregada do reportsData:', metadata.value)
        }
    })
}

// Configurar marked com GFM
marked.use(gfmHeadingId())
marked.use({
    gfm: true,
    breaks: true,
})

const slugify = (text: string): string => {
    return text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .replace(/\s+/g, '-')
}

const generateTOC = (markdown: string): TOCItem[] => {
    const headingRegex = /^(#{1,3})\s+(.+)$/gm
    const items: TOCItem[] = []
    let match

    while ((match = headingRegex.exec(markdown)) !== null) {
        const level = match[1].length
        const text = match[2]
        const id = slugify(text)
        items.push({ id, text, level })
    }

    return items
}

const processMarkdown = async (markdownText: string) => {
    // Remover frontmatter se existir
    const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/
    const match = markdownText.match(frontmatterRegex)

    const cleanMarkdown = match ? match[2] : markdownText
    content.value = cleanMarkdown

    // Gerar TOC
    toc.value = generateTOC(cleanMarkdown)

    // Renderizar markdown
    const html = await marked.parse(cleanMarkdown)

    // Adicionar IDs aos headings
    const parser = new DOMParser()
    const doc = parser.parseFromString(html, 'text/html')

    const headings = doc.querySelectorAll('h1, h2, h3')
    headings.forEach((heading) => {
        const text = heading.textContent || ''
        const id = slugify(text)
        heading.id = id
    })

    // Wrap tables para scroll horizontal
    const tables = doc.querySelectorAll('table')
    tables.forEach((table) => {
        const wrapper = doc.createElement('div')
        wrapper.className = 'overflow-x-auto'
        table.parentNode?.insertBefore(wrapper, table)
        wrapper.appendChild(table)
    })

    renderedHtml.value = doc.body.innerHTML
}

const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
        const offset = 100 // Offset para o header sticky
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - offset

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        })
        activeSection.value = id
    }
}

const goBack = () => {
    window.history.back()
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

onMounted(async () => {
    try {
        loading.value = true

        if (!props.initialMetadata) {
            const { reportsData } = await import('@/lib/reports-data')
            const reportMeta = reportsData.find((r) => r.slug === props.slug)
            if (reportMeta) metadata.value = reportMeta
        }

        const response = await fetch(`/reports/${props.slug}.md`)
        if (!response.ok) throw new Error('Relatório não encontrado')

        const markdownText = await response.text()
        await processMarkdown(markdownText)
    } catch (err) {
        console.error('Erro ao carregar relatório:', err)
        error.value = 'Não foi possível carregar o relatório'
    } finally {
        loading.value = false
        isHydrating.value = false
    }
})

</script>

<template>
    <div class="min-h-screen">
        <!-- Header -->
        <div class="border-b sticky top-0 z-10 bg-white dark:bg-zinc-950">
            <div class="container mx-auto px-4 py-4">
                <div class="flex items-center justify-between gap-4">
                    <Button variant="ghost" size="sm" @click="goBack">
                        <ArrowLeft class="mr-2 h-4 w-4" />
                        Voltar
                    </Button>

                    <!-- Mobile TOC -->
                    <Sheet v-if="!loading && toc.length > 0">
                        <SheetTrigger as-child>
                            <Button variant="outline" size="sm" class="md:hidden bg-transparent">
                                <Menu class="h-4 w-4 mr-2" />
                                Índice
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" class="w-80 px-4">
                            <SheetHeader>
                                <SheetTitle>Índice</SheetTitle>
                            </SheetHeader>
                            <ScrollArea class="h-[calc(100vh-8rem)] mt-4">
                                <nav class="space-y-1 px-2 md:px-0">
                                    <h3
                                        class="font-semibold mb-3 text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                        Conteúdo
                                    </h3>
                                    <button v-for="item in toc" :key="item.id" @click="scrollToSection(item.id)" :class="cn(
                                        'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                        activeSection === item.id && 'bg-zinc-100 dark:bg-zinc-800 font-medium',
                                        item.level === 2 && 'pl-6',
                                        item.level === 3 && 'pl-9'
                                    )">
                                        <span class="flex items-center gap-2">
                                            <ChevronRight v-if="activeSection === item.id" class="h-3 w-3" />
                                            {{ item.text }}
                                        </span>
                                    </button>
                                </nav>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>
            </div>
        </div>

        <!-- Error State -->
        <div v-if="error" class="container mx-auto px-4 py-8 flex items-center justify-center">
            <Card class="p-8 text-center max-w-md">
                <h2 class="text-2xl font-bold mb-2">Erro ao carregar</h2>
                <p class="text-zinc-500 dark:text-zinc-400 mb-4">{{ error }}</p>
                <Button @click="goBack">
                    <ArrowLeft class="mr-2 h-4 w-4" />
                    Voltar aos Relatórios
                </Button>
            </Card>
        </div>

        <!-- Content -->
        <div v-else class="container mx-auto px-4 py-8 max-w-7xl">
            <div class="flex gap-8">
                <!-- Desktop TOC -->
                <aside v-if="!loading && toc.length > 0" class="hidden md:block w-64 flex-shrink-0">
                    <div class="sticky top-24">
                        <Card class="p-4">
                            <ScrollArea class="h-[calc(100vh-12rem)]">
                                <nav class="space-y-1">
                                    <h3
                                        class="font-semibold mb-3 text-sm uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                                        Conteúdo
                                    </h3>
                                    <button v-for="item in toc" :key="item.id" @click="scrollToSection(item.id)" :class="cn(
                                        'block w-full text-left px-3 py-2 rounded-md text-sm transition-colors',
                                        'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                                        activeSection === item.id && 'bg-zinc-100 dark:bg-zinc-800 font-medium',
                                        item.level === 2 && 'pl-6',
                                        item.level === 3 && 'pl-9'
                                    )">
                                        <span class="flex items-center gap-2">
                                            <ChevronRight v-if="activeSection === item.id" class="h-3 w-3" />
                                            {{ item.text }}
                                        </span>
                                    </button>
                                </nav>
                            </ScrollArea>
                        </Card>
                    </div>
                </aside>

                <!-- Main Content -->
                <main class="flex-1 min-w-0">
                    <div v-if="isHydrating" class="mb-8 animate-pulse">
                        <div class="h-8 w-3/4 bg-zinc-200 dark:bg-zinc-800 rounded mb-4"></div>
                        <div class="flex items-center gap-3 mb-4">
                            <div class="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800"></div>
                            <div class="flex flex-col gap-2">
                                <div class="w-24 h-3 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                                <div class="w-16 h-2 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
                            </div>
                        </div>
                        <div class="w-full h-3 bg-zinc-200 dark:bg-zinc-800 rounded mb-2"></div>
                        <div class="w-5/6 h-3 bg-zinc-200 dark:bg-zinc-800 rounded mb-6"></div>
                    </div>

                    <div v-else-if="metadata && metadata.author" class="mb-8">
                        <h1 class="text-4xl font-bold mb-3">{{ metadata.title }}</h1>
                        <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 mb-4">
                            <div class="flex items-center gap-3">
                                <img :src="metadata.author.avatar" :alt="metadata.author.name"
                                    class="w-10 h-10 rounded-full" />
                                <div>
                                    <p class="text-sm font-medium">{{ metadata.author.name }}</p>
                                    <p class="text-xs text-zinc-500 dark:text-zinc-400">Autor</p>
                                </div>
                            </div>
                            <div class="flex items-center gap-2 text-zinc-500 dark:text-zinc-400">
                                <Calendar class="h-4 w-4" />
                                <span class="text-sm">{{ formatDate(metadata.date) }}</span>
                            </div>
                        </div>
                        <p class="text-lg text-zinc-600 dark:text-zinc-300 mb-6">{{ metadata.description }}</p>

                        <!-- Warning Alert -->
                        <Alert v-if="metadata.warning && showWarning"
                            class="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20">
                            <AlertTriangle class="h-4 w-4 text-yellow-600 dark:text-yellow-500" />
                            <AlertDescription class="flex items-start justify-between gap-4">
                                <span class="text-yellow-800 dark:text-yellow-200 flex-1">
                                    {{ metadata.warning }}
                                </span>
                                <Button variant="ghost" size="sm"
                                    class="h-6 w-6 p-0 hover:bg-yellow-100 dark:hover:bg-yellow-900/30"
                                    @click="showWarning = false">
                                    <X class="h-4 w-4" />
                                </Button>
                            </AlertDescription>
                        </Alert>

                        <div v-else-if="metadata.warning" class="mb-6">
                            <Button variant="outline" size="sm"
                                class="border-yellow-500 text-yellow-700 hover:bg-yellow-50 dark:text-yellow-400 dark:hover:bg-yellow-950/20"
                                @click="showWarning = true">
                                <AlertTriangle class="h-4 w-4 mr-2" />
                                Mostrar aviso
                            </Button>
                        </div>

                    </div>


                    <div v-if="loading" class="flex items-center justify-center py-12">
                        <div class="text-center">
                            <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4">
                            </div>
                            <p class="text-zinc-500 dark:text-zinc-400">A carregar conteúdo...</p>
                        </div>
                    </div>

                    <!-- Markdown Content Card -->
                    <Card v-else class="p-6 md:p-8">
                        <article class="prose prose-slate dark:prose-invert max-w-none" v-html="renderedHtml"></article>
                    </Card>
                </main>
            </div>
        </div>
    </div>
</template>

<style>
/* Estilos para garantir que o prose funciona bem */
.prose {
    color: inherit;
    line-height: 1.75;
}

.prose>*+* {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
}

.prose h1 {
    font-size: 2.25em;
    font-weight: 800;
    line-height: 1.1;
    margin-top: 0;
    margin-bottom: 0.8888889em;
    color: inherit;
}

.prose h2 {
    font-size: 1.5em;
    font-weight: 700;
    line-height: 1.3333333;
    margin-top: 2em;
    margin-bottom: 1em;
    color: inherit;
}

.prose h3 {
    font-size: 1.25em;
    font-weight: 600;
    line-height: 1.6;
    margin-top: 1.6em;
    margin-bottom: 0.6em;
    color: inherit;
}

.prose h4,
.prose h5,
.prose h6 {
    font-weight: 600;
    color: inherit;
    margin-top: 1.5em;
    margin-bottom: 0.5em;
}

.prose p {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
}

.prose a {
    color: rgb(59 130 246);
    text-decoration: underline;
    font-weight: 500;
}

.prose a:hover {
    color: rgb(37 99 235);
}

.prose strong {
    font-weight: 600;
    color: inherit;
}

.prose em {
    font-style: italic;
}

.prose code {
    color: inherit;
    background-color: rgb(241 245 249);
    padding: 0.2em 0.4em;
    border-radius: 0.25rem;
    font-size: 0.875em;
    font-weight: 500;
}

.dark .prose code {
    background-color: rgb(39 39 42);
}

.prose pre {
    background-color: rgb(241 245 249);
    padding: 1.25rem;
    border-radius: 0.5rem;
    overflow-x: auto;
    margin-top: 1.75em;
    margin-bottom: 1.75em;
}

.dark .prose pre {
    background-color: rgb(39 39 42);
}

.prose pre code {
    background-color: transparent;
    padding: 0;
    border-radius: 0;
    font-size: 0.875em;
}

.prose ul,
.prose ol {
    margin-top: 1.25em;
    margin-bottom: 1.25em;
    padding-left: 1.625em;
    list-style-position: outside;
}

.prose ul {
    list-style-type: disc;
}

.prose ol {
    list-style-type: decimal;
}

.prose ul ul,
.prose ol ul {
    list-style-type: circle;
}

.prose ul ul ul,
.prose ol ul ul,
.prose ol ol ul {
    list-style-type: square;
}

.prose ol ol {
    list-style-type: lower-alpha;
}

.prose ol ol ol {
    list-style-type: lower-roman;
}

.prose li {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
    padding-left: 0.375em;
    display: list-item;
}

.prose li::marker {
    color: rgb(107 114 128);
}

.dark .prose li::marker {
    color: rgb(161 161 170);
}

.prose li>p {
    margin-top: 0.75em;
    margin-bottom: 0.75em;
}

.prose li>ul,
.prose li>ol {
    margin-top: 0.5em;
    margin-bottom: 0.5em;
}

.prose blockquote {
    font-style: italic;
    border-left: 4px solid rgb(226 232 240);
    padding-left: 1em;
    margin-top: 1.6em;
    margin-bottom: 1.6em;
    color: rgb(107 114 128);
}

.dark .prose blockquote {
    border-left-color: rgb(63 63 70);
    color: rgb(161 161 170);
}

.prose table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 2em;
    margin-bottom: 2em;
    font-size: 0.875em;
    line-height: 1.7142857;
}

.prose thead {
    border-bottom: 2px solid rgb(226 232 240);
}

.dark .prose thead {
    border-bottom-color: rgb(63 63 70);
}

.prose th {
    padding: 0.75rem 1rem;
    text-align: left;
    font-weight: 600;
    background-color: rgb(248 250 252);
    color: inherit;
}

.dark .prose th {
    background-color: rgb(24 24 27);
}

.prose td {
    padding: 0.75rem 1rem;
    border-bottom: 1px solid rgb(226 232 240);
}

.dark .prose td {
    border-bottom-color: rgb(63 63 70);
}

.prose tbody tr:last-child td {
    border-bottom: none;
}

.prose img {
    margin-top: 2em;
    margin-bottom: 2em;
    border-radius: 0.5rem;
}

.prose hr {
    border: none;
    border-top: 1px solid rgb(226 232 240);
    margin-top: 3em;
    margin-bottom: 3em;
}

.dark .prose hr {
    border-top-color: rgb(63 63 70);
}
</style>

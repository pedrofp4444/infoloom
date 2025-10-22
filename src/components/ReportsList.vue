<script setup lang="ts">
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar, AlertTriangle, ArrowRight } from 'lucide-vue-next'
import { reportsData } from '@/lib/reports-data'

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-PT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    })
}

const navigateToReport = (slug: string) => {
    window.location.href = `/reports/${slug}`
}
</script>

<template>
    <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card v-for="report in reportsData" :key="report.slug"
            class="flex flex-col hover:shadow-lg transition-shadow duration-200 overflow-hidden">
            <CardHeader class="pb-2">
                <div class="flex items-start justify-between gap-3 mb-3">
                    <CardTitle class="text-lg font-semibold leading-snug">
                        {{ report.title }}
                    </CardTitle>
                    <Badge v-if="report.warning" variant="outline"
                        class="border-yellow-500 text-yellow-600 flex items-center gap-1">
                        <AlertTriangle class="h-3 w-3" />
                        <span class="hidden sm:inline">Aviso</span>
                    </Badge>
                </div>

                <CardDescription class="text-sm text-zinc-600 dark:text-zinc-400 line-clamp-3">
                    {{ report.description }}
                </CardDescription>
            </CardHeader>

            <CardContent class="flex-1 flex flex-col justify-between pt-1">
                <div class="space-y-3 text-sm text-zinc-500 dark:text-zinc-400">
                    <div class="flex items-center gap-2">
                        <Calendar class="h-4 w-4" />
                        <span>{{ formatDate(report.date) }}</span>
                    </div>
                </div>

                <div class="mt-5 flex items-center gap-3 border-t border-zinc-200 dark:border-zinc-800 pt-3">
                    <img :src="report.author.avatar" :alt="`Avatar de ${report.author.name}`"
                        class="w-10 h-10 rounded-full object-cover border border-zinc-300 dark:border-zinc-700" />
                    <div class="flex flex-col leading-tight">
                        <span class="font-medium text-zinc-800 dark:text-zinc-100">
                            {{ report.author.name }}
                        </span>
                        <span class="text-xs text-zinc-500 dark:text-zinc-400">Autor</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter class="pt-4">
                <Button @click="navigateToReport(report.slug)" class="w-full group">
                    Ver Relatório
                    <ArrowRight class="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
            </CardFooter>
        </Card>
    </div>
</template>

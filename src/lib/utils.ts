import type { ClassValue } from "clsx";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function getPerfilColor(perfil: string): string {
    switch (perfil) {
        case "Tronco Comum":
            return "bg-primary text-primary-foreground";
        case "Criptografia e Segurança da Informação":
            return "bg-red-600 text-white";
        case "Computação Avançada":
            return "bg-indigo-500 text-white";
        case "Engenharia Internet":
            return "bg-pink-500 text-white";
        case "Sistemas de Data Warehousing":
            return "bg-yellow-500 text-black";
        case "Engenharia de Aplicações":
            return "bg-purple-500 text-white";
        case "Desenvolvimento, Validação e Manutenção de Software":
            return "bg-emerald-500 text-white";
        case "Engenharia de Linguagens":
            return "bg-cyan-500 text-black";
        case "Sistemas Distribuídos":
            return "bg-teal-500 text-white";
        case "Redes de Nova Geração":
            return "bg-pink-400 text-white";
        case "Engenharia do Conhecimento":
            return "bg-lime-500 text-black";
        case "Sistemas Inteligentes":
            return "bg-secondary text-secondary-foreground";
        case "Métodos Formais de Programação":
            return "bg-orange-500 text-white";
        case "Computação Gráfica":
            return "bg-purple-500 text-white";

        default:
            return "bg-muted text-muted-foreground";
    }
}

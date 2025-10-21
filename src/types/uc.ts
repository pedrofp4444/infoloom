export interface Avaliacao {
    data: string;
    descricao: string;
}

export interface UC {
    nome: string;
    slug: string;
    sigla: string;
    perfil: string;
    avaliacoes: Avaliacao[];
    criterios: string;
    notas?: string;
    recursos: string[];
    docentes: string[];
}

export interface ReportMetadata {
    slug: string;
    title: string;
    date: string;
    description: string;
    author: {
        name: string;
        avatar: string;
    };
    warning?: string;
}

export const reportsData: ReportMetadata[] = [
    {
        slug: "form-4year-1sem-1",
        title: "Relatório da 1º Recolha de Feedback Intermédio",
        date: "2025-10-23",
        description:
            "Relatório baseado no formulário da 1ª Recolha de Feedback Intermédio e nas perceções dos representantes dos alunos, para avaliar o progresso e identificar áreas de melhoria.",
        author: {
            name: "Pedro Pereira",
            avatar: "https://avatars.githubusercontent.com/u/109802203",
        },
        warning:
            "As referências aos dados recolhidos no formulário devem ser interpretadas com ponderação, uma vez que este é totalmente anónimo, não garante a participação de todos os alunos e não controla quem o preenche, pelo que as respostas podem estar condicionadas. Por esta razão, os dados do formulário devem ser considerados como complemento à perceção dos representantes dos alunos.",
    },
];

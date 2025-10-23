# infoloom

A static platform for clearly presenting course information for the Master’s in Computer Engineering. It displays exam dates, project deadlines, evaluation criteria, notes, resources, and instructor contacts, with filters by context and a course search feature.

## How to Use

All course data is stored in `public/data/ucs.json`. To add or update courses, simply edit this file following the structure below:

```json
[
    {
        "nome": "Aplicações e Serviços de Computação em Nuvem",
        "perfil": "Tronco Comum",
        "slug": "aplicacoes-e-servicos-de-computacao-em-nuvem",
        "avaliacoes": [
            {
                "data": "2025-11-15",
                "descricao": "Teste intermédio"
            },
            {
                "data": "2025-12-20",
                "descricao": "Trabalho prático"
            }
        ],
        "criterios": "40% teste intermédio + 60% trabalho prático",
        "notas": "Os grupos do trabalho devem ter 4 elementos.",
        "recursos": [
            "https://exemplo.edu/slides-aulas",
            "https://aws.amazon.com/documentation/",
            "https://cloud.google.com/docs/tutorials",
            "https://github.com/exemplo-codigos-nuvem"
        ],
        "docentes": [
            "João Silva (joao.silva@exemplo.edu)",
            "Maria Fernandes (maria.fernandes@exemplo.edu)"
        ]
    }
]
```

### Guidelines

- Maintain the same JSON structure for new courses.
- Ensure all dates use the format `YYYY-MM-DD`.
- Links should be valid URLs and instructors’ emails should be included in parentheses.

## Contributing

See [`CONTRIBUTING.md`](CONTRIBUTING.md) for guidelines on how to contribute.

## License

This project is licensed under the terms described in [`LICENSE`](LICENSE).

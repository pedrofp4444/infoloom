import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    try {
        const data = await request.json();
        const { pin, content } = data;

        if (pin !== import.meta.env.ADMIN_PIN) {
            return new Response(JSON.stringify({ message: "PIN Incorreto" }), {
                status: 401,
            });
        }

        const GITHUB_TOKEN = import.meta.env.GITHUB_TOKEN;
        const OWNER = import.meta.env.REPO_OWNER;
        const REPO = import.meta.env.REPO_NAME;
        const PATH = "public/data/ucs.json";

        // 1. Obter o SHA do ficheiro atual para poder fazer overwrite
        const fileRes = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
            {
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    Accept: "application/vnd.github.v3+json",
                },
            },
        );

        if (!fileRes.ok)
            throw new Error("Não foi possível obter o ficheiro do GitHub");
        const fileData = await fileRes.json();

        // 2. Enviar a atualização (Commit)
        const updateRes = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`,
            {
                method: "PUT",
                headers: {
                    Authorization: `Bearer ${GITHUB_TOKEN}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    message: "admin: manual update of ucs.json",
                    content: Buffer.from(
                        JSON.stringify(content, null, 4),
                    ).toString("base64"),
                    sha: fileData.sha,
                    branch: "main",
                }),
            },
        );

        if (updateRes.ok) {
            return new Response(
                JSON.stringify({ message: "Sucesso! O deploy foi iniciado." }),
                { status: 200 },
            );
        }

        return new Response(
            JSON.stringify({ message: "Erro ao fazer commit no GitHub" }),
            { status: 500 },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ message: "Erro interno no servidor" }),
            { status: 500 },
        );
    }
};

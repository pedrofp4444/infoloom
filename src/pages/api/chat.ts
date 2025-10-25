import type { APIRoute } from "astro";

export const POST: APIRoute = async ({ request }) => {
    try {
        const body = await request.json();

        const response = await fetch(
            "https://apifreellm.com/api/openai/v1/chat/completions",
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            },
        );

        const contentType = response.headers.get("content-type") || "";

        if (!response.ok) {
            const text = await response.text();
            return new Response(
                JSON.stringify({
                    error: `Erro ${response.status}: ${text.slice(0, 200)}`,
                }),
                { status: response.status },
            );
        }

        // Se a resposta for JSON válido
        if (contentType.includes("application/json")) {
            const data = await response.json();
            return new Response(JSON.stringify(data), {
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
            });
        }

        // Caso contrário (HTML, etc.)
        const text = await response.text();
        return new Response(
            JSON.stringify({
                error: "A API retornou um conteúdo inesperado (HTML em vez de JSON).",
                raw: text.slice(0, 200),
            }),
            { status: 502 },
        );
    } catch (err) {
        console.error(err);
        return new Response(
            JSON.stringify({ error: "Erro ao contactar a API externa." }),
            { status: 500 },
        );
    }
};

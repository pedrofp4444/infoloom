import type { APIRoute } from "astro";
import fs from "fs";
import path from "path";

export const GET: APIRoute = async () => {
    try {
        const filePath = path.join(process.cwd(), "public", "data", "ucs.json");

        const data = fs.readFileSync(filePath, "utf-8");
        const ucs = JSON.parse(data);

        const filtered = ucs.map((uc: any) => ({
            nome: uc.nome,
            perfil: uc.perfil,
            sigla: uc.sigla,
            avaliacoes: uc.avaliacoes,
        }));

        return new Response(JSON.stringify(filtered, null, 2), {
            headers: { "Content-Type": "application/json" },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: "Error reading file." }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
};

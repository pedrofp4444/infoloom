import fs from "fs";
import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    try {
        const data = fs.readFileSync(
            new URL("../../../public/data/ucs.json", import.meta.url),
            "utf-8",
        );
        return new Response(data, {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        return new Response(
            JSON.stringify({ error: "Could not read the file." }),
            { status: 500 },
        );
    }
};

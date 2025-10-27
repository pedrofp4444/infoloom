import type { APIRoute } from "astro";

export const GET: APIRoute = async () => {
    return new Response(null, {
        status: 307,
        headers: { Location: "/data/ucs.json" },
    });
};

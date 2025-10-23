import type { APIRoute } from "astro";
import { MongoClient } from "mongodb";

export const prerender = false;

const MONGODB_URI = import.meta.env.MONGODB_URI || "";

const DB_NAME = "infoloom";
const COLLECTION_NAME = "form_responses";

let cachedClient: MongoClient | null = null;

async function connectToDatabase() {
    if (cachedClient) {
        return cachedClient;
    }

    const client = new MongoClient(MONGODB_URI);
    await client.connect();
    cachedClient = client;
    return client;
}

export const POST: APIRoute = async ({ request }) => {
    try {
        const contentType = request.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
            return new Response(
                JSON.stringify({
                    error: "Content-Type deve ser application/json",
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const bodyText = await request.text();

        if (!bodyText) {
            return new Response(JSON.stringify({ error: "Body vazio" }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }

        const body = JSON.parse(bodyText);

        if (!body.formId || !body.submittedAt || !body.sections) {
            return new Response(
                JSON.stringify({
                    error: "Invalid payload structure",
                    received: body,
                }),
                {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                },
            );
        }

        const client = await connectToDatabase();
        const db = client.db(DB_NAME);
        const collection = db.collection(COLLECTION_NAME);

        const result = await collection.insertOne({
            ...body,
            createdAt: new Date(),
        });

        return new Response(
            JSON.stringify({
                success: true,
                id: result.insertedId,
            }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            },
        );
    } catch (error) {
        return new Response(
            JSON.stringify({
                error: "Internal Server Error",
                message:
                    error instanceof Error ? error.message : "Unknown error",
                stack: error instanceof Error ? error.stack : undefined,
            }),
            {
                status: 500,
                headers: { "Content-Type": "application/json" },
            },
        );
    }
};

"use server";
import { createIndexIfNecessary } from "./pinecone";
export const initialBootstrapping = async (targetIndex:string) => {
    const baseURL = process.env.PRODUCTION_URL ? `https://${process.env.PRODUCTION_URL}` : `http://localhost:${process.env.PORT}`;
    const res = await fetch(`${baseURL}/api/ingest`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ targetIndex }),
    });
    if (!res.ok) {
        throw new Error('Failed to bootstrap the app');
    }
};

export const handleBootstrapping = async (targetIndex:string) => {
    try {
        console.log('Bootstrapping successful');
        await createIndexIfNecessary(targetIndex);
        const hasVectors = await
    } catch (error) {
        console.error('Bootstrapping failed', error);
    }
}
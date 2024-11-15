import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({apiKey: process.env.PINECONE_API_KEY as string});

export async function createIndexIfNecessary(indexName: string) {
    await pinecone.createIndex(
        {
            name: indexName,
            dimension: 1024,
            spec: {
                serverless: {
                    cloud: 'aws',
                    region: 'us-east-1',
                },
            },
            waitUntilReady: true,
            suppressConflicts: true,
        }
    );

}
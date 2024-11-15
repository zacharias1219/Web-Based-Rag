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

export async function pineconeIndexHasVectors(indexName: string): Promise<boolean> {
    try{
        const targetIndex = pinecone.Index(indexName);

        const stats = await targetIndex.describeIndexStats();

        return (stats.totalRecordCount && stats.totalRecordCount > 0) ? true : false;
    } catch (error) {
        console.error('Failed to check if index has vectors', error);
        return false;
    }
}
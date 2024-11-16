"use server";
import { NextResponse } from "next/server";
import { createIndexIfNecessary, pineconeIndexHasVectors } from "./pinecone";
import path from "path";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { VoyageEmbeddings } from "@langchain/community/embeddings/voyage";
import { v4 as uuidv4 } from "uuid";
import { promises as fs } from "fs";
import { type Document } from "../types/document";

const readMetaData = async (): Promise<Document['metadata'][]> => {
    try{
        const filePath = path.resolve(process.cwd(), 'docs/db.json');
        const data = await fs.readFile(filePath, "utf8");
        const parsed = JSON.parse(data);
        return parsed.documents || [];
    }catch(error){
        console.warn("Could not read Metadata", error);
        return [];
    }
};

const flattenMetadata = (metadata: any): Document['metadata'] => {
    const flatMetadata = { ...metadata };
    if (flatMetadata.pdf) {
        if (flatMetadata.pdf.pageCount) {
            flatMetadata.totalPages = flatMetadata.pdf.pageCount;
        }
        delete flatMetadata.pdf;
    }
    if (flatMetadata.loc) {
        delete flatMetadata.loc;
    }
    return flatMetadata;
}

const isValidContent = (content: string): boolean => {
    if (!content || typeof content !== 'string') {
        return false;
    }
    const trimmed = content.trim();
    return trimmed.length > 0 && trimmed.length < 8192;
};

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
        const hasVectors = await pineconeIndexHasVectors(targetIndex);

        if(hasVectors){
            console.log('Index already has vectors');
            return NextResponse.json({ success: true }, { status: 200 });
        }

        console.log('Loading documents and metadata');

        const docsPath = path.resolve(process.cwd(), 'docs/');
        const loader = new DirectoryLoader(docsPath, {'.pdf': (filePath: string) => new PDFLoader(filePath)});

        const documents = await loader.load();

        if(documents.length === 0){
            console.warn('No PDF documents found in docs directory'); 
            return NextResponse.json({ error: 'No documents found' }, { status: 400 });
        }

        const metadata = await readMetaData();
        const validDocuments = documents.filter((doc) => isValidContent(doc.pageContent));

        validDocuments.forEach((doc) => {
            const fileMetadata = metadata.find(
                (meta) => meta.filename === path.basename(doc.metadata.source)
            );
            if (fileMetadata) {
                doc.metadata = { ...doc.metadata, ...fileMetadata, pageContent: doc.pageContent };
            }
        });

        console.log(`Found ${validDocuments.length} valid documents`);

        const splitter = new RecursiveCharacterTextSplitter({
            chunkSize: 1000,
            chunkOverlap: 200,
        });
        const splits = await splitter.splitDocuments(validDocuments);
        console.log(`Created ${splits.length} splits`);

        const BATCH_SIZE = 5;

        for (let i = 0; i < splits.length; i += BATCH_SIZE) {
            const batch = splits.slice(i, i + BATCH_SIZE);
            console.log(
                `Processing batch ${Math.floor(i / BATCH_SIZE) + 1} of ${Math.ceil(splits.length / BATCH_SIZE)}`
            );

            const validBatch = batch.filter((split) => isValidContent(split.pageContent));
            if (validBatch.length === 0) {
                console.warn('No valid splits in this batch');
                continue;
            }

            const castedBatch: Document[] = validBatch.map((split) => ({
                pageContent: split.pageContent.trim(),
                metadata: {
                    ...flattenMetadata(split.metadata as Document["metadata"]),
                    id: uuidv4(),
                    pageContent: split.pageContent.trim(),
                },
            }));

            try{
                const voyageEmbeddings = new VoyageEmbeddings({
                    apiKey: process.env.VOYAGE_API_KEY,
                    inputType: "document",
                    modelName: "voyage-law-2",
                });

                
            } catch (error) {
                console.error('Failed to ingest batch', error);
            }
        }
    } catch (error) {
        console.error('Bootstrapping failed', error);
    }
}
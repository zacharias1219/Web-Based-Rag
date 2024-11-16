"use server";
import { NextResponse } from "next/server";
import { createIndexIfNecessary, pineconeIndexHasVectors } from "./pinecone";
import path from "path";
import { DirectoryLoader } from "langchain/document_loaders/fs/directory";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
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
        const validDoucments = documents.filter((doc) => isValidContent(doc.pageContent));

        validDoucments.forEach((doc) => {
            const fileMetadata = metadata.find(
                (meta) => meta.filename === path.basename(doc.metadata.source)
            );
            if (fileMetadata) {
                doc.metadata = { ...doc.metadata, ...fileMetadata, pageContent: doc.pageContent };
            }
        });

        console.log(`Found ${validDoucments.length} valid documents`);
    } catch (error) {
        console.error('Bootstrapping failed', error);
    }
}
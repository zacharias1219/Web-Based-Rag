import { initialBootstrapping } from "@/app/services/bootstrap";
import { NextResponse } from "next/server";

export async function POST() {
    await initialBootstrapping(process.env.PINECONE_INDEX as string);

    return NextResponse.json({success: true}, {status: 200});
}